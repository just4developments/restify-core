#!/usr/bin/env bash
BASEDIR=$(dirname "$0")
cd "$BASEDIR"
mongorestore --host 127.0.0.1