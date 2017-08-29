/**
 * @file irtPlayer_new.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @license
 * ----------------------------------------------------------------------------
 * irtPlayer, a Javascript HTML5 Audio library for comparing audio files gaplessly
 * v2.0.0
 * Licensed under the MIT license.
 * http://www.irt.de
 * ----------------------------------------------------------------------------
 * Copyright (C) 2015 Institut für Rundfunktechnik GmbH
 * http://www.irt.de
 * ----------------------------------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files ( the "Software" ), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ----------------------------------------------------------------------------
 */

/**
 * @module irtPlayer
 *
 */


/**
 * Represents AudioData class which has all the logic to control an
 * audio signal
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {string} url - URL of the audio source (with or without
 * extension).
 * @param {Object} [targetNode=ctx.destination] - The audio node to which the AudioData
 * instance shall be connected
 * @param {boolean} [checkSupportFlag=true] - Enable / disable extension
 * support for passed url (see [AudioData._checkExtension]{@link AudioData#_checkExtension})
 *
 * @fires module:irtPlayer~AudioData#audio_init
 * @fires module:irtPlayer~AudioData#audio_loaded
 * @fires module:irtPlayer~AudioData#audio_ended
 */
var AudioData = function(ctx, url, targetNode, checkSupportFlag) {
    /** @protected
     * @var {boolean} */
    this.canplay = false;
    var checkSupportFlag = checkSupportFlag || true;
    if (checkSupportFlag == true){
        var url = this._checkExtension(url);
    }
    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;
    this.url = url;

    this._playing = false;
    this._looping = true;
    this._rangeStart = 0;
    this._rangeEnd = 0;
    this._startTime = 0;
    this._startOffset = 0;

    /** @var {Object.<GainNode>} */
    this.gainNode = this.ctx.createGain();
    this.gain = this.getGain();
    var targetNode = targetNode || this.ctx.destination;
    this.gainNode.connect(targetNode);  // FF either refuses to break this connection or simply displays a no more existing connection..
}

AudioData.prototype = {

    /**
     * Create instance of new AudioBufferSource every time {@link
     * AudioData#play} is called and initialize it.
     *
     * @protected
     */
    _initBuffer: function(){
        this.audio = this.ctx.createBufferSource();
        this.audio.loop = this._looping;
        //this.audio.loop = false;  // workaround to compensate Chrome behavior. see comment in play()
        this.audio.buffer = this._buffer;
        this.audio.connect(this.gainNode);
        this.audio.loopStart = this._rangeStart;
        this.audio.loopEnd = this._rangeEnd;
        this.audio.onended = this._onendedHandler.bind(this);

        /**
         * Will be fired once the new AudioBufferSource has been
         * initilized.
         * @event module:irtPlayer~AudioData#audio_init
         */
        $(this).triggerHandler("audio_init");
    },

    /**
     * Will be called if AudioBufferSource instance has ended
     *
     * @protected
     */
    _onendedHandler: function(){
        //console.debug("Audio buffer has ended!");
        this._playing = false;
        //this._startOffset = 0;

        /**
         * Will be fired once the playback has ended
         * @event module:irtPlayer~AudioData#audio_ended
         */
        $(this).triggerHandler("audio_ended");
    },

    load: function(){
        this._loadSound(this.url);
    },

    /**
    * Start playback of audio signal
    *
    * @param {number} [pos] - Position from which the playback shall start
    * (optional)
    */
    play: function(pos){
        if ((this._playing == false) && (this.canplay)){
            this._initBuffer();
            this._startTime = this.audio.context.currentTime;
            console.debug("Start time: " + this._startTime);
            if (typeof pos != 'number'){        // detection with _.isNumber() could be more robust
                var buffer_duration = this._buffer.duration;
                var offset = (this._rangeStart + this._startOffset) % buffer_duration;
                var duration = this._rangeEnd - offset;
                console.debug("Offset: " + offset + "   Duration: " + duration);

                // Passing a duration to start() causes undefined
                // situation in current versions of Chrome. FF, Safari
                // and Opera seem to treat this situation properly. See
                // also https://github.com/WebAudio/web-audio-api/issues/421
                this.audio.start(0, offset, duration);
                //this.audio.start(0, offset);
            } else {
                console.debug("Starting playback at " + pos);
                this._startOffset = pos;
                var duration = this._rangeEnd - pos;
                this.audio.start(0, pos, duration);
            }
            // workaround to force looping in Chrome. see comment above.
            // Chrome seems to ignore looping state if duration is
            // passed. --> init() with loop = false, then set "real"
            // loop state here:
            //this.audio.loop = this._looping;
            this._playing = true;
        }
    },

    /**
     * Pause playback  - will only be executed if {@link
     * AudioData#_playing} flag is true.
     *
     */
    pause: function(){
        if (this._playing == true){
            this.audio.stop(0);
            // Measure how much time passed since the last pause.
            this._startOffset += this.audio.context.currentTime - this._startTime;
            this._playing = false;
            console.debug("Start offset: "+ this._startOffset);
        }
    },


    /**
     * Stops playback - if method is called during the playback
     * is stopped, the thrown error will be catched.
     */
    stop: function(){
        try {
            this.audio.stop(0);
            this._startOffset = 0;
            this._playing = false;
        } catch (err) {
            console.warn("Can't stop audio.. " + err);
        }
    },

    /**
     * Sets gain of {@link AudioData} instance
     *
     * @param {float} gain - Value between 0.0 and 1.0
     */
    setGain: function(gain){
        if ((gain >= 0.0) && (gain <= 1.0)){
            this.gainNode.gain.value = gain;
            this.gain = this.gainNode.gain.value;  // avoids that we accept uncompatible values
        }
        else {
            console.warn("Gain values must be between 0 and 1");
        }
    },

    /**
     * Returns current gain value of {@link AudioData} instance
     *
     * @return {float} value - Float gain value
     */
    getGain: function(){
        return this.gainNode.gain.value;  // or do we trust in this.gain ??
    },

    /**
     * Disables / enables the loop of the {@link AudioData} instance
     */
    toggleLoop: function() {
        if (this._looping == false){
            this._looping = true;
        } else {
            this._looping = false;
        }
        try {
            //this.pause();
            this.audio.loop = this._looping;
            //this.play();
        } catch (err) {
            console.warn("Can't set loop state: " + err);
        }
    },

    /**
     * Disables / enables the loop of the {@link AudioData} instance
     */
    setLoopState: function(bool) {
        this._looping = bool;
        try {
            //this.pause();
            this.audio.loop = this._looping;
            //this.play();
        } catch (err) {
            console.warn("Can't set loop state: " + err);
        }
    },

    /**
     * Sets start position for playback
     *
     * @param {float} pos  - Start playback always at passed
     * position
     */
    setRangeStart: function(pos){
        pos = parseFloat(pos);
        if (pos >= 0) {
            pos = pos;
        } else {
            pos = 0;
        }
        this._rangeStart = pos;
        try {
            this.audio.loopStart = this._rangeStart;
            console.debug("Loop start: " + pos);
        } catch (err) {
            console.warn("Can't set loop start yet.." + err);
        }
    },

    /**
     * Sets end position for playback
     *
     * @param {float} pos  - Playback end always at passed
     * position
     */
    setRangeEnd: function(pos){
        pos = parseFloat(pos);
        if (pos <= this._buffer.duration) {
            pos = pos;
        } else {
            pos = this._buffer.duration;
        }
        this._rangeEnd = pos;
        try {
            this.audio.loopEnd = this._rangeEnd;
            console.debug("Loop end: " + pos);
        } catch (err){
            console.warn("Can't set loop start yet.." + err);
        }
    },

    /**
     * Mutes {@link AudioData} instance
     */
    mute: function(){
        this.setGain(0.0);
    },

    /**
     * Unmutes {@link AudioData} instance
     */
    unmute: function(){
        this.setGain(1.0);
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} pos  - Must be between 0 and {@link
     * AudioData._rangeEnd}
     */
    setTime: function(pos){
        if ((pos >= 0) && (pos <= this._rangeEnd)){
            this.stop();
            this.play(pos);
        }
    },

    /**
     * Returns current playback position
     *
     * @return {number} value - Current playback position
     */
    getTime: function(){
        if (this._playing) {
            return this.audio.context.currentTime - this._startTime + this._startOffset;
        } else {
            return this._startOffset;
        }
    },

    /**
    * Disconnects and reconnects {@link AudioData} instance to passed
    * AudioNode(s)
    *
    * @param {...Object} nodes - Variable number of AudioNodes to which
    * the {@link AudioData} instance shall be reconnected.
    */
    reconnect: function(nodes){
        this.disconnect();
        if (Object.prototype.toString.call(nodes) != "[object Array]"){          // == single Node
            this.gainNode.connect(nodes);
        }
        else {                                          // == array of Nodes
            for (var i=0; i < nodes.length; i++){
                this.gainNode.connect(nodes[i]);
            }
        }
    },

    /**
    * This method will disconnect the {@link AudioData} instance from
    * all connected nodes (afterwards). Should be mostly
    * ctx.destination.
    */
    disconnect: function(){
        this.gainNode.disconnect();
    },

    /**
     * Method will check whether the passed URL has an extension.
     * Additionaly, {@link AudioData#_checkSupport} will be executed to
     * identify the possible containers / codecs.
     *
     * @protected
     * @param {string} url - URL
     *
     * @return {string} src - URL including file type extension which should be
     * compatible with browser
     */
    _checkExtension: function(url){
        var supports = this._checkSupport();

        var re = /\.[0-9a-z]{3,4}$/i;   // strips the file extension (must be 3 or 4 characters)
        var ext = re.exec(url);
        if (ext == null){
            if (supports.indexOf(".opus") > -1) {
                var src = url + ".opus";
            }
            else if (supports.indexOf(".mp4") > -1) {
                var src = url + ".mp4";
            }
            /*
            else if (supports.indexOf(".m4a") > -1) {
                var src = url + ".m4a";
            }*/
            else if (supports.indexOf(".ogg") > -1) {
                var src = url + ".ogg";
            }
            else if (supports.indexOf(".mp3") > -1) {
                var src = url + ".mp3";
            }
            else if (supports.indexOf(".wav") > -1) {
                var src = url + ".wav";
            }
        } else {
            if (supports.indexOf(ext[0]) > -1){
                var src = url;
            } else {
                console.error("ERROR: Your browser does not support the needed audio codec (" + ext[0] + ")!");
                var src = "";
            }
        }
        return src
    },

    /**
     * Detects whether the browser can play one of the listed containers
     * / codecs
     *
     * @protected
     * @return {string[]} support - An array containing all compatible
     * formats
     */
    _checkSupport: function (){
        var supports = [];
        if (document.createElement('audio').canPlayType("audio/ogg codecs=opus") != ""){
            supports.push(".opus");
        }
        if (document.createElement('audio').canPlayType("audio/ogg") != ""){
            supports.push(".ogg");
        }
        if (document.createElement('audio').canPlayType("audio/x-wav") != ""){
            supports.push(".wav");
        }
        if (document.createElement('audio').canPlayType("audio/mpeg") != ""){
            supports.push(".mp3");
        }
        if (document.createElement('audio').canPlayType('audio/mp4') != ""){
            supports.push(".mp4");
        }
        if (document.createElement('audio').canPlayType('audio/mp4; codecs="mp4a.40.5"') != ""){
            supports.push(".m4a");
        }
        console.debug("Your browser seems to support these containers: " + supports);
        return supports;
    },

    /**
     * Load passed audio signal
     *
     * @protected
     * @param {string} url - URL
     */
    _loadSound: function(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        var that = this;
        request.onload = function() {
            that.ctx.decodeAudioData(request.response, function(buffer) {
                that._buffer = buffer;
                that.canplay = true;
                that._rangeEnd = that._buffer.duration;
                that.duration = that._buffer.duration;
                console.debug("audio loaded & decoded!");

                /**
                 * Will be fired if the audio data has been loaded &
                 * decoded
                 * @event module:irtPlayer~AudioData#audio_loaded
                 */
                $(that).triggerHandler("audio_loaded");
            });
        };
        request.send();
    }
}


/**
 * Represents Controller class which has all the logic to control an
 * array of {@link AudioData} instances
 *
 * @constructor
 *
 * @param {Object} [ctx] - An AudioContext instance.
 * @param {string[]} [sounds] - Array with list of URLs of the audio sources (with or without
 * extension).
 * @param {boolean} [checkSupportFlag=true] - Enable / disable extension
 * support for passed url (see [AudioData._checkExtension]{@link AudioData#_checkExtension})
 *
 * @fires module:irtPlayer~IRTPlayer#player_ready
 * @fires module:irtPlayer~IRTPlayer#player_ended
 */
var IRTPlayer = function(ctx, sounds, checkSupportFlag){
    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }

    var checkSupportFlag = typeof checkSupportFlag !== 'undefined' ? checkSupportFlag : true;
    this._checkSupport = checkSupportFlag;
    this.ctx = ctx;

    /**
     * @description Flag if audio signals will be looped
     * @var {boolean} */
    this.loopingState = true;

    /**
     * @description Array of {@link AudioData} instances
     * @var {AudioData[]} */
    this.signals = [];

    /** @var {boolean} */
    this.playing = false;
    this.canplay = false;
    this.init(sounds);

    /**
     * @description Global volume for all {@link AudioData} instances
     * @var {float} */
    this.vol = 1.0;

    /**
     * @description Has array entry integer of currently active file.
     * See {@link IRTPlayer#muteOthers} or  {@link IRTPlayer#attenuateOthers}
     * @var {integer}
     */
    this.activeSignal = null;
    //this.muteOthers(0);
    this._loaded_counter = 0;
    this._ended_counter = 0;
    }

IRTPlayer.prototype = {

    /**
     * Adds all audio signals of passed array to the player
     *
     * @param {string[]} sounds - Array of URLs
     */
    init: function(sounds){
        if (typeof sounds != "undefined"){
            for (var i=0; i < sounds.length; i++) {
                //this.signals[i] = new AudioData(this.ctx, sounds[i]); // can be also used to reset tracks array
                this.addURL(sounds[i]);
            }

            // we must bind the event listeners here, because within
            // addURL() it would fulfilled every time the event would
            // be triggered, since the signals[] array does not yet
            // contain all signals during addURL() calls here..
            /*
            for (var i=0; i < this.signals.length; i++){
                this._addEventListener(this.signals[i]);
            }
            */
        }
        else {
            console.warn('No urls for sounds passed');
        }
    },

    /**
     * Will add audio sources manually to the {@link IRTPlayer} instance
     *
     * @param {string} url - URL of to be added audio source
     */
    addURL: function(url){
        var audio = new AudioData(this.ctx, url, this.ctx.destination, this._checkSupport);
        this.addAudioData(audio);

        // The event listener must be registered before the event trigger can be
        // created! So we call the load() method explicitely afterwards.
        audio.load();
    },

    /**
     * Will add {@link AudioData} instances to the {@link IRTPlayer} instance
     *
     * @param {AudioData} audioData - instance of to be added audio data object
     */
    addAudioData: function(audioData){
        this._addEventListener(audioData);
        audioData.setLoopState(false);
        this.signals.push(audioData);
    },

    _addEventListener: function(audioData){
        // NOTE: This is likely working only due to the delayed loading of
        // the audio files. As we all know, the event listener must be already registered
        // before the event trigger can be registered as well. So in the worst case,
        // the audio files will be loaded and decoded _before_ the listener is
        // registered which means that NO event will be triggered and received..!
        // TODO: find a good workaround for this issue!
        $(audioData).on("audio_loaded", function(){
            this._loaded_counter += 1;
            if (this._loaded_counter == this.signals.length){
                console.debug("All buffers are loaded & decoded");
                /**
                 * Will be fired to the DOM once all audio signals are loaded.
                 * This event is triggered to the DOM and not to the object instance
                 * as this would mean that the listener would have to be registered on
                 * the not yet exisiting object instance... ==> logic proplem.
                 * TODO: find alternative solution with promises, callback, etc
                 * @event module:irtPlayer~IRTPlayer#player_ready
                 */
                $(this).triggerHandler("player_ready");
                this.canplay = true;
                this.duration = this.signals[0].duration;
            }
        }.bind(this));

        $(audioData).on("audio_ended", function(){
            this._ended_counter += 1;
            if (this._ended_counter == this.signals.length){
                this.playing = false;
                console.debug("All buffers ended");
                /**
                 * Will be fired to the DOM once all audio signals are loaded.
                 * This event is triggered to the DOM and not to the object instance
                 * as this would mean that the listener would have to be registered on
                 * the not yet exisiting object instance... ==> logic proplem.
                 * TODO: find alternative solution with promises, callback, etc
                 * @event module:irtPlayer~IRTPlayer#player_ended
                 */
                $(this).triggerHandler("player_ended");
            }
        }.bind(this));
    },

    /**
     * Toggles play / pause of playback
     */
    togglePlay: function(){
        if (this.playing == false){
            this.play();
        }
        else {
            this.pause();
        }
    },

    /**
     * Starts playback of all audio sources in {@link IRTPlayer#signals}
     */
    play: function(){
        this._do('play');
        this.playing = true;
        this._do('setLoopState', this.loopingState);
        this._ended_counter = 0;
    },

    /**
     * Pauses playback of all audio sources in {@link IRTPlayer#signals}
     */
    pause: function(){
        this._do('pause');
        this.playing = false;
    },

    /**
     * Stops playback of all audio sources in {@link IRTPlayer#signals}
     */
    stop: function(){
        this._do('stop');
        this.playing = false;
        this._do("setLoopState", false);
    },

    /**
     * Will mute all audio sources of {@link IRTPlayer#signals} but the
     * one with the passed index
     *
     * @param {integer} id - Array index number of active audio source
     */
    muteOthers: function(id){
        id = parseInt(id);
        if ((id < this.signals.length) && (id >= 0)){
            this._do('mute');
            this.signals[id].unmute();
            this.activeSignal = id;
        }
        else{
            console.error("Passed array index invalid!")
        }
    },

    /**
     * Will unmute all audio sources in {@link IRTPlayer#signals}
     */
    unmuteAll: function(){
        this._do('unmute');
        this.activeSignal = null;
    },

    /**
     * Will attenuate all audio sources of {@link IRTPlayer#signals} but the
     * one with the passed index. The active one will have gain value of
     * {@link IRTPlayer#vol}
     *
     * @param {integer} id - Array index number of active audio source
     * @param {float} attenuation - Gain value for other (attenuated)
     * audio sources
     */
    attenuateOthers: function(id, attenuation){
        id = parseInt(id);
        if ((id < this.signals.length) && (id >= 0)){
            this._do('setGain', attenuation);
            this.signals[id].setGain(this.vol);
            this.activeSignal = id;
        }
        else{
            console.error("Passed array index invalid!")
        }
    },

    /**
     * Disables / enables looping of the audio sources
     */
    toggleLoop: function() {
        if (this.loopingState == false){
            this.loopingState = true;
        }
        else {
            this.loopingState = false;
        }
        this._do('toggleLoop');
    },

    /**
     * Sets start position for playback
     *
     * @param {float} pos  - Start playback always at passed
     * position for all audio sources in {@link IRTPlayer#signals}
     */
    setRangeStart: function(pos){
        console.info("Range start: " + pos);
        this._do('setRangeStart', pos);
    },

    /**
     * Sets end position for playback
     *
     * @param {float} pos  - End playback always at passed
     * position for all audio sources in {@link IRTPlayer#signals}
     */
    setRangeEnd: function(pos){
        console.info("Range end: " + pos);
        this._do('setRangeEnd', pos);
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} time  - Must be between 0 and {@link
     * AudioData#_rangeEnd}
     */
    setTime: function(time){
        this._do('setTime', time);
    },

    /**
     * Returns current position of playback
     * @return {number} pos - Current playback position
     */
    getTime: function(){
        return this.signals[0].getTime();
    },

    /**
     * Helper function to apply AudioData methods for all instances in
     * {@link IRTPlayer#signals} array
     * @param {string} func - Name of the method to be executed
     * @param {...args} args - variable number of additional arguments that
     * should be passed to the method
     * @protected
     */
    _do: function(func){
        if (arguments.length == 2){
            var args = arguments[1];    // prevents that a single argument will be passed as array with one entry
        } else {
            var args = Array.prototype.splice.call(arguments, 1);
        }
        for (var i=0; i < this.signals.length; i++){
            this.signals[i][func](args);
        }
    }
}


exports.AudioData = AudioData;
exports.IRTPlayer = IRTPlayer;
