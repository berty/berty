#!/bin/sh

JAVA_VER=$(java -version 2>&1 | sed -n ';s/.* version "\(.*\)\.\(.*\)\..*"/\1\2/p;')
if [ "$JAVA_VER" != "$1" ] ; then
  >&2 echo "ERROR: Invalid java version, want $1, got $JAVA_VER"
  exit 1
fi
