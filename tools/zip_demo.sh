#!/bin/bash

zip bogJS_demo.zip ../css/* \
                   ../css/images/* \
                   ../fonts/* \
                   ../img/* \
                   ../demos/360/index.html \
                   ../demos/360/valiant360/css/valiant360.css \
                   ../demos/360/valiant360/jquery.valiant360.js \
                   ../demos/360/valiant360/js/three.min.js \
                   ../dist/bogJS-latest.* \
                   ../dist/bogJS-dev.* \
                   ../scenes/romeo_XYZconverted.spatdif \
                   ../scenes/debo.spatdif \
                   ../scenes/LongTrainRunning_short.spatdif \
                   ../scenes/Vulkane360_XYZconverted.spatdif \
                   -X -x *.wav .git* ../_site/ ../out/ ../doc/ zip_demo.sh bogJS_demo/


#tar --exclude='*.wav' \
#    --exclude='.git*' \
#    --exclude='_site/' \
#    --exclude='out/' \
#    --exclude='zip_demo.sh' \
#    --exclude='index.html.developing' \
#    -cvzf bogJS_demo.tar.gz css/* \
#                            css/images/* \
#                            fonts/* \
#                            img/* \
#                            js/* \
#                            scenes/romeo.spatdif \
#                            scenes/LongTrainRunning_short.spatdif \
#                            signals/romeo/* \
#                            signals/LongTrainRunning/* \
#                            ./* \
#                            ../html5_player/script/irtPlayer_new.js 


