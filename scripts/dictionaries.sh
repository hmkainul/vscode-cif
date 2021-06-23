#!/usr/bin/env bash
pushd .
mkdir -p $(pwd)/server/dictionaries
cd $(pwd)/server/dictionaries
mkdir -p temp
pushd temp
curl -O ftp://ftp.iucr.org/pub/cifdics/cifdic.register
node -e 'require("../../out/dictionaries").readRegister()' > temp.sh
popd
sh ./temp/temp.sh
popd
