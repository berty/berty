#!/usr/bin/env bash
#
# ANSI code generator
#
# © Copyright 2015 Tyler Akins
# Licensed under the MIT license with an additional non-advertising clause
# See http://github.com/fidian/ansi

ansi::addCode() {
    local N

    if [[ "$1" == *=* ]]; then
        N="${1#*=}"
        N="${N//,/;}"
    else
        N=""
    fi

    OUTPUT="$OUTPUT$CSI$N$2"
}

ansi::addColor() {
    OUTPUT="$OUTPUT$CSI${1}m"

    if [ ! -z "$2" ]; then
        SUFFIX="$CSI${2}m$SUFFIX"
    fi
}

ansi::colorTable() {
    local FNB_LOWER FNB_UPPER PADDED

    FNB_LOWER="$(ansi::colorize 2 22 f)n$(ansi::colorize 1 22 b)"
    FNB_UPPER="$(ansi::colorize 2 22 F)N$(ansi::colorize 1 22 B)"
    printf 'bold %s               ' "$(ansi::colorize 1 22 Sample)"
    printf 'faint %s              ' "$(ansi::colorize 2 22 Sample)"
    printf 'italic %s\n'            "$(ansi::colorize 3 23 Sample)"
    printf 'underline %s          ' "$(ansi::colorize 4 24 Sample)"
    printf 'blink %s              ' "$(ansi::colorize 5 25 Sample)"
    printf 'inverse %s\n'           "$(ansi::colorize 7 27 Sample)"
    printf 'invisible %s\n'         "$(ansi::colorize 8 28 Sample)"
    printf 'strike %s             ' "$(ansi::colorize 9 29 Sample)"
    printf 'fraktur %s            ' "$(ansi::colorize 20 23 Sample)"
    printf 'double-underline%s\n'   "$(ansi::colorize 21 24 Sample)"
    printf 'frame %s              ' "$(ansi::colorize 51 54 Sample)"
    printf 'encircle %s           ' "$(ansi::colorize 52 54 Sample)"
    printf 'overline%s\n'           "$(ansi::colorize 53 55 Sample)"
    printf '\n'
    printf '             black   red     green   yellow  blue    magenta cyan    white\n'
    for BG in 40:black 41:red 42:green 43:yellow 44:blue 45:magenta 46:cyan 47:white xx:no-bg; do
        PADDED="bg-${BG:3}           "
        PADDED="${PADDED:0:13}"
        printf '%s' "$PADDED"
        BG=${BG:0:2}
        if [[ "$BG" == "xx" ]]; then
            BG=""
        fi
        for FG in 30 31 32 33 34 35 36 37; do
            printf '%s%s;%sm' "$CSI"       "$BG"      "${FG}"
            printf '%s'       "$FNB_LOWER"
            printf '%s%sm'    "$CSI"       "$(( FG + 60 ))"
            printf '%s'       "$FNB_UPPER"
            printf '%s0m  '   "${CSI}"
        done
        printf '\n'
        if [[ -n "$BG" ]]; then
            printf '  +intense   '
            for FG in 30 31 32 33 34 35 36 37; do
                printf '%s%s;%sm' "$CSI"       "$(( BG + 60 ))" "${FG}"
                printf '%s'       "$FNB_LOWER"
                printf '%s%sm'    "$CSI"       "$(( FG + 60 ))"
                printf '%s'       "$FNB_UPPER"
                printf '%s0m  '   "${CSI}"
            done
            printf '\n'
        fi
    done
    printf '\n'
    printf 'Legend:\n'
    printf '    Normal color:  f = faint, n = normal, b = bold.\n'
    printf '    Intense color:  F = faint, N = normal, B = bold.\n'
}

ansi::colorize() {
    printf '%s%sm%s%s%sm' "$CSI" "$1" "$3" "$CSI" "$2"
}

ansi::isAnsiSupported() {
    local cont c str

    if ! test -t 1; then
        # stdout is not a terminal
        return 1
    fi

    if hash tput &> /dev/null; then
        if [[ "$(tput colors)" -lt 8 ]]; then
            return 1
        fi

        return 0
    fi

    # Query the console and see if we get ANSI codes back.
    # CSI 0 c == CSI c == Primary Device Attributes.
    # Idea:  CSI c
    # Response = CSI ? 6 [234] ; 2 2 c
    # The "22" means ANSI color, but terminals don't need to send that back.
    printf "%s0c" "$CSI"
    str=
    cont=true

    while $cont && read -n 1 -s -t 0.1 c; do
        if [[ -n "$c" ]]; then
            str+=$c
        else
            cont=false
        fi
    done

    set | grep ^str=

    # If we get anything back, the terminal is consuming the color codes and
    # will probably do its best. Let's assume there's color.
    [[ "$str" == "$CSI?6"[234]";"* ]]
}

ansi::report() {
    local BUFF C

    REPORT=""
    printf "%s%s" "$CSI" "$1"
    read -r -N ${#2} -s -t 1 BUFF

    if [ "$BUFF" != "$2" ]; then
        return 1
    fi

    read -r -N ${#3} -s -t 1 BUFF

    while [ "$BUFF" != "$3" ]; do
        REPORT="$REPORT${BUFF:0:1}"
        read -r -N 1 -s -t 1 C || exit 1
        BUFF="${BUFF:1}$C"
    done
}

ansi::showHelp() {
    cat <<EOF
Generate ANSI escape codes

Please keep in mind that your terminal must support the code in order for you
to see the effect properly.

Usage
    ansi [OPTIONS] [TEXT TO OUTPUT]

Option processing stops at the first unknown option or at "--".  Options
are applied in order as specified on the command line.  Unless --no-restore
is used, the options are unapplied in reverse order, restoring your
terminal to normal.

Optional parameters are surrounded in brackets and use reasonable defaults.
For instance, using --down will move the cursor down one line and --down=10
moves the cursor down 10 lines.

Display Manipulation
    --insert-chars[=N], --ich[=N]
                             Insert blanks at cursor, shifting the line right.
    --erase-display[=N], --ed[=N]
                             Erase in display. 0=below, 1=above, 2=all,
                             3=saved.
    --erase-line[=N], --el[=N]
                             Erase in line. 0=right, 1=left, 2=all.
    --insert-lines[=N], --il[=N]
    --delete-lines[=N], --dl[=N]
    --delete-chars[=N], --dch[=N]
    --scroll-up[=N], --su[=N]
    --scroll-down[=N], --sd[=N]
    --erase-chars[=N], --ech[=N]
    --repeat[=N], --rep[=N]  Repeat preceding character N times.

Cursor:
    --up[=N], --cuu[=N]
    --down[=N], --cud[=N]
    --forward[=N], --cuf[=N]
    --backward[=N], --cub[=N]
    --next-line[=N], --cnl[=N]
    --prev-line[=N], --cpl[=N]
    --column[=N], --cha[=N]
    --position[=[ROW],[COL]], --cup[=[ROW],[=COL]]
    --tab-forward[=N]        Move forward N tab stops.
    --tab-backward[=N]       Move backward N tab stops.
    --column-relative[=N], --hpr[=N]
    --line[=N], --vpa[=N]
    --line-relative[=N], --vpr[=N]
    --save-cursor            Saves the cursor position.  Restores the cursor
                             after writing text to the terminal unless
                             --no-restore is also used.
    --restore-cursor         Just restores the cursor.
    --hide-cursor            Will automatically show cursor unless --no-restore
                             is also used.
    --show-cursor

Colors:
    Attributes:
        --bold, --faint, --italic, --underline, --blink, --inverse,
        --invisible, --strike, --fraktur, --double-underline, --frame,
        --encircle, --overline
    Foreground:
        --black, --red, --green, --yellow, --blue, --magenta, --cyan, --white,
        --black-intense, --red-intense, --green-intense, --yellow-intense,
        --blue-intense, --magenta-intense, --cyan-intense, --white-intense
    Background:
        --bg-black, --bg-red, --bg-green, --bg-yellow, --bg-blue,
        --bg-magenta, --bg-cyan, --bg-white, --bg-black-intense,
        --bg-red-intense, --bg-green-intense, --bg-yellow-intense,
        --bg-blue-intense, --bg-magenta-intense, --bg-cyan-intense,
        --bg-white-intense
    Reset:
        --reset-attrib       Removes bold, italics, etc.
        --reset-foreground   Sets foreground to default color.
        --reset-background   Sets background to default color.
        --reset-color        Resets attributes, foreground, background.

Report:
    ** NOTE:  These require reading from stdin.  Results are sent to stdout.
    ** If no response from terminal in 1 second, these commands fail.
    --report-position        ROW,COL
    --report-window-state    "open" or "iconified"
    --report-window-position X,Y
    --report-window-pixels   HEIGHT,WIDTH
    --report-window-chars    ROWS,COLS
    --report-screen-chars    ROWS,COLS of the entire screen
    --report-icon
    --report-title

Miscellaneous:
    --color-table            Display a color table.
    --icon=NAME              Set the terminal's icon name.
    --title=TITLE            Set the terminal's window title.
    --no-restore             Do not issue reset codes when changing colors.
                             For example, if you change the color to green,
                             normally the color is restored to default
                             afterwards.  With this flag, the color will
                             stay green even when the command finishes.
    -n, --newline            Add a newline at the end.
    --bell                   Add the terminal's bell sequence to the output.
    --reset                  Reset colors, clear screen, show cursor, move
                             cursor to 1,1.
EOF
}

ansi() {
    # Handle long options until we hit an unrecognized thing
    local CONTINUE=true
    local RESTORE=true
    local NEWLINE=false
    local ESC=$'\033'
    local CSI="${ESC}["
    local OSC="${ESC}]"
    local ST="${ESC}\\"
    local OUTPUT=""
    local SUFFIX=""
    local BELL=$'\007'

    while $CONTINUE; do
        case "$1" in
            --help | -h | -\?)
                ansi::showHelp
                ;;

            # Display Manipulation
            --insert-chars | --insert-chars=* | --ich | --ich=*)
                ansi::addCode "$1" @
                ;;

            --erase-display | --erase-display=* | --ed | --ed=*)
                ansi::addCode "$1" J
                ;;

            --erase-line | --erase-line=* | --el | --el=*)
                ansi::addCode "$1" K
                ;;

            --insert-lines | --insert-lines=* | --il | --il=*)
                ansi::addCode "$1" L
                ;;

            --delete-lines | --delete-lines=* | --dl | --dl=*)
                ansi::addCode "$1" M
                ;;

            --delete-chars | --delete-chars=* | --dch | --dch=*)
                ansi::addCode "$1" P
                ;;

            --scroll-up | --scroll-up=* | --su | --su=*)
                ansi::addCode "$1" S
                ;;

            --scroll-down | --scroll-down=* | --sd | --sd=*)
                ansi::addCode "$1" T
                ;;

            --erase-chars | --erase-chars=* | --ech | --ech=*)
                ansi::addCode "$1" X
                ;;

            --repeat | --repeat=* | --rep | --rep=N)
                ansi::addCode "$1" b
                ;;

            # Cursor Positioning
            --up | --up=* | --cuu | --cuu=*)
                ansi::addCode "$1" A
                ;;

            --down | --down=* | --cud | --cud=*)
                ansi::addCode "$1" B
                ;;

            --forward | --forward=* | --cuf | --cuf=*)
                ansi::addCode "$1" C
                ;;

            --backward | --backward=*| --cub | --cub=*)
                ansi::addCode "$1" D
                ;;

            --next-line | --next-line=* | --cnl | --cnl=*)
                ansi::addCode "$1" E
                ;;

            --prev-line | --prev-line=* | --cpl | --cpl=*)
                ansi::addCode "$1" F
                ;;

            --column | --column=* | --cha | --cha=*)
                ansi::addCode "$1" G
                ;;

            --position | --position=* | --cup | --cup=*)
                ansi::addCode "$1" H
                ;;

            --tab-forward | --tab-forward=* | --cht | --cht=*)
                ansi::addCode "$1" I
                ;;

            --tab-backward | --tab-backward=* | --cbt | --cbt=*)
                ansi::addCode "$1" Z
                ;;

            --column-relative | --column-relative=* | --hpr | --hpr=*)
                ansi::addCode "$1" 'a'
                ;;

            --line | --line=* | --vpa | --vpa=*)
                ansi::addCode "$1" 'd'
                ;;

            --line-relative | --line-relative=* | --vpr | --vpr=*)
                ansi::addCode "$1" 'e'
                ;;

            --save-cursor)
                OUTPUT="$OUTPUT${CSI}s"
                SUFFIX="${CSI}u$SUFFIX"
                ;;

            --restore-cursor)
                OUTPUT="$OUTPUT${CSI}u"
                ;;

            --hide-cursor)
                OUTPUT="$OUTPUT${CSI}?25l"
                SUFFIX="${CSI}?25h"
                ;;

            --show-cursor)
                OUTPUT="$OUTPUT${CSI}?25h"
                ;;

            # Colors - Attributes
            --bold)
                ansi::addColor 1 22
                ;;

            --faint)
                ansi::addColor 2 22
                ;;

            --italic)
                ansi::addColor 3 23
                ;;

            --underline)
                ansi::addColor 4 24
                ;;

            --blink)
                ansi::addColor 5 25
                ;;

            --inverse)
                ansi::addColor 7 27
                ;;

            --invisible)
                ansi::addColor 8 28
                ;;

            --strike)
                ansi::addColor 9 20
                ;;

            --fraktur)
                ansi::addColor 20 23
                ;;

            --double-underline)
                ansi::addColor 21 24
                ;;

            --frame)
                ansi::addColor 51 54
                ;;

            --encircle)
                ansi::addColor 52 54
                ;;

            --overline)
                ansi::addColor 53 55
                ;;

            # Colors - Foreground
            --black)
                ansi::addColor 30 39
                ;;

            --red)
                ansi::addColor 31 39
                ;;

            --green)
                ansi::addColor 32 39
                ;;

            --yellow)
                ansi::addColor 33 39
                ;;

            --blue)
                ansi::addColor 34 39
                ;;

            --magenta)
                ansi::addColor 35 39
                ;;

            --cyan)
                ansi::addColor 36 39
                ;;

            --white)
                ansi::addColor 37 39
                ;;

            --black-intense)
                ansi::addColor 90 39
                ;;

            --red-intense)
                ansi::addColor 91 39
                ;;

            --green-intense)
                ansi::addColor 92 39
                ;;

            --yellow-intense)
                ansi::addColor 93 39
                ;;

            --blue-intense)
                ansi::addColor 94 39
                ;;

            --magenta-intense)
                ansi::addColor 95 39
                ;;

            --cyan-intense)
                ansi::addColor 96 39
                ;;

            --white-intense)
                ansi::addColor 97 39
                ;;

            # Colors - Background
            --bg-black)
                ansi::addColor 40 49
                ;;

            --bg-red)
                ansi::addColor 41 49
                ;;

            --bg-green)
                ansi::addColor 42 49
                ;;

            --bg-yellow)
                ansi::addColor 43 49
                ;;

            --bg-blue)
                ansi::addColor 44 49
                ;;

            --bg-magenta)
                ansi::addColor 45 49
                ;;

            --bg-cyan)
                ansi::addColor 46 49
                ;;

            --bg-white)
                ansi::addColor 47 49
                ;;

            --bg-black-intense)
                ansi::addColor 100 49
                ;;

            --bg-red-intense)
                ansi::addColor 101 49
                ;;

            --bg-green-intense)
                ansi::addColor 102 49
                ;;

            --bg-yellow-intense)
                ansi::addColor 103 49
                ;;

            --bg-blue-intense)
                ansi::addColor 104 49
                ;;

            --bg-magenta-intense)
                ansi::addColor 105 49
                ;;

            --bg-cyan-intense)
                ansi::addColor 106 49
                ;;

            --bg-white-intense)
                ansi::addColor 107 49
                ;;

            # Colors - Reset
            --reset-attrib)
                OUTPUT="$OUTPUT${CSI}22;23;24;25;27;28;29;54;55m"
                ;;

            --reset-foreground)
                OUTPUT="$OUTPUT${CSI}39m"
                ;;

            --reset-background)
                OUTPUT="$OUTPUT${CSI}39m"
                ;;

            --reset-color)
                OUTPUT="$OUTPUT${CSI}0m"
                ;;

            # Reporting
            --report-position)
                ansi::report 6n "$CSI" R || exit 1
                printf '%s\n' "${REPORT//;/,}"
                ;;

            --report-window-state)
                ansi::report 11t "$CSI" t || exit 1
                case "$REPORT" in
                    1)
                        printf 'open\n'
                        ;;

                    2)
                        printf 'iconified\n'
                        ;;

                    *)
                        printf 'unknown (%s)\n' "$REPORT"
                        ;;
                esac
                ;;

            --report-window-position)
                ansi::report 13t "${CSI}3;" t || exit 1
                printf '%s\n' "${REPORT//;/,}"
                ;;

            --report-window-pixels)
                ansi::report 14t "${CSI}4;" t || exit 1
                printf '%s\n' "${REPORT//;/,}"
                ;;

            --report-window-chars)
                ansi::report 18t "${CSI}8;" t || exit 1
                printf '%s\n'  "${REPORT//;/,}"
                ;;

            --report-screen-chars)
                ansi::report 19t "${CSI}9;" t || exit 1
                printf '%s\n' "${REPORT//;/,}"
                ;;

            --report-icon)
                ansi::report 20t "${OSC}L" "$ST" || exit 1
                printf '%s\n' "$REPORT"
                ;;

            --report-title)
                ansi::report 21t "${OSC}l" "$ST" || exit 1
                printf '%s\n' "$REPORT"
                ;;

            # Miscellaneous
            --color-table)
                ansi::colorTable
                ;;

            --icon=*)
                OUTPUT="$OUTPUT${OSC}1;${1#*=}$ST"
                ;;

            --title=*)
                OUTPUT="$OUTPUT${OSC}2;${1#*=}$ST"
                ;;

            --no-restore)
                RESTORE=false
                ;;

            -n | --newline)
                NEWLINE=true
                ;;

            --bell)
                OUTPUT="$OUTPUT$BELL"
                ;;

            --reset)
                # 0m - reset all colors and attributes
                # 2J - clear terminal
                # 1;1H - move to 1,1
                # ?25h - show cursor
                OUTPUT="$OUTPUT${CSI}0m${CSI}2J${CSI}1;1H${CSI}?25h"
                ;;

            --)
                CONTINUE=false
                shift
                ;;

            *)
                CONTINUE=false
                ;;
        esac

        if $CONTINUE; then
            shift
        fi
    done

    if ansi::isAnsiSupported; then
        printf '%s' "$OUTPUT" "${1-}"
        shift || :

        if [[ "$#" -gt 0 ]]; then
            printf "${IFS:0:1}%s" "${@}"
        fi

        if $RESTORE; then
            printf '%s' "$SUFFIX"
        fi
    else
        printf '%s' "${1+"$@"}"
    fi

    if $NEWLINE; then
        printf '\n'
    fi
}


# Run if not sourced
if [[ "$0" == "${BASH_SOURCE[0]}" ]]; then
    ansi "$@"
fi