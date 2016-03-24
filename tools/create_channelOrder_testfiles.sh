#!/bin/bash

mkdir -p tmp_wav

declare -a frqs=(100.0 500.0 1000.0 2000.0 3000.0 4000.0 5000.0 6000.0 7000.0 8000.0 9000.0 10000.0 11000.0)

chs=$1
chs_internal=`expr $chs - 1`

# Generate wav files with spoken trial and condition numbers
for number in `seq 0 $chs_internal`; do
    sox -b 16 -n tmp_wav/"ch"$number".wav" synth 1.0 sin ${frqs[$number]} gain -9 
    printf "."
done

printf "\n"


new_wav=signals/order/$chs"chs".wav
mp4_name=signals/order/`basename "$new_wav" .wav`.mp4
opus_name=signals/order/`basename "$new_wav" .wav`.opus

# Now merge all sinus wav files
sox -b 16 -M tmp_wav/*.wav $new_wav


if [ $chs -lt 3 ]
then
    ffmpeg -i $new_wav -c:a libfdk_aac -cutoff 20000 $mp4_name
elif [ $chs -eq 3 ]
then
    afconvert -f mp4f -d aac@48000 -c 3 -l AAC_3_0 $new_wav -o $mp4_name
elif [ $chs -eq 4 ]
then
    afconvert -f mp4f -d aac@48000 -c 4 -l AAC_Quadraphonic $new_wav -o $mp4_name
elif [ $chs -eq 5 ]
then
    afconvert -f mp4f -d aac@48000 -c 5 -l AAC_5_0 $new_wav -o $mp4_name
elif [ $chs -eq 6 ]
then
    afconvert -f mp4f -d aac@48000 -c 6 -l AAC_6_0 $new_wav -o $mp4_name
elif [ $chs -eq 7 ]
then
    afconvert -f mp4f -d aac@48000 -c 7 -l AAC_7_0 $new_wav -o $mp4_name
elif [ $chs -eq 8 ]
then
    afconvert -f mp4f -d aac@48000 -c 8 -l AAC_Octagonal $new_wav -o $mp4_name
else
    echo "======================================================="
    echo "aac encoding not possible for this channel number"
    echo "======================================================="
fi


oggenc $new_wav --advanced-encode-option disable_coupling=1

# as the current version of opus-tools (0.1.9) does no more support the
# uncoupled flag, we switched to the last working version (0.1.6) but using
# the current libopus version (1.1.1). Moreover, we prevent updates for
# opus-tools by "pinning" it with homebrew. You might want to "unpin" the
# formula by executing 
#   brew unpin opus-tools
# NOTE: In case you might get into trouple in the future: http://stackoverflow.com/questions/3987683/homebrew-install-specific-version-of-formula
opusenc --uncoupled $new_wav $opus_name



#ffmpeg -i sync_test.mp4 -i $mp4_name -c:v copy -c:a copy -bsf:a aac_adtstoasc `basename "$new_wav" .wav`_vid.mp4
#ffmpeg -i sync_test.webm -i $opus_name -c:v copy -c:a copy `basename "$new_wav" .wav`_vid.webm

rm -r tmp_wav
