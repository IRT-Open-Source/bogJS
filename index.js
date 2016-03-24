
// making the objects globally available
window.$ = require('jquery');  // avoids that we use different jquery instances..
window.jQuery = $;
window.jquery = $;
window.ChannelOrderTest = require('./src/channelorder_test');
window.AudioData = require('./src/html5_player/core').AudioData;
window.IRTPlayer = require('./src/html5_player/core').IRTPlayer;
window.MediaElementController = require('./src/media_controller');
window.ObjectController = require('./src/object');
window.ObjectManager = require('./src/object_manager');
window.SceneReader = require('./src/scene_reader');
window.log = require('loglevel');
//window.UIManager = require('./src/ui');
