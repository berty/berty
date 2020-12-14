#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
INDEX="$DIR/node_modules/react-native-web/dist/index.js"
PATCH='
import PropTypes from "prop-types";

export var ViewPropTypes = {
    style: PropTypes.shape({
        style: PropTypes.any,
    }),
};
'

if test -f "$INDEX"; then
    if ! grep -q "export var ViewPropTypes" "$INDEX"; then
        echo "$PATCH" >> "$INDEX"
    fi
else
    echo "error: $INDEX doesn't exist"
    exit 1
fi
