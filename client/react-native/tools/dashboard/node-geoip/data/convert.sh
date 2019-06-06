#!/bin/bash
for filename in ./*.dat; do
  node convert.js "$filename" > "$filename.js"
done
