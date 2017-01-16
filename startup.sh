#!/usr/bin/env bash
BASEDIR=$(dirname "$0")
cd "$BASEDIR"
pm2 start index.js --node-args="--expose-gc --harmony-async-await" --name "validium-auth"