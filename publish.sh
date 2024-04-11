#!/usr/bin/env bash

. ~/.nvm/nvm.sh

loc="loc: publish.sh;"
echo "${loc} Enter."

if [ -z "$VA_NEXUS_USER" ]; then
    echo "${loc} Warning; VA_NEXUS_USER not set"
    exit 1
fi

if [ -z "$VA_NEXUS_PWD" ]; then
    echo "${loc} Warning; VA_NEXUS_PWD not set"
    exit 1
fi

echo "${loc} Initializing .npmrc"
NEXUS=$VA_NEXUS_USER:$VA_NEXUS_PWD
AUTH=`echo -n $NEXUS | openssl base64`

echo "//nexus.mobilehealth.va.gov/content/repositories/npm-internal/:_auth=$AUTH
@va-mobile:registry=https://nexus.mobilehealth.va.gov/content/repositories/npm-internal/
email=nobody
always-auth=true
strict-ssl=false" > .npmrc

echo "${loc} Exit."
nvm install v20.12.1
npm pack
npm publish --verbose
