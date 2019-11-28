#!/bin/sh

set -e

read_char() {
  stty -icanon -echo
  eval "$1=\$(dd bs=1 count=1 2>/dev/null)"
  stty icanon echo
}

char=

make run.${PLATFORM}.debug || true

while true; do
  echo
  echo 'Press r -> Rebuild the native code'
  printf 'Press q -> Quit tmux. If the pane is dead, use ctrl-b then & then y'
  read_char char

  echo
  echo
  if [ "$char" = "r" ]; then
    make run.${PLATFORM}.debug || true
  elif [ "$char" = "q" ]; then
    tmux kill-window
  fi
done < "${1:-/dev/stdin}"
