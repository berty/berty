#!/bin/bash -xe

# This script is called from the js/ folder with `make ios.release`

APP_NAME=${APP_NAME:-berty}
APP_CONFIG=${APP_CONFIG:-development}
APP_TARGET=${APP_TARGET:-debug}
IOS_RELEASE_METHOD=${IOS_RELEASE_METHOD:-development}
IOS_PROFILE=${IOS_PROFILE:-Development}
APP_DEST=${APP_DEST:-build/ios-${APP_TARGET}/${APP_CONFIG}}
TARGET_VERSION=${TARGET_VERSION:-$(git describe --tags --always | tr - . | sed -E 's`v([0-9]+\.[0-9]+\.[0-9]+)\.?([0-9]*)?.*`\1`g')}
TARGET_BUILD=${TARGET_BUILD:-$(git describe --tags --always | tr - . | sed -E 's`v([0-9]+\.[0-9]+\.[0-9]+)\.?([0-9]*)?.*`\2`g')}
KEYCHAIN_NAME=${KEYCHAIN_NAME:-berty_keychain}
KEYCHAIN_PASSWORD=${KEYCHAIN_PASSWORD:-berty_pass}
CERTS_GIT_URL=${CERTS_GIT_URL:-git@github.com:berty/berty-ios-certs}

export FL_BUILDLOG_PATH=${APP_DEST}
export KEYCHAIN_NAME=${KEYCHAIN_NAME}
export KEYCHAIN_PASSWORD=${KEYCHAIN_PASSWORD}
if [ "$CI" = "true" ]; then
    # use default keychain if not in CI
    export MATCH_KEYCHAIN_NAME=${KEYCHAIN_NAME}
fi
export MATCH_KEYCHAIN_PASSWORD=${KEYCHAIN_PASSWORD}
export GYM_CLEAN=false
export GYM_EXPORT_METHOD=${IOS_RELEASE_METHOD}
export GYM_OPTION_METHOD=${IOS_RELEASE_METHOD}
export GYM_OPTION_APP_ID=${IOS_BUNDLE_ID}
export GYM_OPTION_PROVISIONING_PROFILE="match ${IOS_PROFILE} ${IOS_BUNDLE_ID}"
export GYM_OUTPUT_NAME=$(echo ${APP_NAME} | packages/berty-app/node_modules/.bin/caser --pascal)
export GYM_OUTPUT_DIRECTORY=${APP_DEST}
export GYM_WORKSPACE=ios/$(echo ${APP_NAME} | packages/berty-app/node_modules/.bin/caser --pascal).xcworkspace
export GYM_SCHEME=${APP_TARGET}
export GYM_SKIP_PROFILE_DETECTION=true
export GYM_INCLUDE_SYMBOLS=false

cd packages/berty-app

# setup ci if needed
if [ "$CI" = "true" ]; then
	# create temporary keychain
	bundle exec fastlane run create_keychain timeout:3600 default_keychain:true unlock:true add_to_search_list:true
    # setup app version
	plutil -replace CFBundleShortVersionString -string ${TARGET_VERSION} ios/Berty/Info.plist
    plutil -replace CFBundleVersion -string ${TARGET_BUILD} ios/Berty/Info.plist
fi

# get ios certificates
bundle exec fastlane run match --verbose type:$(echo ${IOS_RELEASE_METHOD} | sed 's/-//g') app_identifier:${IOS_BUNDLE_ID} team_id:${IOS_TEAM_ID} readonly:true git_url:${CERTS_GIT_URL}

# build
time bundle exec fastlane ios build --verbose
