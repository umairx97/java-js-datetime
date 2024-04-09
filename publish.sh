#!/bin/bash

. ~/.nvm/nvm.sh

NEXUS=$VA_NEXUS_USER:$VA_NEXUS_PWD
AUTH=`echo -n $NEXUS | openssl base64`

echo "//nexus.mobilehealth.va.gov/content/repositories/npm-internal/:_auth=$AUTH
@va-mobile:registry=https://nexus.mobilehealth.va.gov/content/repositories/npm-internal/
email=nobody
always-auth=true
strict-ssl=false" > .npmrc

nvm install v20.12.1
npm publish --verbose
