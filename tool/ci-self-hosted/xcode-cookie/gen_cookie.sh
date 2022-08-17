#!/bin/bash

# Ensure that CWD is the script dir
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"

# Check if env it set correctly
if [[ -z "${FASTLANE_USER}" || -z "${FASTLANE_PASSWORD}" ]]; then
    echo "error: FASTLANE_USER and FASTLANE_PASSWORD env variables must be set"
    exit 1
fi

# Check if fastlane cookie is still valid
if bundle exec fastlane spaceauth --check_session; then
    echo "Fastlane cookie for user $FASTLANE_USER is still valid"

# if not, run fastlane to generate a new cookie
else
    CI=1 bundle exec fastlane spaceauth
fi

# Copy cookie in the script directory
cp "$HOME/.fastlane/spaceship/$FASTLANE_USER/cookie" "$SCRIPT_DIR"
