#!/bin/bash

. ~/.nvm/nvm.sh

NEXUS=$VA_NEXUS_USER:$VA_NEXUS_PWD
AUTH=`echo -n $NEXUS | openssl base64`

echo "//nexus.mapsandbox.net/content/repositories/npm-internal/:_auth=$AUTH
@va-mobile:registry=https://nexus.mapsandbox.net/content/repositories/npm-internal/
email=nobody
always-auth=true
strict-ssl=false" > .npmrc

nvm install v20.10.0
npm run build
npm pack
npm publish --verbose
