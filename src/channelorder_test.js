/*jshint esversion: 6 */
/**
 * @file channelorder_test.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 */


var _ = require('underscore');


/**
 * GainController
 * @constructor
 *
 * @param ctx - Web Audio API Audio Context instance
 * @param [targetNode=ctx.destination] - Web Audio API node to which the
 * output of the GainController shall be connected to.
 */

/**
 * ChannelOrderTest will start loading, deconding and playing as soon as the
 * instance of the class is created. The test files will be looped and for
 * each loop, the [testChs]{@link module:bogJS~ChannelOrderTest#testChs} method
 * is called. If the test file has been played five times and no order could
 * be detected, the default order will be triggered.
 * @constructor
 *
 * @param {String} container - to be tested file extension w/o dot ("mp4")
 * @param {Number} tracks - To be tested channel number for container
 * @param {Object.<AudioContext>} [ctx=AudioContext] - if no AudioContext
 *      instance is passed, it will be created.
 * @param {String} [root="signals/order"] - path to test encoded files
 * @fires module:bogJS~ChannelOrderTest#order_ready
 */
var ChannelOrderTest = function(container, tracks, ctx, root="signals/order/"){
    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }
    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;

    this._tracks = parseInt(tracks);
    this._splitter = this.ctx.createChannelSplitter(this._tracks);
    this.analysers = [];
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(this.ctx.destination);

    for (var i = 0; i < this._tracks; i++){
        this.analysers[i] = this.ctx.createAnalyser();
        this.analysers[i].fftSize = 2048;  // "hard-coded" due to Safari -> analyser chrashes if fftSize value is greater than 2048
        this._splitter.connect(this.analysers[i], i);
        this.analysers[i].connect(this.gainNode);
    }
    //var root = root || "http://lab.irt.de/demos/order/";
    if (container === "webm"){   // we assume opus if webm is used
        container = "opus";
    }
    var url = root+tracks+"chs."+container;
    this._loadSound(url);
};


ChannelOrderTest.prototype = {
    /**
     * Load and test passed audio signal
     *
     * @protected
     * @param {string} url - URL
     */
    _loadSound: function(url){
        this.audio = document.createElement('audio');
        this.audio.src = url;
        this.audio.loop = true;
        this.audio.load();
        this.mediaElement = this.ctx.createMediaElementSource(this.audio);
        this.mediaElement.connect(this._splitter);
        this.audio.play();
        var last_unique = [];

        this.audio.onended = function(){
          console.debug("ChannelOrderTest Playback ended");
        }

        // onplay will be fired once the audio playback started
        $(this.audio).on("play", function(){
            console.debug("Channel order testfile started...");
            // this is a fix to make the channel order test working on Firefox
            // the initial attempt (listen on "playing") did no more in FF after
            // an update.
            for (let i = 0, p = Promise.resolve(); i < 10; i++) {
                p = p.then(() => new Promise(resolve =>
                    setTimeout(function () {
                        var order = this.testChs();
                        var unique = _.unique(order);
                        // the returned order should be identical for two consecutive calls
                        // to make sure we have a reliable result
                        if ((unique.length === this._tracks) && (_.isEqual(last_unique, unique))) {
                            console.info('Channel order detected: ' + order);
                            /**
                             * If channel order was detected and ensured, the event is
                             * fired with channel order as array.
                             * @event module:bogJS~ChannelOrderTest#order_ready
                             * @property {Number[]} order - Array containing the detected
                             * order
                             */
                            $(document).triggerHandler('order_ready', [order]);
                            this.audio.pause();
                            return;
                        } else if (unique.length === this._tracks){
                            last_unique = unique;
                        }
                        console.debug("Channel order not yet detected. Iteration:  " + i);
                        if (i >= 9){
                            console.warn("Channel order not detectable. Stopping indentfication and trigger default values.");
                            order = _.range(this._tracks);
                            $(document).triggerHandler('order_ready', [order]);
                            this.audio.pause();
                        }
                        resolve();
                    }.bind(this), 500)
                ));
            }
        }.bind(this, last_unique));
    },

    /**
     * Save frequency bins to arrays for later analysis
     * @protected
     * @returns {Number[]}  Nested array (Float32Array) containing the frequency
     * bins for each channel
     */
    _getFreqData: function(){
        var freqBins = [];
        var freqBinaryBins = [];
        for (var i = 0; i < this._tracks; i++){
            // Float32Array should be the same length as the frequencyBinCount
            freqBins[i] = new Float32Array(this.analysers[i].frequencyBinCount);
            // fill the Float32Array with data returned from getFloatFrequencyData()
            this.analysers[i].getFloatFrequencyData(freqBins[i]);
        }
        return freqBins;
    },

    /**
     * Will conduct the detection of the channel order.
     * @returns {Number[]}  Array containing the detected. e.g. [0, 3, 1, 2]
     * channel order
     */
    testChs: function(){
        var freqBins = this._getFreqData();
        var indices = [];
        for (var i = 0; i < freqBins.length; i++){
            var idx = _.indexOf(freqBins[i], _.max(freqBins[i]));
            indices[i] = idx;
        }
        console.debug("Decoded indices: " + indices);
        // to avoid the array is mutated and numerical sorted
        var sorted_indices = indices.concat().sort(function(a, b){return a-b;});
        console.debug("Sorted indices: " + sorted_indices);
        var normalized_indices = [];
        for (var i = 0; i < indices.length; i++){
            normalized_indices[i] = _.indexOf(sorted_indices, indices[i]);
        }
        return normalized_indices;
    },

    /**
    * Explicit play function for mobile devices which will not start the media
    * element automatically without user gesture.
    */
    playAudio: function(){
        this.audio.play();
    }
};

module.exports = ChannelOrderTest;
