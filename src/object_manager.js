/**
 * @file object_manager.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

/**
 * @typedef keyframes
 * @type {object}
 * @example 
 * keyframes = {0.0: [{obj: "Cello", cmd: "position", params: [3.2, 4, 0]},
 *                    {obj: "Cembalo", cmd: "gain", params: 0.5}], 
 *              0.4: [{obj: "Cembalo", cmd: "is_present", params: 0},
 *                    {obj: "Cello", cmd: "gain", params: 1.0}], 
 *              235: [{obj: "Viola", cmd: "is_present", params: 1},
 *                    {obj: "Viola", cmd: "position", params: [0.5, 3.2, 0.5]}]};
 */

/**
 * @typedef audioURLs
 * @type {object}
 * @example 
 * audioURLs = {Cello: "http://sounds.myserver.com/Cello.ogg",
 *              Cembalo: "http://sounds.myserver.com/Cembalo.wav",
 *              Viola: "../../Viola.m4a"}
 */

/**
 * @typedef sceneInfo
 * @type {object}
 * @example 
 * sceneInfo = {name: "My fancy scene",
 *              listener_position: [0, 0, 0],
 *              listener_orientation: [0, 1, 0], 
 *              object_count: 3,
 *              room_dimensions: [10, 10, 3]}
 */

/**
 * @typedef singleObjects
 * @type {object}
 * @example 
 * singleObjects = {"70.754":["Birds1_L","Birds1_R"],
 *                  "72.0":["Birds2_L","Birds2_R"],
 *                  "79.29":["Birds3"],
 *                  "90.65":["Crows"],
 *                  "102.55":["Vulcano_L","Vulcano_R"],
 *                  "117.55":["Stones_L","Stones_R"]}
 */

/**
 * @typedef groupObjects
 * @type {object}
 * @example 
 * groupObjects = {"78.2":["Birds1_L","Birds1_R"],
 *                  "90.65":["Birds"],
 *                  "117.55":["Stones_L","Stones_R"]}
 */

/**
 * @typedef audiobeds
 * @type {object}
 * @example 
 * audiobeds =  {Bed0: "bed_0", Bed1: "bed_1", Bed2: "bed_2", Bed3: "bed_3", Bed4: "bed_4"}
 */

window.$ = require('jquery');
window._ = require('underscore');
window.log = require('loglevel');
var WAAClock = require('waaclock');
var ChannelOrderTest = require('./channelorder_test');
var AudioData = require('./html5_player/core').AudioData;
var IRTPlayer = require('./html5_player/core').IRTPlayer;
var ObjectController = require('./object');
var MediaElementController = require('./media_controller');
var SceneReader = require('./scene_reader');

/**
 * Represents ObjectManager class which has all the logic to control
 * several {@link module:bogJS~ObjectController|ObjectController} instances along with metadata
 *
 * @constructor
 *
 * @param {string} url - URL of the metadata source.
 * @param {Object} [ctx] - An AudioContext instance.
 * @param {Object} [reader] - A reader instance that has a load() method
 * and will fire a event called "scene_loaded". The event must also pass
 * {@link module:bogJS~keyframes|keyframes}, {@link module:bogJS~audioURLs|audioURLs}
 * and {@link module:bogJS~sceneInfo|sceneInfo}. See {@link
 * module:bogJS~SceneReader#load|SceneReader.load()}
 * @param {Object} [mediaElement] - A HMTL5 media element instance to be used as
 * audio bed. If passed, any potentially other given audio bed from the scene
 * file will be ignored.
 * @param {Number} [audiobed_tracks] - If mediaElement is passed, the expected 
 * channel number must be passed as well.
 * @param {String} [channelorder_root] - Path to encoded channel order detection
 * test files. See also [ChannelOrderTest]{@link module:bogJS~ChannelOrderTest} 
 * and the README.md file.
 * @fires module:bogJS~ObjectManager#om_newGain
 * @fires module:bogJS~ObjectManager#om_newPosition
 * @fires module:bogJS~ObjectManager#om_newTrackMapping
 * @fires module:bogJS~ObjectManager#om_isActive
 *
 */
var ObjectManager = function(url, ctx, reader, mediaElement, audiobed_tracks, channelorder_root){
    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }
    /**
     * Instance of Web Audio AudioContext
     * @var {Object.<AudioContext>}
     */
    this.ctx = ctx;
    
    /**
     * Instance of {@link SceneReader}
     * @var {(CustomReaderInstance|Object.<module:bogJS~SceneReader>)}
     */
    this.reader = reader || new SceneReader();
    
    this._mediaElement = mediaElement;
    this._mediaElementTracks = audiobed_tracks;
    this._channorder_root = channelorder_root;

    /**
     * Instance of {@link module:irtPlayer~IRTPlayer|IRTPlayer}
     * @var {Object.<module:irtPlayer~IRTPlayer>}
     */
    this._clock = new WAAClock(this.ctx);
    this._evts = {};
    this._audioURLs = {};
    this._currentKeyframeIndex = 0;
    this._kfMapping = {};
    this._last_kfMapping = {};

    this._audiobedTracks = {}
    this._groupObjURLs = {};
    this._singleObjURLs = {};
    this._audiobed = false;
    this._groupObjPlayers = {};
    this._singleObjAudios = {};
    this._kf_canplay = {};
   
    /**
     * Array of all {@link module:bogJS~ObjectController|ObjectController} instances that are controlled
     * by the {@link module:bogJS~ObjectManager|ObjectManager}
     * @var {module:bogJS~ObjectController[]}
     */
    this.objects = {};
    this._audioInstances = {};
    this._panningType = "equalpower";
    
    /**
     * If set to true, the ObjectManager will ignore keyframe updates!
     * @var {boolean}
     * @default false
     */
    this.interactive = false;
    this.playing = false;
    
    this._listenerOrientation = [0, 0, -1];
    this.setListenerOrientation(0, 0, -1);
    
    $(this.reader).on('scene_loaded', function(e, keyframes, audioURLs, sceneInfo, groupObjects, singleObjects, audiobeds){
        log.debug('Scene data loaded!');

        /**
         * 'Dictionary' containing keyframes + commands triplets per keyframe.
         * @abstract
         * @var {module:bogJS~keyframes}
         */
        this._keyframes = keyframes;
        
        /**
         * 'Dictionary' containing mapping for objects and URLs.
         * @abstract
         * @var {module:bogJS~audioURLs}
         */
        this._audioURLs = audioURLs;
         
        /**
         * 'Dictionary' containing additional scene info
         * @abstract
         * @var {module:bogJS~sceneInfo}
         */
        this._sceneInfo = sceneInfo;
        this.object_count = sceneInfo.object_count || 0;
        this.roomDimensions = sceneInfo.room_dimensions || [10, 10, 3];
        this._listenerPosition = sceneInfo.listener_position || [0, 0, 0];
        
        /**
         * 'Dictionary' containing mapping for objects and audiobed tracks
         * @abstract
         * @var {module:bogJS~audiobeds}
         */
        this._audiobedTracks = audiobeds;
        
        /**
         * 'Dictionary' containing info to identify grouped objects
         * @abstract
         * @var {module:bogJS~groupObjects}
         */
        this._groupObjURLs = groupObjects;        
        
        /**
         * 'Dictionary' containing info to identify single objects
         * @abstract
         * @var {module:bogJS~singleObjects}
         */
        this._singleObjURLs = singleObjects;

        this.init();
    }.bind(this));
    this.reader.load(url);
}

ObjectManager.prototype = {
    
    /**
     * Creates [AudioData]{@link module:irtPlayer~AudioData} and 
     * [ObjectController]{@link module:bogJS~ObjectController} instances and 
     * adds the AudioData instances to the {@link module:bogJS~ObjectManager#player}
     */
    init: function(){
        if (typeof this._mediaElement !== 'undefined'){
            this._audiobed = new MediaElementController(this.ctx, this._mediaElement, this._mediaElementTracks);
        } else if (this._sceneInfo.audiobed_url){
            var a = document.createElement("audio");
            var src = this._sceneInfo.audiobed_url;
            if (/\.[0-9a-z]{3,4}$/i.exec(src) === null){  // if no file extension is stated
                if (a.canPlayType('audio/ogg codecs=opus')) {
                    a.type= 'audio/ogg codecs=opus';
                    src = src + '.opus';
                } else {
                    a.type = 'audio/mp4';
                    src = src + '.mp4';
                }
            }
            a.src = src;
            this._mediaElementTracks = parseInt(this._sceneInfo.audiobed_tracks);
            this._audiobed = new MediaElementController(this.ctx, a, this._mediaElementTracks);
        }
        if (this._audiobed !== false){
            // If there is an audiobed, we can trigger the om_ready event even 
            // though other keyframe assets are not yet ready. We need to trigger
            // the event here in case NO other assets are used.
            // This is for sure not really a sophisticated way to solve this but it 
            // should work. In the worst case, the playback will pause again if 
            // the assets are not yet loaded and decoded.
            $(this._audiobed).on('audio_loaded', function(){
                $(document).triggerHandler('om_ready');
                log.debug('Audiobed ready for playback');
            }.bind(this));
            $(this._audiobed).on('audio_ended', function(){
                $(document).triggerHandler('om_ended');
                om.stop();
            }.bind(this));
            var url = this._audiobed._mediaElement.src;
            var re = /\.[0-9a-z]{3,4}$/i;  // strips the file extension (must be 3 or 4 characters)
            var container = re.exec(url)[0];
            container = container.split('.').join(""); // removes dot from the string
            var chOrderTest = new ChannelOrderTest(container, this._mediaElementTracks, this.ctx, this._channorder_root);
            $(chOrderTest).on('order_ready', function(e, order){
                log.debug('Got channel order: ' + order);
                this._chOrder = order;
                // firstly, disconnect any connections to other nodes to avoid
                // confusions and strange behaviours.. 
                for (var i = 0; i < order.length; i++){
                    this.objects["Bed"+order[i]].audio.disconnect();
                }
                // now assign correct gainController to corresponding
                // pannerNode
                for (var i = 0; i < order.length; i++){
                    log.debug("Reconnecting GainController " + i + " with Bed " + order[i]);
                    this.objects["Bed"+order[i]].setAudio(this._audiobed.gainController[i]);
                }
            }.bind(this));
            var chOrder = chOrderTest.testChs();
        }

        for (obj in this._audiobedTracks){
            var trackNr = parseInt(this._audiobedTracks[obj].split("_")[1]);
            this.objects[obj] = new ObjectController(this.ctx, this._audiobed.gainController[trackNr]);
            this.objects[obj].audio._id = obj;
            this.objects[obj].panner._id = obj;
        }
        
        for (kf in this._groupObjURLs){
            this._groupObjPlayers[kf] = {};
            this._kf_canplay[kf] = {};
            for (group in this._groupObjURLs[kf]){
                this._kf_canplay[kf][group] = false;
                var player = new IRTPlayer(this.ctx);
                $(player).on('player_ready', this._loadedStateDelegate(kf, group));
                for (idx in this._groupObjURLs[kf][group]){
                    var obj = this._groupObjURLs[kf][group][idx];
                    var url = this._audioURLs[obj];
                    var audioInstance = new AudioData(this.ctx, url);
                    audioInstance.load();
                    audioInstance.setLoopState(false);
                    this.objects[obj] = new ObjectController(this.ctx, audioInstance);
                    player.addAudioData(audioInstance);
                    this._groupObjPlayers[kf][group] = player;
                }
            }
        }

        for (kf in this._singleObjURLs){
            this._singleObjAudios[kf] = {};
            if (!this._kf_canplay[kf]){
                this._kf_canplay[kf] = {};
            }
            for (idx in this._singleObjURLs[kf]){
                var obj = this._singleObjURLs[kf][idx];
                var url = this._audioURLs[obj];
                this._kf_canplay[kf][obj] = false;
                var audioInstance = new AudioData(this.ctx, url);
                $(audioInstance).on("audio_loaded", this._loadedStateDelegate(kf, obj));
                audioInstance.load();
                audioInstance.setLoopState(false);
                this.objects[obj] = new ObjectController(this.ctx, audioInstance);
                this._singleObjAudios[kf][obj] = audioInstance;
            }
        }
        this.setPanningType(this._panningType);
        $(document).triggerHandler('om_initialized');
        log.debug('Scene sucessfully initialized!');
        //this.start();
    },

    /**
     * Starts playback and rendering of audio scene
     */
    start: function(){
        if ((this._checkReadyStart() === true) && (this.playing === false)) {
            this._clock.start();
            this._startTime = this.ctx.currentTime;
            this._processCurrentKeyframes();
            if (this._audiobed !== false){
                this._audiobed.play();
            }
            var that = this;
            var evt = this._clock.setTimeout(function(){log.debug(that.ctx.currentTime)}, 1).repeat(1);
            this.playing = true;
            return true;
        } else {
            log.info("Audio signals not yet ready for playing.");
            return false;
        }
    },

    /**
     * Pauses playback
     */
    pause: function(){
        this.ctx.suspend();
        if (this._audiobed !== false){
            this._audiobed.pause();
        }
        this.playing = false;
    },

    /**
     * Resumes playback of all objects if paused.
     *
     */
    resume: function(){
        this.ctx.resume();
        if (this._audiobed !== false){
            this._audiobed.play();
        }
        this.playing = true;
    },

    /**
     * togglePause
     *
     */
    togglePause: function(){
        if(this.ctx.state === 'running') {
            this.pause();
        }
        else if(this.ctx.state === 'suspended') {
            this.resume();
        }
    },

    /**
     * Stops playback and internal clock
     */
    stop: function(){
        this._clock.stop();
        if (this._audiobed !== false){
            this._audiobed.stop();
        }
        for (kf in this._groupObjPlayers){
            for (group in this._groupObjPlayers[kf]){
                this._groupObjPlayers[kf][group].stop();
            }
        }
        for (kf in this._singleObjAudios){
            for (idx in this._singleObjAudios[kf]){
                this._singleObjAudios[kf][idx].stop();
            }
        }
        this.playing = false;
    },
    
    // This method will not work along with the current single object usage.
    // TODO: improve me!
    setTime: function(time){
        // activate closest keyframe before time to avoid
        // missing / "forgetting" object commands..
        var times = Object.keys(this._keyframes);

        // works even in case the keys are strings
        var closest_kf = _.min(times); //Get the lowest numberin case it match nothing.
        for(var i = 0; i < times.length; i++){ 
            if ((times[i] <= time) && (times[i] > closest_kf)){
                closest_kf = times[i];
            }
        }
        this._handleKeyframe(closest_kf);
        
        for (key in this._evts){
            var evt = this._evts[key];
            var evt_time = parseFloat(key);
            var newTime = evt_time - time + this.ctx.currentTime;
            log.debug("Evt " + key + " rescheduled from " + evt.deadline + " to " + newTime);
            evt.schedule(newTime);
        }
    },
    
    /**
     * Toggle panning type between Headphones (binaural) and Stereo rendering
     */
    togglePanningType: function(){
        if (this._panningType === "HRTF"){
            this.setPanningType("equalpower");
            this._panningType = "equalpower";
        } else if (this._panningType === "equalpower"){
            this.setPanningType("HRTF");
            this._panningType = "HRTF";
        }
    },
    
    /**
     * @param {("HRTF"|"equalpower")} type - Panning type for all
     * objects
     */
    setPanningType: function(type){
        for (key in this.objects){
            this.objects[key].setPanningType(type);
        }
        this._panningType = type;
    },

    /**
     * @returns {("HRTF"|"equalpower")} panningType 
     */
    getPanningType: function(){
        return this._panningType;
    },
    
    /**
     * Sets listener orientation. Coordinate usage as intended by the Web
     * Audio API. See also {@link https://webaudio.github.io/web-audio-api/#the-audiolistener-interface}
     * NOTE: This function currently takes only the head rotation but not the
     * tilt into account.
     *
     * @param x
     * @param y
     * @param z
     */
    setListenerOrientation: function(x, y, z){
        this._listenerOrientation = [x, y, z];
        this.ctx.listener.setOrientation(x, y, z, 0, 1, 0);
    },

    /**
     * getListenerOrientation
     * @returns listenerOrientation
     */
    getListenerOrientation: function(){
        return this._listenerOrientation;
    },

    /**
     * setListenerPosition
     * Coordinate usage as intended by the Web
     * Audio API. See also {@link https://webaudio.github.io/web-audio-api/#the-audiolistener-interface}
     * @param x
     * @param y
     * @param z
     */
    setListenerPosition: function(x, y, z){
        this._listenerPosition = [x, y, z];
        this.ctx.listener.setPosition(x, y, 0);
    },

    /**
     * getListenerPosition
     * @returns listenerPosition
     */
    getListenerPosition: function(){
        return this._listenerPosition;
    },
    
    _handleKeyframe: function(key){
        log.debug("Activating keyframe: " + key);
        var keyframe = this._keyframes[key];
        //this._kfMapping = {};
        if (this.interactive === false){
            for (var i = 0; i < keyframe.length; i++){
                var triplet = keyframe[i];
                var obj = triplet.obj;
                var cmd = triplet.cmd;
                var params = triplet.params;
                if (cmd === "position"){
                    this.objects[obj].setPosition(params);
                    /** 
                     * Will be fired if object from list gets new Position as per 
                     * the scene data
                     * @event module:bogJS~ObjectManager#om_newPosition
                     * @property {string} obj - Name of object
                     * @property {float[]} pos - New position values as array [x, y, z]
                     */
                    $(this).triggerHandler('om_newPosition', [obj, params]);
                }
                else if (cmd === "gain"){
                    this.objects[obj].setGain(params);
                    /** 
                     * Will be fired if object from list gets new Gain
                     * value as per scene data / {@link module:bogJS~ObjectManager#_keyframes}
                     * @event module:bogJS~ObjectManager#om_newGain
                     * @property {string} obj - Name of object
                     * @property {number} gain - New gain value
                     */
                    $(this).triggerHandler('om_newGain', [obj, params]);
                }
                else if (cmd === "track_mapping"){
                    var url = params;
                    if (url in this._kfMapping === false){
                        this._kfMapping[url] = obj; 
                    } 
                    else if ((url in this._kfMapping === true) && (this._kfMapping[url] !== obj)){
                        var objs = [];
                        var alreadyThere = [this._kfMapping[url]];
                        this._kfMapping[url] = objs.concat.apply(obj, alreadyThere);
                    }
                }
                else if (cmd === "is_present"){
                    if (params == 0) {
                        state = false;
                    } else if (params == 1) {
                        state = true;
                    } else {
                        state = params;
                    }
                    this.objects[obj].setStatus(state);
                    /** 
                     * Will be fired if object from list has new State
                     * @event module:bogJS~ObjectManager#om_isActive
                     * @property {string} obj - Name of object
                     * @property {boolean} bool - Bool value if active or not
                     */
                    $(this).triggerHandler('om_isActive', [obj, state]);
                }
            }
        }
        this._handleKeyframeAssets(key);
        //this._handleKeyframeMappings();
    },

    _handleKeyframeAssets: function(kf){
        //this._kf_canplay = {};
        if (kf in this._groupObjPlayers){
            for (var group in this._groupObjPlayers[kf]){
                var tmpGrp = this._groupObjPlayers[kf][group]; // TODO: does this cause additional delay?
                if (tmpGrp.canplay === false){
                    $(tmpGrp).on("audio_loaded", this._loadedStateDelegate(kf, group));
                }
            }
        }
        if (kf in this._singleObjAudios){
            for (var obj in this._singleObjAudios[kf]){
                var tmpAudio = this._singleObjAudios[kf][obj]; // TODO: does this cause additional delay?
                if (tmpAudio.canplay === false){
                    $(tmpAudio).on("audio_loaded", this._loadedStateDelegate(kf, obj));
                }
            }
        }

        // now check if all assets are ready for playing: 
        for (var el in this._kf_canplay[kf]){
            log.debug(el);
            if (this._kf_canplay[kf][el] === false){
                log.debug("Pausing playback as not all assets are decoded yet.. ");
                this.pause();
                break;
            }
        }
        // if we came to this point: start playback of all keyframe assets
        this._startKeyframeAssets(kf);
    },

    _startKeyframeAssets: function(kf){
        if (kf in this._groupObjPlayers){
            for (var group in this._groupObjPlayers[kf]){
                var tmpGrp = this._groupObjPlayers[kf][group]; // TODO: does this cause additional delay?
                tmpGrp.play();
            }
        }
        if (kf in this._singleObjAudios){
            for (var obj in this._singleObjAudios[kf]){
                var tmpAudio = this._singleObjAudios[kf][obj]; // TODO: does this cause additional delay?
                tmpAudio.play();
            }
        }
    },
    
    _loadedStateDelegate: function(kf, obj){
        return function(){
            log.debug("Asset now ready: " + obj);
            this._kf_canplay[kf][obj] = true;
            this._checkLoadedState(kf);
        }.bind(this);
    },

    _checkLoadedState: function(kf){
        log.debug(this._kf_canplay[kf]);
        for (var obj in this._kf_canplay[kf]) {
            if (this._kf_canplay[kf][obj] !== true){
                console.debug("We still need to wait for decoding of asset(s)");
                return;  // break loop and return in case any of the objects is not yet ready
            } 
        }

        var first_kf = _.min(Object.keys(this._keyframes)); //Get the first keyframe
        if (kf === first_kf){
            $(document).triggerHandler('om_ready');
        }
        if (this.ctx.state === "suspended"){
            console.debug("Resuming playback - all assets are decoded now");
            this.resume();
        }
    },
    
    _handleKeyframeMappings: function(){
        if (JSON.stringify(this._last_kfMapping) !== JSON.stringify(this._kfMapping)){
            log.info("Track mapping has changed" + JSON.stringify(this._kfMapping));    
            // Firstly disconnect everything to make sure that no old
            // mappings stay connected
            // That means that changes have to be made explicitely and
            // not implicitely!
            for (key in this._audioInstances){
                this._audioInstances[key].disconnect();
            }
            /*
            TODO: Irgendwie herausfinden, was sich zum aktuellen Mapping geändert hat.
            Dann dementsprechend connecten /disconnecten.
            */
            
            // And now connect all the mappings as per the keyframe
            for (key in this._kfMapping){
                var pannerObjects = [];
                var objs = this._kfMapping[key];
                if (typeof objs === "string"){    // == attribute
                    pannerObjects = this.objects[objs].panner; 
                }
                else if (typeof objs === "object"){   // == array
                    for (var i = 0; i < objs.length; i++){
                        log.trace("Adding " + objs[i] + " to the pannerObject array");
                        pannerObjects.push(this.objects[objs[i]].panner);
                    }
                }
                this._audioInstances[key].reconnect(pannerObjects);
                log.debug("Reconnecting " + key + " with " + objs);
                
                /** 
                 * Will be fired if track mapping for object from list changes
                 * @event module:bogJS~ObjectManager#om_newTrackMapping
                 * @property {string} obj - Name of object
                 * @property {string[]} objs - Array of to be connected objects
                 */
                $(this).triggerHandler('om_newTrackMapping', [key, objs]);
            }
        }
        this._last_kfMapping = JSON.parse(JSON.stringify(this._kfMapping));  // making a "copy" and not a reference
    },
        
    _processCurrentKeyframes: function(){
        for (key in this._keyframes){
            //console.log(key);
            var relTime = parseFloat(this.ctx.currentTime - this._startTime + parseFloat(key));
            this._evts[key] = this._clock.setTimeout(this._buildKeyframeCallback(key, relTime),relTime);
        }
    },
    
    _buildKeyframeCallback: function(key, relTime){
        var that = this;
        return function(){
            that._handleKeyframe(key);
            that._currentKeyframeIndex = parseFloat(key);
            log.debug('Keyframe ' + key + ' reached at context time: ' + relTime);
        }
    },
    
    /*
    update: function(){
        log.trace("Updating scene..")
        // neue metadaten lesen
        // aktuelle Zeit vom AudioContext holen
        // Objekt-Eigenschaften entsprechend ändern
        // this.readMetadata();
        // this.processCurrentKeyframes();
    },
    */

    _checkReadyStart: function(){
        if (this._audiobed !== false){
            return this._audiobed.canplay;
        } else {
            return true;
        }
    },


    /**
     * Sets RollOffFactor for all objects via 
     * {@link module:bogJS~ObjectController#setRollOffFactor}
     * @param factor
     */
    setRollOffFactor: function(factor){
        for (key in this.objects){
            this.objects[key].setRollOffFactor(factor);
        }
        this._triggerChange();
    },

    /**
     * Sets DistanceModel for all objects via
     * {@link module:bogJS~ObjectController#setDistanceModel}
     * @param model
     */
    setDistanceModel: function(model){
        for (key in this.objects){
            this.objects[key].setDistanceModel(model);
        }
        this._triggerChange();
    },

    /**
     * Sets RefDistance for all objects via
     * {@link module:bogJS~ObjectController#setRefDistance}
     * @param refDistance
     */
    setRefDistance: function(refDistance){
        for (key in this.objects){
            this.objects[key].setRefDistance(refDistance);
        }
        this._triggerChange();
    },

    /**
     * Sets MaxDistance for all objects via
     * {@link module:bogJS~ObjectController#setMaxDistance}
     * @param maxDistance
     */
    setMaxDistance: function(maxDistance){
        for (key in this.objects){
            this.objects[key].setMaxDistance(maxDistance);
        }
        this._triggerChange();
    },

    /**
     * @private
     * As Chrome (FF works) does not automatically use the new paramters of 
     * distanceModle, refDistance and maxDistance, we need to trigger a change
     * by ourself. The additional value of 0.000001 for x seems to be the
     * threshold for Chrome to change the rendering. 
     */
    _triggerChange: function(){
        var pos = this.getListenerPosition();
        this.setListenerPosition(pos[0] + 0.000001, pos[1], pos[2]);
        this.setListenerPosition(pos[0], pos[1], pos[2]);
    }
}



module.exports = ObjectManager;
