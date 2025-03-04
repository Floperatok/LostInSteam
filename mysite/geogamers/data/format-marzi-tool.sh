#!/bin/bash

zip_filename="project-title.zip"
raw_panos_folder="geogamers_panos"

if [ ! -f "$zip_filename" ]; then 
	echo "$zip_filename not found"
	exit
fi

if [ -z "$1" ]; then
	read -p "Enter game name: " game_name
else
	game_name=$1
fi

if [ -f "$game_name" ]; then
	echo "'$game_name' already exists"
	exit
fi

unzip $zip_filename

sed -i "1s/.*/{/;$ s/.*/}/" app-files/data.js

mkdir $game_name
i=0
for dirname in app-files/tiles/*; do
	pano_path="$game_name/$i"
	mv "$dirname" "$pano_path"
	cp $raw_panos_folder/$game_name/$i/* $pano_path/
	echo "$dirname -> $pano_path"
	jq "{levels: .scenes[$i].levels, \
		faceSize: .scenes[$i].faceSize, \
		initialViewParameters: .scenes[$i].initialViewParameters}" app-files/data.js \
		> $pano_path/data.json
	((i++))
done

rm -rf project-title.zip \
	README.txt \
	LICENSE.txt \
	app-files 