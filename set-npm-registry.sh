#!/usr/bin/env bash

if [ -z "$VA_NEXUS_USER" ]; then
    echo "Warning; VA_NEXUS_USER not set"
    exit 1
fi

if [ -z "$VA_NEXUS_PWD" ]; then
    echo "Warning; VA_NEXUS_PWD not set"
    exit 1
fi

COMBO=$VA_NEXUS_USER:$VA_NEXUS_PWD
AUTH=`echo -n $COMBO | openssl base64`

echo "_auth=$AUTH
registry=https://nexus.mobilehealth.va.gov/content/repositories/npm-all/
email=nobody
always-auth=true
strict-ssl=false" > .npmrc