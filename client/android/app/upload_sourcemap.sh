#!/bin/sh
cd ../.. || exit
chmod 700 "${JS_OUTPUT_SOURCE_MAP_FILE}"
curl \
    -X POST "https://api.instabug.com/api/sdk/v3/symbols_files" \
    -F "symbols_file=@${JS_OUTPUT_SOURCE_MAP_FILE}" \
    -F "application_token=${INSTABUG_APP_TOKEN}" \
    -F "platform=react_native" \
    -F "os=android"
