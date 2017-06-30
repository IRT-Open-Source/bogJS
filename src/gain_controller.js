/*jshint esversion: 6 */
/**
 * @file media_controller.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 *
 */

window.$ = require('jquery');


/**
 * GainController
 * @constructor
 *
 * @param ctx - Web Audio API Audio Context instance
 * @param [targetNode=ctx.destination] - Web Audio API node to which the
 * output of the GainController shall be connected to.
 */
var GainController = function(ctx, targetNode=ctx.destination){
    this._gain = 1;
    this.gainNode = ctx.createGain();

    // Experimental highpass to avoid sizzling noinse while chaning view / angle
    //this.highpass = ctx.createBiquadFilter();
    //this.highpass.type = "highpass";
    //this.highpass.connect(this.gainNode);
    //this.setHighpassFreq(80);

    // FIXME: if applied here, the gainNode stays
    // connected with ctx.destination:
    this.connect(targetNode);
};

GainController.prototype = {

    /**
     * Mutes the node object
     *
     */
    mute: function(){
        this.setGain(0);
    },

    /**
     * Unmutes node object
     *
     */
    unmute: function(){
        this.setGain(1);
    },

    /**
     * setGain
     *
     * @param {Float} val - Values between 0 and 1
     */
    setGain: function(val){
        this.gainNode.gain.value = val;
        this._gain = this.getGain();
    },

    /**
     * getGain
     *
     * @returns {Float} gain - Float value between 0 and 1
     */
    getGain: function(){
        return this.gainNode.gain.value;
    },

    /**
    * Disconnects and reconnects {@link GainController} instance to passed
    * AudioNode(s)
    *
    * @param {(Object|Object[])} nodes - Single of array of AudioNodes to which
    * the {@link MediaElementController} instance shall be reconnected.
    */
    reconnect: function(nodes){
        this.disconnect();
        this.connect(nodes);
    },

    /**
     * connect
     *
     * @param {(Object|Object[])} nodes - one or multple Web Audio API nodes to
     * which the output of the GainController instance shall be connected to.
     */
    connect: function(nodes) {
        console.debug("Connecting GainController to " + nodes);
        if (Object.prototype.toString.call(nodes) != "[object Array]"){          // == single Node
            this.gainNode.connect(nodes);
        } else {                                          // == array of Nodes
            for (var i=0; i < nodes.length; i++){
                this.gainNode.connect(nodes[i]);
            }
        }
    },

    /**
    * This method will disconnect output of the {@link GainController} instance from
    * a given node or all connected nodes if node is not given/undefined.
    */
    disconnect: function(node){
        //console.debug("Disconnecting ", this, " from ", node);
        this.gainNode.disconnect(node);
    },

    setHighpassFreq: function(freq){
        //this.highpass.frequency.value = freq;
    }
};

module.exports = GainController;
