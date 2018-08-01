#!/bin/bash

set -ex
NDK="android-ndk-r12b"
# Download source
OPENSSL_VERSION=1.0.2o
if [ ! -e "openssl-${OPENSSL_VERSION}.tar.gz" ]; then
  curl -O "https://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz"  --retry 5
fi

# Extract source
rm -rf "openssl-${OPENSSL_VERSION}"
tar zxf "openssl-${OPENSSL_VERSION}.tar.gz"

if [ ! -e "${NDK}-darwin-x86_64.zip" ]; then
  curl -O "https://dl.google.com/android/repository/${NDK}-darwin-x86_64.zip" --retry 5
fi

rm -rf "${NDK}"
echo "Unizipping ndk"
unzip -qo "${NDK}-darwin-x86_64.zip"

if [  "${PLATFORM_TARGET}" == "" ]; then
  echo "No platform target set, using iOS."
  export PLATFORM_TARGET="iOS"
fi
echo "Using platform target: $PLATFORM_TARGET."

SDK=$1
if [ "${SDK}" == "" ]
then
  SDK_PREFIX="iphoneos"
  if [ "$PLATFORM_TARGET" == "macOS" ]; then
    SDK_PREFIX="macosx"
  fi
  AVAIL_SDKS=`xcodebuild -showsdks | grep "$SDK_PREFIX"`
  FIRST_SDK=`echo "$AVAIL_SDKS" | head -n1`
  if [ "$AVAIL_SDKS" == "$FIRST_SDK" ]; then
    SDK=`echo "$FIRST_SDK" | cut -d\  -f2`
    echo "No SDK specified. Using the only one available: $PLATFORM_TARGET $SDK"
  else
    echo "Please specify an $PLATFORM_TARGET SDK version number from the following possibilities:"
    echo "$AVAIL_SDKS"
    exit 1
  fi
fi

if [ -n "${ARCHS}" ]; then
  echo "Building user-defined architectures: ${ARCHS}"
else
	if [ "$PLATFORM_TARGET" == "iOS" ]; then
  	ARCHS="i386 x86_64 armv7 arm64"
  else
  	ARCHS="i386 x86_64"
  fi
  echo "Building architectures: ${ARCHS}"
fi

LIBRARY="openssl"

# Versions
export MIN_IOS_VERSION="8.0"
export MIN_OSX_VERSION="10.10"
export OPENSSL_VERSION="1.0.2o"
export LIBEVENT_VERSION="2.0.22-stable"
export TOR_VERSION="0.3.0.13"

BUILT_ARCHS=()
DEVELOPER=`xcode-select --print-path`
cd "`dirname \"$0\"`"
TOPDIR=$(pwd)

BUILT_DIR="${TOPDIR}/built"
IOS_BUILT_DIR="${BUILT_DIR}/ios"
ANDROID_BUILT_DIR="${BUILT_DIR}/android"
if [ ! -d "${BUILT_DIR}" ]; then
  mkdir -p "${BUILT_DIR}"
  mkdir -p "${IOS_BUILT_DIR}"
  mkdir -p "${ANDROID_BUILT_DIR}"
fi

BUILD_DIR="${TOPDIR}/build"
if [ ! -d "${BUILD_DIR}" ]; then
  mkdir -p "${BUILD_DIR}"
fi

cd ${BUILD_DIR}

for ARCH in ${ARCHS}
do
  if [ "$PLATFORM_TARGET" == "iOS" ]; then
    if [ "${ARCH}" == "i386" ] || [ "${ARCH}" == "x86_64" ]; then
        PLATFORM="iPhoneSimulator"
        PLATFORM_SDK="iphonesimulator${SDK}"
    else
        PLATFORM="iPhoneOS"
        PLATFORM_SDK="iphoneos${SDK}"
    fi
    export PLATFORM_VERSION_MIN="-miphoneos-version-min=${MIN_IOS_VERSION}"
  else
    PLATFORM="MacOSX"
    PLATFORM_SDK="macosx${SDK}"
    export PLATFORM_VERSION_MIN="-mmacosx-version-min=${MIN_OSX_VERSION}"
  fi

  ROOTDIR="${BUILD_DIR}/${PLATFORM}-${SDK}-${ARCH}"
  rm -rf "${ROOTDIR}"
  mkdir -p "${ROOTDIR}"

  ARCH_BUILT_DIR="${IOS_BUILT_DIR}/${ARCH}"
  if [ ! -d "${ARCH_BUILT_DIR}" ]; then
    mkdir -p "${ARCH_BUILT_DIR}"
  fi

  ARCH_BUILT_HEADERS_DIR="${ARCH_BUILT_DIR}/include"
  if [ ! -d "${ARCH_BUILT_HEADERS_DIR}" ]; then
    mkdir "${ARCH_BUILT_HEADERS_DIR}"
  fi

  export TOPDIR="${TOPDIR}"
  export ARCH_BUILT_HEADERS_DIR="${ARCH_BUILT_HEADERS_DIR}"
  export ARCH_BUILT_DIR="${ARCH_BUILT_DIR}"
  export DEVELOPER="${DEVELOPER}"
  export ROOTDIR="${ROOTDIR}"
  export PLATFORM="${PLATFORM}"
  export SDK="${SDK}"
  export ARCH="${ARCH}"
  export SDK_PATH=$(xcrun -sdk ${PLATFORM_SDK} --show-sdk-path)
  export CLANG=$(xcrun -sdk ${PLATFORM_SDK} -find clang)

  echo "Building ${LIBRARY} for ${ARCH}..."
  if [ "${USE_BUILD_LOG}" == "true" ]; then
    ../openssl-ios.sh > "${ROOTDIR}-${LIBRARY}.log"
  else
    ../openssl-ios.sh
  fi

  # Remove junk
  rm -rf "${ROOTDIR}"
  BUILT_ARCHS+=("${ARCH}")
done

cd ../

BINS=(libcrypto.a libssl.a)
NUMBER_OF_BUILT_ARCHS=${#BUILT_ARCHS[@]}
for BIN in ${BINS[@]}; do
  FILE_ARCH_PATHS=( "${BUILT_ARCHS[@]/#/${IOS_BUILT_DIR}/}" )
  FILE_ARCH_PATHS=( "${FILE_ARCH_PATHS[@]/%//${BIN}}" )
  if [ "${NUMBER_OF_BUILT_ARCHS}" == "1" ]; then
    for FILE_ARCH_PATH in ${FILE_ARCH_PATHS[@]}; do
      echo "${BIN} only built for (${BUILT_ARCHS}), skipping lipo and copying to ${IOS_BUILT_DIR}/${BIN}"
      cp "${FILE_ARCH_PATH}" "${IOS_BUILT_DIR}/${BIN}"
    done
  else
    xcrun -sdk iphoneos lipo ${FILE_ARCH_PATHS[@]} -create -output "${IOS_BUILT_DIR}/${BIN}"
  fi
done

echo "Success! Finished building ${LIBRARY} for ${ARCHS}."


ARCHS="x86_64 aarch64"
cd "openssl-${OPENSSL_VERSION}"
for ARCH in ${ARCHS}
do
	ARCH_BUILT_DIR="${ANDROID_BUILT_DIR}/${ARCH}"
  if [ ! -d "${ARCH_BUILT_DIR}" ]; then
    mkdir -p "${ARCH_BUILT_DIR}"
  fi

  ARCH_BUILT_HEADERS_DIR="${ARCH_BUILT_DIR}/include"
  if [ ! -d "${ARCH_BUILT_HEADERS_DIR}" ]; then
    mkdir "${ARCH_BUILT_HEADERS_DIR}"
  fi
  rm -rf ${TOPDIR}/android-toolchain
  ${TOPDIR}/${NDK}/build/tools/make-standalone-toolchain.sh --platform=android-21 --toolchain=${ARCH}-linux-android-4.9 --install-dir=${TOPDIR}/android-toolchain
  export TOOLCHAIN_PATH=${TOPDIR}/android-toolchain/bin
  export TOOL=${ARCH}-linux-android
  export NDK_TOOLCHAIN_BASENAME=${TOOLCHAIN_PATH}/${TOOL}
  export CC=$NDK_TOOLCHAIN_BASENAME-gcc
  export CXX=$NDK_TOOLCHAIN_BASENAME-g++
  export LINK=${CXX}
  export LD=$NDK_TOOLCHAIN_BASENAME-ld
  export AR=$NDK_TOOLCHAIN_BASENAME-ar
  export RANLIB=$NDK_TOOLCHAIN_BASENAME-ranlib
  export STRIP=$NDK_TOOLCHAIN_BASENAME-strip
  case "${ARCH}" in
    x86_64)
      ./Configure linux-generic64 -fpic -mandroid
      ;;
    aarch64)
      ./Configure linux-aarch64 -fpic -mandroid
      ;;
  esac
  make clean
  make
  mkdir -p ${ARCH_BUILT_DIR}
  cp libssl.a libcrypto.a ${ARCH_BUILT_DIR}/.
  cp -R "./include/openssl" "${ARCH_BUILT_HEADERS_DIR}"
done

ARCHS="x86 arm"
for ARCH in ${ARCHS}
do
  rm -rf ${TOPDIR}/android-toolchain

  ARCH_BUILT_DIR="${ANDROID_BUILT_DIR}/${ARCH}"
  if [ ! -d "${ARCH_BUILT_DIR}" ]; then
    mkdir -p "${ARCH_BUILT_DIR}"
  fi

  ARCH_BUILT_HEADERS_DIR="${ARCH_BUILT_DIR}/include"
  if [ ! -d "${ARCH_BUILT_HEADERS_DIR}" ]; then
    mkdir "${ARCH_BUILT_HEADERS_DIR}"
  fi
  case "${ARCH}" in
    x86)
      ${TOPDIR}/${NDK}/build/tools/make-standalone-toolchain.sh --platform=android-19 --toolchain=${ARCH}-4.9 --install-dir=${TOPDIR}/android-toolchain
      export TOOLCHAIN_PATH=${TOPDIR}/android-toolchain/bin
      export TOOL=i686-linux-android
      ;;
    arm)
      ${TOPDIR}/${NDK}/build/tools/make-standalone-toolchain.sh --platform=android-19 --toolchain=arm-linux-androideabi-4.9 --install-dir=${TOPDIR}/android-toolchain
      export TOOLCHAIN_PATH=${TOPDIR}/android-toolchain/bin
      export TOOL=arm-linux-androideabi
      ;;
  esac
  export NDK_TOOLCHAIN_BASENAME=${TOOLCHAIN_PATH}/${TOOL}
  export CC=$NDK_TOOLCHAIN_BASENAME-gcc
  export CXX=$NDK_TOOLCHAIN_BASENAME-g++
  export LINK=${CXX}
  export LD=$NDK_TOOLCHAIN_BASENAME-ld
  export AR=$NDK_TOOLCHAIN_BASENAME-ar
  export RANLIB=$NDK_TOOLCHAIN_BASENAME-ranlib
  export STRIP=$NDK_TOOLCHAIN_BASENAME-strip
  case "${ARCH}" in
    x86)
      ./Configure android-x86
      ;;
    arm)
      ./Configure android-armv7
      ;;
  esac
  make clean
  make
  mkdir -p ${ARCH_BUILT_DIR}
  cp libssl.a libcrypto.a ${ARCH_BUILT_DIR}/.
  cp -R "./include/openssl" "${ARCH_BUILT_HEADERS_DIR}"
done

cd ../
rm -rf build
