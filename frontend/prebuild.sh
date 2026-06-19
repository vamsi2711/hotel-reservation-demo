#!/bin/sh
rm -rf ./build
cd ./public
find . -type d -exec mkdir -p -- ../build/{} \;
bash -c "cd .. && cp -r ./public/{css,img,js} build"
