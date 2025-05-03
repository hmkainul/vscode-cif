#!/usr/bin/env bash
pushd .
mkdir -p $(pwd)/client/resources
cd $(pwd)/client/resources
mkdir -p temp
pushd temp
curl -O ftp://ftp.iucr.org/pub/cifdics/cifdic.register
node -e 'require("../../../server/out/dictionaries").readRegister()' > temp.sh
popd
sh ./temp/temp.sh
popd
