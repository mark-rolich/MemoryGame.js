#!/bin/bash
for file in $(ls ./videos); do
  filename=$(basename $file .mp4)
  echo $filename
  ffmpeg -i ./videos/$filename.mp4 -c copy -an ./videos/$filename-nosound.mp4
  ffmpeg -i ./videos/$filename-nosound.mp4 -vf scale=216:384 ./videos/$filename-nosound-small.mp4
done
