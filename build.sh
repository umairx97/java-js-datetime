#!/bin/bash

. ~/.nvm/nvm.sh

NEXUS=$VA_NEXUS_USER:$VA_NEXUS_PWD
AUTH=`echo -n $NEXUS | openssl base64`

echo "//nexus.mobilehealth.va.gov/content/repositories/npm-all/:_auth=$AUTH
registry=https://nexus.mobilehealth.va.gov/content/repositories/npm-all/
email=nobody
always-auth=true
strict-ssl=false" > .npmrc

nvm install v20.10.0
npm install
npm run test
