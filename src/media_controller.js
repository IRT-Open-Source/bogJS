/*jshint esversion: 6 */
/**
 * @file media_controller.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 *
 */

var GainController = require('./gain_controller');

/**
 * Represents MediaElementController class which has all the logic to control a HTML5 media element
 * Every track / channel of the media element can be controlled separately.
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {string} mediaElement - HTML5 media element
 * @param {Number} tracks - Number of media element channels
 * @param {Object} [targetNodeList=ctx.destination] - The audio node to which the MediaElementController
 * @fires module:bogJS~MediaElementController#audio_init
 * @fires module:bogJS~MediaElementController#audio_loaded
 * @fires module:bogJS~MediaElementController#audio_ended
 */
var MediaElementController = function(ctx, mediaElement, tracks, targetNodeList) {
    /** @protected
     * @var {boolean} */
    this.canplay = false;

    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;

    this._mediaElement = mediaElement;
    this._mediaSourceNode = this.ctx.createMediaElementSource(this._mediaElement);
    this._tracks = tracks;
    this._splitter = this.ctx.createChannelSplitter(this._tracks);
    this._mediaSourceNode.connect(this._splitter);

    this.gainController = [];
    if (typeof targetNodeList === 'undefined') {
        var targetNodeList = [];
        for (var i = 0; i < this._tracks; i++){
            targetNodeList.push(this.ctx.destination);
        }
    }
    for (var i = 0; i < this._tracks; i++){
        this.gainController[i] = new GainController(this.ctx, targetNodeList[i]);

        // TODO: Workaround for wrong channel order of decoded bitstream
        this._splitter.connect(this.gainController[i].gainNode, i);
    }

    this._mediaElement.onended = function(){
        console.debug("Audio buffer has ended!");
        this._playing = false;

        /**
         * Will be fired once the playback has ended
         * @event module:bogJS~MediaElementController#audio_ended
         */
        $(this).triggerHandler("audio_ended");
    }.bind(this);

    this._mediaElement.onstalled = function(){
        console.info("Pausing playback - need to buffer more");
        this.ctx.suspend();
    }.bind(this);

    this._mediaElement.onplaying = function(){
        console.info("Resuming playback of media element");
        if (this.ctx.state === "suspended"){
            this.ctx.resume();
        }
    }.bind(this);

    this._mediaElement.oncanplaythrough = function(){
        this.canplay = true;
        console.info("Playback of media element can start");

        /**
         * Will be fired if media element playback can start
         * @event module:bogJS~MediaElementController#audio_loaded
         */
        $(this).triggerHandler('audio_loaded');
        if (this.ctx.state === "suspended"){
            this.ctx.resume();
        }
    }.bind(this);

    this._mediaElement.load();
    this._playing = false;
    this._looping = false;
}

MediaElementController.prototype = {
    /**
    * Start playback of audio signal
    *
    * @param {number} [pos] - Position from which the playback shall start
    * (optional)
    */
    play: function(pos){
        if (typeof pos != 'number'){        // detection with _.isNumber() could be more robust
            this._mediaElement.play();
        } else {
            console.debug("Starting playback at " + pos);
            this.setTime(pos);
            this._mediaElement.play()
        }
        this._playing = true;
    },

    /**
     * Pause playback.
     *
     */
    pause: function(){
        this._mediaElement.pause();
        this._playing = false;
    },

    /**
     * Stops playback.
     */
    stop: function(){
        this._mediaElement.pause();
        this._playing = false;
        this._mediaElement.currentTime = 0;
    },

    /**
     * Sets gain of {@link MediaElementController} instance
     *
     * @param {float} gain - Value between 0.0 and 1.0
     */
    setVolume: function(vol){
        this._mediaElement.volume = vol;
    },

    /**
     * Returns current gain value of {@link MediaElementController} instance
     *
     * @return {float} value - Float gain value
     */
    getVolume: function(){
        return this._mediaElement.volume;
    },

    /**
     * Disables / enables the loop of the {@link MediaElementController} instance
     */
    toggleLoop: function() {
        if (this._looping == false){
            this._looping = true;
        } else {
            this._looping = false;
        }
        this._mediaElement.loop = this._looping;
    },

    /**
     * Disables / enables the loop of the {@link MediaElementController} instance
     */
    setLoopState: function(bool) {
        this._looping = bool;
        this._mediaElement.loop = this._looping;
    },

    /**
     * Mutes {@link MediaElementController} instance
     */
    mute: function(){
        this._mediaElement.muted = true;
    },

    /**
     * Unmutes {@link MediaElementController} instance
     */
    unmute: function(){
        this._mediaElement.muted = false;
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} pos  - Must be >= 0
     */
    setTime: function(pos){
        if (pos >= 0){
            this._mediaElement.currentTime = pos;
        }
    },

    /**
     * Returns current playback position
     *
     * @return {number} value - Current playback position
     */
    getTime: function(){
        return this._mediaElement.currentTime;
    }
}

module.exports = MediaElementController;
