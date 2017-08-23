/**
 * @file scene_reader.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

/**
 * @callback loaded_callback
 */


/**
 * Represents SceneReader class. Will load and parse scene data from URL for the
 * {@link module:bogJS~ObjectManager|ObjectManager} instance
 *
 * @constructor
 * @abstract
 *
 * @param {loaded_callback} [loaded_callback=undefined] - Callback that will be executed
 * if scene data is loaded and parsed.
 * @fires module:bogJS~SceneReader#scene_loaded
 *
 */
var SceneReader = function(loaded_callback){
    //this.load(url);
    this.callback = loaded_callback || undefined;
}

SceneReader.prototype = {

    /**
     * Executes XHR to load and parse the scene data from the passed URL
     *
     * @param {string} url - URL to scene data target
     * @fires module:bogJS~SceneReader#scene_loaded
     */
    load: function(url){
        // we need to do this as within the anonymous success function of the ajax call,
        // 'this' will refer to the window object and NOT to the SceneReader instance!
        var that = this;
        $.ajax({
            type: "GET",
	        url: url,
    	    dataType: "text",
	        success: function(text) {
                that.parse(text);
                if (that.callback !== undefined){
                    that.callback.call();
                }
	        }
        });
    },

    parse: function(rawText) {
        var commands = this._tokenize(rawText);
        var data = this._parseSpatdif(commands);
        var keyframes = data[0];
        var audioURLs = data[1];
        var sceneInfo = data[2];
        var groupObjects = data[3];
        var audiobeds = data[4];
        var extraObjects = data[5];
        var interactiveInfo = data[6];
        var singleObjects = {};
        for (var kf in extraObjects){
            for (var group in groupObjects[kf]){
                for (var el in groupObjects[kf][group]){
                    var obj = groupObjects[kf][group][el];
                    var idx = extraObjects[kf].indexOf(obj);
                    console.debug('Checking for double entry for object ' + obj);
                    if (idx > -1) {
                        extraObjects[kf].splice(idx, 1);
                        console.debug('Found group object ' + obj + ' also as single objects entry. Removing if from the list.');
                    }
                }
            }
        }
        singleObjects = extraObjects;

        /**
         * Will be fired if scene data is loaded and parsed
         * @event module:bogJS~SceneReader#scene_loaded
         * @abstract
         *
         * @property {module:bogJS~keyframes} keyframes - 'Dictionary' with keyframes
         * (Array with commands per detected keyframe in scene)
         *
         * @property {module:bogJS~audioURLs} audioURLs - 'Dictionary' with audioURLs
         * per Object in Scene (to be used for mapping of objects to
         * audio signals)
         *
         * @property {module:bogJS~sceneInfo} sceneInfo - 'Dictionary' with additional sceneInfo
         * (Can contain 'name', 'object_count', 'listener_orientation',
         * 'listener_position' and / or 'room_dimensions')
         *
         * @property {module:bogJS~groupObjects} groupObjects - 'Dictionary'
         * containing info to identify grouped objects
         *
         * @property {module:bogJS~singleObjects} singleObjects - 'Dictionary'
         * containing info to identify single objects
         *
         * @property {module:bogJS~audiobeds} audiobeds - 'Dictionary'
         * containing objects and their "track mapping" info
         *
         * @property {module:bogJS~interactiveInfo} interactiveInfo - 'Dictionary'
         * containing info for interactive objects and groups
         */
        $(this).triggerHandler('scene_loaded', [keyframes, audioURLs, sceneInfo, groupObjects, singleObjects, audiobeds, interactiveInfo])
    },

    _tokenize: function(d){
        var lines = [];
        var data = d.split('\n');
        for (var i = 0; i < data.length; i++){
            if (data[i].indexOf("/spatdif") === 0){   //String.prototype.startsWith() not yet widely supported
                var l = {};
                var line = data[i].split(' ');
                var command = line[0].split('/');
                l.cmd = command.slice(1, command.length);
                l.params = line.slice(1, line.length);
                if (l.params.length === 1){
                    l.params = l.params[0];  // avoids having an array for a single value
                }
                lines[lines.length] = l;     // makes sure that we append the data at the end and won't skip indices
            }
        }
        return lines;
    },

    _parseSpatdif: function(m){
        var keyframes = {};
        var audioURLs = {};
        var sceneInfo = {};
        var interactiveInfo = {};
        interactiveInfo.switchGroups = {};
        interactiveInfo.gain = {};
        var groups = {};
        var extraObjects = {};
        var audiobeds = {};
        var keyframe = null;
        for (var i = 0; i < m.length; i++) {
            if (m[i].cmd[0] === "spatdif"){  // darauf verzichten um die lesbarkeit des codes zu verbesern?
                if (m[i].cmd[1] === "meta"){
                    var meta = m[i];
                    if (meta.cmd[3] === "name") {
                        sceneInfo.name = meta.params;
                    } else if (meta.cmd[2] === "objects") {
                        sceneInfo.object_count = meta.params;
                    } else if ((meta.cmd[2] === "reference") && (meta.cmd[3] === "orientation")){
                        sceneInfo.listener_orientation = this._parseFloatArray(meta.params);
                    } else if ((meta.cmd[2] === "room") && (meta.cmd[3] === "origin")){
                        sceneInfo.listener_position = this._parseFloatArray(meta.params);
                    } else if ((meta.cmd[2] === "room") && (meta.cmd[3] === "dimension")){
                        sceneInfo.room_dimensions = this._parseFloatArray(meta.params);
                    } else if ((meta.cmd[2] === "audiobed") && (meta.cmd[3] === "url")) {
                        sceneInfo.audiobed_url = meta.params;
                    } else if ((meta.cmd[2] === "audiobed") && (meta.cmd[3] === "tracks")) {
                        sceneInfo.audiobed_tracks = meta.params;
                    } else if (meta.cmd[2] === "interactive") {
                        if (meta.cmd[3] === "switchGroup") {
                            if (meta.cmd[4] === "label") {
                                var label = meta.params[0];
                                interactiveInfo.switchGroups[label] = {};
                                interactiveInfo.switchGroups[label].default = meta.params[1];
                                interactiveInfo.switchGroups[label].items = {};
                            } else {
                                var item_label = meta.params[0];
                                interactiveInfo.switchGroups[label].items[item_label] = meta.params[1];
                            }
                        } else if (meta.cmd[3] === "gain"){
                            if (meta.cmd[4] === "label") {
                                var label = meta.params[0];
                                interactiveInfo.gain[label] = {};
                                interactiveInfo.gain[label].range = [meta.params[1], meta.params[2]];
                                interactiveInfo.gain[label].objects = [];
                            } else {
                                interactiveInfo.gain[label].objects.push(meta.params);
                            }
                        }
                    }

                } else if (m[i].cmd[1] === "time") {
                    keyframe = m[i].params;
                    keyframes[keyframe] = [];
                } else if ((m[i].cmd[1] === "source") && (keyframe !== null)) {
                    // ignore the commands until the first keyframe appears
                    var obj = m[i].cmd[2];
                    var cmd = m[i].cmd[3];
                    var params = m[i].params;

                    if (cmd === "track_mapping"){
                        if ((params.startsWith("bed_")) && (obj in audiobeds ===  false)){
                            audiobeds[obj] = params;
                        } else if ((params.startsWith("bed_") === false) && (obj in audioURLs === false)) {
                            audioURLs[obj] = params;
                            if (keyframe in extraObjects ===  false){
                                extraObjects[keyframe] = [];
                            }
                            extraObjects[keyframe].push(obj);
                        }
                    }

                    if (cmd === "group") {
                        if (keyframe in groups === false){
                            groups[keyframe] = {};
                        }
                        if (params in groups[keyframe] === false){
                            groups[keyframe][params] = [];
                        }
                        if (groups[keyframe][params].indexOf(obj) === -1){
                            groups[keyframe][params].push(obj)  // == groups.keyframe.params.push(obj)
                            console.debug("Adding " + obj + " to group " + params + " at keyframe " + keyframe);
                        }
                    }
                    var triplet = {};
                    triplet.obj = obj;
                    if (cmd === "active"){
                        cmd = "is_present";
                    }
                    triplet.cmd = cmd;
                    triplet.params = m[i].params;
                    keyframes[keyframe].push(triplet);
                }
            }
        }
        return [keyframes, audioURLs, sceneInfo, groups, audiobeds, extraObjects, interactiveInfo];
    },

    _parseFloatArray: function(array){
        var tmp_array = [];
        for (var n in array){
            var number = parseFloat(array[n]);
            if (!isNaN(number)){
                tmp_array[tmp_array.length] = number;
            }
        }
        return tmp_array;
    }

}


module.exports = SceneReader;
