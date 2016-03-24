#!/bin/bash

## Required steps to make this script running (tested on OS X 10.11.2):
# brew install opus-tools vorbis-tools
# cd $( brew --prefix )
# brew unlink opus-tools
# brew git checkout c2e5077062344a1ffb90f0b871bc574227e7790d Library/Formula/opus-tools.rb
# OR
# brew install https://raw.githubusercontent.com/kickermeister/homebrew-versions/patch-1/opus-tools.rb
# brew install opus-tools
# brew pin opus-tools

chs=$1
chs_internal=`expr $chs - 1`
file=$2

mp4_name=`basename "$file" .wav`.mp4
opus_name=`basename "$file" .wav`.opus

# Now merge all sinus wav files
#sox -b 16 $file $file


if [ $chs -lt 3 ]
then
    ffmpeg -i $file -c:a libfdk_aac -cutoff 20000 $mp4_name
elif [ $chs -eq 3 ]
then
    afconvert -f mp4f -d aac@48000 -c 3 -l AAC_3_0 $file -o $mp4_name
elif [ $chs -eq 4 ]
then
    afconvert -f mp4f -d aac@48000 -c 4 -l AAC_Quadraphonic $file -o $mp4_name
elif [ $chs -eq 5 ]
then
    afconvert -f mp4f -d aac@48000 -c 5 -l AAC_5_0 $file -o $mp4_name
elif [ $chs -eq 6 ]
then
    afconvert -f mp4f -d aac@48000 -c 6 -l AAC_6_0 $file -o $mp4_name
elif [ $chs -eq 7 ]
then
    afconvert -f mp4f -d aac@48000 -c 7 -l AAC_7_0 $file -o $mp4_name
elif [ $chs -eq 8 ]
then
    afconvert -f mp4f -d aac@48000 -c 8 -l AAC_Octagonal $file -o $mp4_name
else
    echo "======================================================="
    echo "aac encoding not possible for this channel number"
    echo "======================================================="
fi


oggenc $file --advanced-encode-option disable_coupling=1

# as the current version of opus-tools (0.1.9) does no more support the
# uncoupled flag, we switched to the last working version (0.1.6) but using
# the current libopus version (1.1.2). This version supports the uncoupled
# flag, but does not advertise it. 
#
# This can be done by using an old Formula of opus-tools (0.1.6):
#  git checkout c2e5077062344a1ffb90f0b871bc574227e7790d /usr/local/Library/Formula/opus-tools.rb
#
# Moreover, we prevent updates for
# opus-tools by "pinning" it with homebrew. You might want to "unpin" the
# formula by executing 
#   brew unpin opus-tools
# NOTE: In case you might get into trouple in the future: http://stackoverflow.com/questions/3987683/homebrew-install-specific-version-of-formula
opusenc --uncoupled $file $opus_name



#ffmpeg -i sync_test.mp4 -i $mp4_name -c:v copy -c:a copy -bsf:a aac_adtstoasc `basename "$file" .wav`_vid.mp4
#ffmpeg -i sync_test.webm -i $opus_name -c:v copy -c:a copy `basename "$file" .wav`_vid.webm

