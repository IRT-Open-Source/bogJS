/**
 * @file object.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

var log = require('loglevel');

/**
 * Represents ObjectController class which has all the logic to control an
 * audio object
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {AudioData} sourceNode - Instance of an {@link
 * module:irtPlayer~AudioData|AudioData} object.
 * @param {AudioData} [targetNode=ctx.destination] - Instance of an
 * Web Audio API node to which the output of the ObjectController
 * shall be connected to.
 */

var ObjectController = function(ctx, sourceNode, targetNode) {
    /**
     * Instance of Web Audio Panner node
     * @var {Object.<AudioContext.PannerNode>}
     */
    this.panner = ctx.createPanner();

    // Experimental highpass to avoid sizzling noinse while chaning view / angle
    this.highpass = ctx.createBiquadFilter();
    this.highpass.type = "highpass";
    this.setHighpassFreq(80);
    this.highpass.connect(this.panner);

    /**
     * Has the current panning mode of the object
     * @readonly
     */
    this.panningType = "equalpower";
    this.panner.maxDistance = 10;

    this.setPanningType(this.panningType);
    this.position = [0, 0, 0];  // FIXME: make private and use set and get methods
    this.gain = 1;  // valid values between 0 and 1  // FIXME: make private and use set and get methods

    this._state = false;

    this.setAudio(sourceNode);

    var targetNode = targetNode || ctx.destination;
    this.panner.connect(targetNode);
};

ObjectController.prototype = {

    /**
     * Change position of panner object within 3D space
     *
     * @param {Float[]} xyz - An array with three entries: [x, y, z]

     * @see Interpolation as per AudioParam Interface not possible with
     * current WAA version. The PannerNode will be deprecated in V1
     * and a new SpatializerNode will be introduced that should
     * support interpolation _and_ loading own HRTF databases!!
     * {@link https://github.com/WebAudio/web-audio-api/issues/372| GitHub issue 372}
     */
    setPosition: function(xyz){
        var my_xyz = [parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2])];
        this.panner.setPosition(xyz[0], xyz[1], xyz[2]);
        log.debug("New Position: " + my_xyz);
        this.position = xyz;
    },

    /**
     * Get current Position of object
     * @return {Float[]} position - Array with current [x, y, z] values
     */
    getPosition: function(){
        return this.position;
    },

    /**
     * Enabling / disabling the object
     *
     * @param {Boolean} state - Enables / disables the panner object
     * instance
     */
    setStatus: function(state){
        if ((state === true) || (state == 1)){
            this.audio.unmute();
            this._state = true;
        }
        else if ((state === false) || (state == 0)){
            this.audio.mute();
            this._state = false;
        }
    },

    /**
     * Returns current object state
     * @return {Boolean} status
     */
    getStatus: function(){
        return this._state;
    },

    /**
     * Sets gain value of {@link
     * module:irtPlayer~AudioData#gainNode|AudioData.gainNode}
     *
     * @param {Float} gain - Must be between 0.0 and 1.0
     * @param {Float} [time=Now] - At which time shall the gain value be applied
     * @param {Boolean} [interpolation=false] - Set to true if gain
     * value shall be linear faded to passed gain value from passed time on. If
     * false, the gain value will be applied immediately.
     */
    setGain: function(gain, time, interpolation){
        var time = time || "now";
        var interpolation = interpolation || false;

        if ((gain >= 0.0) && (gain <= 1.0)){
            if (time === "now") {
                this.audio.setGain(gain);
                this.gain = gain;
            }
            else if ((time !== "now") && (interpolation === false)) {
                this.audio.gainNode.gain.setValueAtTime(gain, time);
            }
            else if ((time !== "now") && (interpolation !== false)){
                this.audio.gainNode.gain.linearRampToValueAtTime(gain, time);
            }
        }
        else {
            log.error("Gain values must be between 0 and 1");
        }
    },

    /**
     * Get current gain value of {@link
     * module:irtPlayer~AudioData#gainNode|AudioData.gainNode}
     *
     * @return {Float} gain
     */
    getGain: function(){
        return this.audio.getGain();  // or do we trust in this.gain ??
    },

    /**
     * Set panning type of Panner object instance.
     * Currently, "equalpower" only supports Stereo (2ch) panning.
     *
     * @param {("HRTF"|"equalpower")} panningType - Choose "HRTF" for binaural
     * rendering or "equalpower" for Stereo rendering.
     */
    setPanningType: function(panningType){
        if ((panningType === "HRTF") || (panningType === "equalpower")){
            this.panner.panningModel = panningType;
            this.panningType = this.panner.panningModel;
        }
        else {
            log.error("Only >>HRTF<< or >>equalpower<< are valid types");
        }
    },

    /**
     * Get panning type
     * @return {("HRTF"|"equalpower")} panningType - Either "HRTF" or "equalpower"
     */
    getPanningType: function(){
        return this.panner.panningModel;
    },

    /**
     * Sets the double value describing how quickly the volume is reduced
     * as the source moves away from the listener. The initial default value
     * is 1. This value is used by all distance models.
     *
     * @param {Float} factor
     */
    setRollOffFactor: function(factor){
        this.panner.rolloffFactor = factor;
    },

    /**
     * Sets the value determining which algorithm to use to reduce the
     * volume of the audio source as it moves away from the listener. The
     * initial default value is "inverse" which should be equivalent to 1/r.
     *
     * @param {("inverse"|"exponential"|"linear")} model - "inverse" is the default setting
     */
    setDistanceModel: function(model){
        this.panner.distanceModel = model;
    },

    /**
     * Sets the value representing the reference distance for reducing volume
     * as the audio source moves further from the listener. The initial
     * default value is 1. This value is used by all distance models.
     *
     * @param {float} refDistance
     */
    setRefDistance: function(refDistance){
        this.panner.refDistance = refDistance;
    },

    /**
     * Sets the value representing the maximum distance between the audio
     * source and the listener, after which the volume is not reduced any
     * further. The initial default value is 10000. This value is used
     * only by the linear distance model.
     *
     * @param {float} maxDistance
     */
    setMaxDistance: function(maxDistance){
        this.panner.maxDistance = maxDistance;
    },

    /**
     * Connects the input of the ObjectController instance
     * with the output of the passed audioNode.
     *
     * @param {AudioData} audioNode - Instance of an {@link
     * module:irtPlayer~AudioData|AudioData} or GainController object.
     */
    setAudio: function(audioNode){
        // call disconnect only if this.audio exists
        // it is absolutely essential to disconnect the old audio instance
        // before the new one can be assigned!
        /* FIXME: clarify the expected behaviour of a setAudio() method!
        if (this.audio){
            this.audio.disconnect(this.panner);
        }
        */
        this.audio = audioNode;
        // just to make sure we assigned a valid audioNode..
        if (this.audio){
            // FIXME: AudioData() class should also have a connect method.
            // Better would be to use derived class mechanisms.
            if(this.audio.connect) {
                this.audio.connect(this.highpass);
            }
            else {
                this.audio.reconnect(this.highpass);
            }
        }
    },

    setHighpassFreq: function(freq){
        this.highpass.frequency.value = freq;
    }
}

module.exports = ObjectController;
