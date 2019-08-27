#!/bin/sh
curl \
    -X POST "https://api.instabug.com/api/sdk/v3/symbols_files" \
    -F "symbols_file=@./android-sourcemap.json" \
    -F "application_token=${INSTABUG_APP_TOKEN}" \
    -F "platform=react_native" \
    -F "os=android"
