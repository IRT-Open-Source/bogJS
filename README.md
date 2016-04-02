# bogJS - JS framework for object-based audio rendering in browsers

With the introduction of [HTML5](https://en.wikipedia.org/wiki/HTML5_Audio) and the 
[Web Audio API](https://webaudio.github.io/web-audio-api/), 
an important prerequisite was made for native rendering of object-based audio 
in modern browsers. 
Object-based audio is a revolutionary approach for creating and deploying 
interactive, personalised, scalable and immersive content, by representing it as
a set of individual assets together with metadata describing their relationships 
and associations. This allows media objects to be assembled in ground-breaking 
ways to create new user experiences. 

## Demo
See bogJS in action: http://lab.irt.de/demos/taar/interaktiv/


## Basic usage and sample scene
```javascript
<script src="dist/bogJS-latest.js"></script>
<!-- Only if you want to use the UI relevant parts: -->
<script src="dist/bogJS-ui-latest.js"></script>

<script>    
var om;
$(document).on('om_ready', function(){
    om.start();
});

om = new ObjectManager('path/to/sceneFile.spatdif');
</script>
```
##### sceneFile.spatdif
```spatdif
/spatdif/time 0.0
/spatdif/source/Drums/position 0.01 1.24 0
/spatdif/source/Drums/interpolate 0
/spatdif/source/Drums/active 1
/spatdif/source/Drums/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/drums
/spatdif/source/Drums/gain 1
/spatdif/source/Drums/interactive 0
/spatdif/source/Bass/position -0.85 2.55 0
/spatdif/source/Bass/interpolate 0
/spatdif/source/Bass/active 1
/spatdif/source/Bass/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/bass
/spatdif/source/Bass/gain 1
/spatdif/source/Bass/interactive 0
/spatdif/source/Vocal/position -1.06 0.52 0
/spatdif/source/Vocal/interpolate 0
/spatdif/source/Vocal/active 1
/spatdif/source/Vocal/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/vocal
/spatdif/source/Vocal/gain 1
/spatdif/source/Vocal/interactive 0
/spatdif/source/Accordion/position 1.82 1.47 0
/spatdif/source/Accordion/interpolate 0
/spatdif/source/Accordion/active 1
/spatdif/source/Accordion/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/accordion
/spatdif/source/Accordion/gain 1
/spatdif/source/Accordion/interactive 0
/spatdif/source/Guitar/position 1.8 2.23 0
/spatdif/source/Guitar/interpolate 0
/spatdif/source/Guitar/active 1
/spatdif/source/Guitar/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/guitar
/spatdif/source/Guitar/gain 1
/spatdif/source/Guitar/interactive 0
/spatdif/source/Trumpet/position -1.92 -0.59 0
/spatdif/source/Trumpet/interpolate 0
/spatdif/source/Trumpet/active 1
/spatdif/source/Trumpet/track_mapping http://akamai-progressive.irt.de/demos/bogJS/debo/trumpet
/spatdif/source/Trumpet/gain 1
/spatdif/source/Trumpet/interactive 0
```

## Installation
#### Using the latest version
For your convenience, the dist/ folder contains the latest build files of
bogJS. 

#### Building by yourself
You only need [npm](https://www.npmjs.com/) to build this framework. 
Once you have npm installed, you must run 

```shell
npm install
```
to install the required dependencies.

Now, you can build the project with several commands:

To build and bundle the whole project, run this command in the project folder. 
This will create another subfolder "dist/" with the files as follows: 

```shell
npm run build

--> dist/bogJS-latest.js
--> dist/bogJS-latest.js.map
--> dist/bogJS-latest.min.js
--> dist/bogJS-latest.min.js.map
--> dist/bogJS-ui-latest.js
--> dist/bogJS-ui-latest.js.map
--> dist/bogJS-ui-latest.min.js
--> dist/bogJS-ui-latest.min.js.map
```


To immediately build every change in one of the source files, use this command. 
The _core_ bundle will then be constantly updated in dist/bogJS-dev.js
```shell
npm run watch

--> dist/bogJS-dev.js
```


To build and bundle a new relese version of the project, use this command. The 
files will be created under "dist/": 

```shell
npm run build-release

--> bogJS-vX.X.X.js
--> bogJS-vX.X.X.js.map
--> bogJS-vX.X.X.min.js
--> bogJS-vX.X.X.min.js.map
--> bogJS-ui-vX.X.X.js
--> bogJS-ui-vX.X.X.js.map
--> bogJS-ui-vX.X.X.min.js
--> bogJS-ui-vX.X.X.min.js.map
```
Note: This command will also add a new Git tag with increased patch number and 
will also update the package.json file accordingly. To increase the version tag
with a minor or even major, execute 

```
npm version minor
```

or 

```
npm version major
```

See also https://docs.npmjs.com/cli/version


## Documentation
To create the documentation, you will need [jsdoc3](https://github.com/jsdoc3/jsdoc):
```shell
jsdoc -c jsdoc.conf
```
The default folder for the generated documentation is doc/ .


## Version Info
With every build process, the version info is included to the bundle and saved 
as global javascript variables
```javascript
__BROWSERIFY_META_DATA__CREATED_AT
// --> "Tue Feb 16 2016 21:13:38 GMT+0100 (CET)"

__BROWSERIFY_META_DATA__GIT_VERSION
// --> "1448b3e v0.2.8"
```

## Basic concepts
#### The scene file
All object and scene relevant information is stored and read from a scene
file. The format currently used is kind of a OSC string combined with 
[SpatDIF](http://www.spatdif.org/) commands.

The SceneReader class can be replaced as long as the ObjectManager class
instance retrieves the scene and object info as defined. See the documentation
for further info.

For the future, it is planned to implement a JSON representation of the ADM
format.

#### Implemented object descriptors
The following parameters can be currently assigned to the objects:
- Gain [float]: Values for the gain of the audio signal, connected to the
  PannerNode. Values must be between 0 and 1.
- Position [float, cartesian, right-hand]:
  X, Y and Z values represent the position of the objects. See 
  [here](https://webaudio.github.io/web-audio-api/#the-audiolistener-interface) 
  for further info regarding the coordinate system.
- Interactive [boolean]: This parameter is intended to be used if the object
  shall or shall not offer any interactive usage by the user. Example use case might be
  the adjustment of speech to music level.
- Active [boolean]: This parameter can be used if the object is in the scene
  but should not be heard. It is kind of similar to the gain parameter.

It is further planned to implement more sophisticated parameters of 
[ADM](https://www.itu.int/rec/R-REC-BS.2076/en) in the future.

#### To load and play audio signals, you can use three different options:
- Single audio objects (rather short signals up to a few minutes), starting
  with playback from the very beginning or at a dedicated playback time. These
  objects will be loaded via XMLHttpRequests and decoded with the Web Audio API
  built-in decodeAudioData() function. The representation of those signals will
  be a AudioBufferSouceNode. The bogJS wrapper for this is the AudioData
  class. A typical use case would be a effect or speech object.
- Multiple single objects that have the identical duration and that shall be 
  played back simultaneaously. For those objects, there is a dedicated class
  (IRTPlayer) which can or should be used for this purpose. The IRTPlayer
  class uses several AudioData instances to load and play files.
- One or more audio objects with longer duration (> 3 minutes). These audio
  signals shall have the same duration as the audio scene. A typical usage
  would be one or multiple audio beds (containing e.g. atmo and music) that
  can have a file or stream representation. The HTML5 media element is
  used for this purpose and connected to the Web Audio API via a
  MediaElementSourceNode. The media file or stream can have multiple channels.
  Depending on the browser and codec, different maximum track numbers are
  possible. More than eight channels are currently only possible with a .wav 
  container. See also [here](./tools/Multichannel-Order_Browsertest.xlsx).

#### The channel order detection class
If you use an audio bed for your scene, the ChannelOrderTest() class is used to
detect the order of the decoded channels. To make use of this functionality,
you have to encode [these](http://akamai-progressive.irt.de/demos/bogJS/channel_order/channelOrder_testset.zip) 
test files with your preferred encoder and settings. The test set contains
uncompressed wav files from 2 channels up to 16 chs with a duration of 48000
samples (1 second@48kHz). For each channel, a different sinus tone is used
to detect the order after the encoding and decoding again.
Further, you need to upload those files to a folder on the server where the 
HTML file using bogJS is located. Otherwise you will likely run into a CORS 
issue.
For OS X user, there is a encoding bash script enclosed under /tools.

```javascript
/* Simple example */ 
var ch = new ChannelOrderTest("mp4", 6); 
ch.testChs(); 
// -> [0, 2, 1, 4, 5, 3] 

/* Advanced example */ 
var ctx = new AudioContext(); 
var ch; 
$(ch).on('order_ready', function(e, order){ 
    console.log("Got channel order: " + order); 
    doSomething(); 
}); 
ch = new ChannelOrderTest("ogg", 4, ctx, "path/to/testfiles/"); 
// -> Got channel order: [0, 3, 2, 1]
```

#### Container and file extensions
If no file extension is given in the scene file, the AudioData() class and 
the ObjectManager() class will firstly detect the capabilities of the used
browser and then try to load the given file with the preferred extension. 
The order can be read and changed [here](./src/html5_player/core.js):
1. .mp4
2. .opus
3. .ogg
4. .mp3
5. .wav

#### Interpolation
Especially for object movements, we need interpolated position updates of the
values. The Web Audio API offers with the [AudioParam](https://webaudio.github.io/web-audio-api/#AudioParam) 
interface the possibility to do this in certain ways. Unfortunately, the
PannerNode (used for object positioning) does not support this interface. Only
the new SpatialPannerNode will support this. Once the major browser support
the SpatialPannerNode, it will be implemented here. As this might happen in the
near future, I decided not to implement any interpolation logic as it will be
integrated shortly anyway. Hence, you need to interpolate the object positions 
by yourself until this is fixed.

For other object parameters (currently only Gain), the framework basically 
offers interpolation features, but I recommend not to mix them.

#### Timing
All time relevant changes (start of playback, position update, ..) is realized
with the [WAAClock](https://github.com/sebpiq/WAAClock). Once the
ObjectManager retrieved the scene data from the file, all necessary commands
are registered with WAAClock events. This makes sure that critical timing
updates are executed in time.

#### File vs Stream
Even though bogJS was designed to be capable of reading scene streams, it is
currently not supported yet. All neccesarry scene data needs to be stored in a
text file and passed to the ObjectManager instance.

## Advanced example
This example uses audio beds over the entire duration, single objects and
grouped objects with changing positions and other settings over time.

```spatdif
/spatdif/meta/audiobed/url demos/5ch_bed_music1+2_atmo3+4_speech5
/spatdif/meta/audiobed/tracks 5

/spatdif/time 0.0
/spatdif/source/Bed0/position -1.0 0.0 -1.0
/spatdif/source/Bed0/active 1
/spatdif/source/Bed0/track_mapping bed_0
/spatdif/source/Bed0/gain 1
/spatdif/source/Bed1/position 1.0 0.0 -1.0
/spatdif/source/Bed1/active 1
/spatdif/source/Bed1/track_mapping bed_1
/spatdif/source/Bed1/gain 1
/spatdif/source/Bed2/position -1.0 0.0 1.0
/spatdif/source/Bed2/active 1
/spatdif/source/Bed2/track_mapping bed_2
/spatdif/source/Bed2/gain 1
/spatdif/source/Bed3/position 1.0 0.0 1.0
/spatdif/source/Bed3/active 1
/spatdif/source/Bed3/track_mapping bed_3
/spatdif/source/Bed3/gain 1
/spatdif/source/Speech/position 0.05 0.0 -2.52
/spatdif/source/Speech/active 1
/spatdif/source/Speech/track_mapping bed_4
/spatdif/source/Speech/gain 1

/spatdif/time 70.754
/spatdif/source/Birds1_L/position -0.86 0.0 -1.77
/spatdif/source/Birds1_L/interpolate 0
/spatdif/source/Birds1_L/active 1
/spatdif/source/Birds1_L/track_mapping http://akamai-progressive.irt.de/demos/vulcano/Geflatter_1+3_L
/spatdif/source/Birds1_L/gain 1
/spatdif/source/Birds1_L/interactive 0
/spatdif/source/Birds1_R/position 0.86 0.0 -1.79
/spatdif/source/Birds1_R/interpolate 0
/spatdif/source/Birds1_R/active 1
/spatdif/source/Birds1_R/track_mapping http://akamai-progressive.irt.de/demos/vulcano/Geflatter_1+3_R
/spatdif/source/Birds1_R/gain 1
/spatdif/source/Birds1_R/interactive 0

/spatdif/time 70.804
/spatdif/source/Birds1_L/position -0.8605 0.0 -1.645
/spatdif/source/Birds1_R/position 0.8595 0.0 -1.6645

/spatdif/time 70.854
/spatdif/source/Birds1_L/position -0.861 0.0 -1.52
/spatdif/source/Birds1_R/position 0.859 0.0 -1.539

/spatdif/time 117.55
/spatdif/source/Stones_L/position -0.64 0.0 -0.79
/spatdif/source/Stones_L/active 1
/spatdif/source/Stones_L/track_mapping http://akamai-progressive.irt.de/demos/vulcano/Gesteinsbrocken_L
/spatdif/source/Stones_L/gain 1
/spatdif/source/Stones_L/interactive 0
/spatdif/source/Stones_L/group Stones

/spatdif/source/Stones_R/position 0.29 0.0 -0.88
/spatdif/source/Stones_R/active 1
/spatdif/source/Stones_R/track_mapping http://akamai-progressive.irt.de/demos/vulcano/Gesteinsbrocken_R
/spatdif/source/Stones_R/gain 1
/spatdif/source/Stones_R/interactive 0
/spatdif/source/Stones_R/group Stones

/spatdif/time 117.6
/spatdif/source/Stones_L/position -0.6215 0.0 -0.7375
/spatdif/source/Stones_R/position 0.2905 0.0 -0.8255
/spatdif/source/Stones_R/gain 0.75

/spatdif/time 120.0
/spatdif/source/Stones_L/position -0.603 0.0 -0.685
/spatdif/source/Stones_L/active 0
/spatdif/source/Stones_R/position 0.291 0.0 -0.771
/spatdif/source/Stones_R/gain 0.5

/spatdif/time 123.8
/spatdif/source/Stones_L/position -0.5845 0.0 -0.6325
/spatdif/source/Stones_L/active 1
/spatdif/source/Stones_R/position 0.2915 0.0 -0.7165
/spatdif/source/Stones_R/gain 0.25
```


## Authors
Michael Weitnauer (<weitnauer@irt.de>), Michael Meier (<meier@irt.de>)

## Acknowledgement
Parts of this framework were developed in the European collaborative research 
project [ORPHEUS](http://orpheus-audio.eu). This project has received funding 
from the European Union's Horizon 2020 research and innovation programme under 
grant agreement No 687645.
Follow ORPHEUS on Twitter: [@ORPHEUS_AUDIO](https://twitter.com/ORPHEUS_AUDIO)

## License
This framework is published under the [MIT](./LICENSE) License.

## 3rd Party Libraries used for this Project
- [jQuery](https://github.com/jquery/jquery)
- [jQuery mousewheel](https://github.com/jquery/jquery-mousewheel)
- [jQuery UI](https://github.com/jquery/jquery-ui)
- [jQuery Transit](https://github.com/rstacruz/jquery.transit)
- [loglevel](https://github.com/pimterry/loglevel)
- [underscore.js](https://github.com/jashkenas/underscore)
- [WAAClock.js](https://github.com/sebpiq/WAAClock)
