#!/bin/bash
set -e

SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
SUB_SCRIPT="$SCRIPT_DIR/list_i18n_keys.js"
PACKAGES_DIR="$SCRIPT_DIR/../../js/packages"
I18N_JSON="$PACKAGES_DIR/berty-i18n/locale/en-US/messages.json"
KEYS=$(mktemp)
MATCHES=$(mktemp)

"$SUB_SCRIPT" "$I18N_JSON" > "$KEYS"

grep -Ff "$KEYS" -r "$PACKAGES_DIR" > "$MATCHES"

RESULT=""
for KEY in $(cat "$KEYS"); do
    if ! grep -F "$KEY" "$MATCHES" > /dev/null ; then
        RESULT="$RESULT\t$KEY\n"
    fi
done

if [ -n "$RESULT" ]; then
    printf "Unused keys:\n$RESULT"
    exit 1
fi
