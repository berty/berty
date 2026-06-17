#!/usr/bin/env bash
#
# get-mobile-logs.sh — collect debug logs from the Berty mobile app.
#
# Gathers both the JS/React-Native console and the Go core logs (tag GoLog /
# bertybridge) from a connected Android device/emulator or an iOS simulator /
# device, plus the on-device JSON log files the Go logger writes under
# <store-dir>/accounts/<N>/logs. Everything is dropped in a timestamped folder
# and zipped, ready to attach to a bug report.
#
# Usage:
#   ./get-mobile-logs.sh -p android [-v debug] [-d <serial>] [-f] [-o DIR] [--no-files] [--clear]
#   ./get-mobile-logs.sh -p ios     [-v debug] [-d <udid>]   [-f] [-o DIR] [--no-files]
#
# Options:
#   -p, --platform   android | ios            (required)
#   -v, --variant    debug | staff | yolo | prod   (default: debug)
#   -d, --device     device serial/udid       (default: the only connected one)
#   -f, --follow     stream live until Ctrl-C  (default: one-shot dump)
#   -o, --out        output directory          (default: ./berty-logs-<ts>)
#       --no-files   skip pulling the on-device Go log files
#       --clear      clear the log buffer before capturing (android only)
#   -h, --help
#
# Notes:
#   * On-device Go log files can only be pulled from *debuggable* builds
#     (Android: `run-as`; iOS simulator: app data container). Release/prod
#     builds still produce console logs but the files are skipped with a warning.
#   * iOS physical devices need Xcode 15+ (`xcrun devicectl`) or libimobiledevice
#     (`idevicesyslog`); the script degrades gracefully and tells you what to install.

set -euo pipefail

PLATFORM=""
VARIANT="debug"
DEVICE=""
OUT=""
FOLLOW=0
PULL_FILES=1
CLEAR=0

ANDROID_BASE="tech.berty.android"
IOS_BASE="tech.berty.ios"

log()  { printf '\033[1;34m[mobile-logs]\033[0m %s\n' "$*" >&2; }
warn() { printf '\033[1;33m[mobile-logs] WARN:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[mobile-logs] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

usage() { sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

require() { command -v "$1" >/dev/null 2>&1 || die "'$1' not found in PATH${2:+ ($2)}"; }

# ---- args -------------------------------------------------------------------

while [ $# -gt 0 ]; do
	case "$1" in
		-p|--platform) PLATFORM="${2:-}"; shift 2 ;;
		-v|--variant)  VARIANT="${2:-}"; shift 2 ;;
		-d|--device)   DEVICE="${2:-}"; shift 2 ;;
		-o|--out)      OUT="${2:-}"; shift 2 ;;
		-f|--follow)   FOLLOW=1; shift ;;
		--no-files)    PULL_FILES=0; shift ;;
		--clear)       CLEAR=1; shift ;;
		-h|--help)     usage 0 ;;
		*) die "unknown argument: $1 (see --help)" ;;
	esac
done

case "$PLATFORM" in
	android|ios) ;;
	"") die "missing --platform (android|ios)" ;;
	*) die "invalid --platform: $PLATFORM" ;;
esac

# Map variant -> app id suffix (matches berty-bridge-expo/mobile/app.config.ts).
variant_suffix() {
	case "$VARIANT" in
		prod|production) echo "" ;;
		debug|development) echo ".debug" ;;
		staff|preview) echo ".staff" ;;
		yolo) echo ".yolo" ;;
		*) die "invalid --variant: $VARIANT" ;;
	esac
}

# Resolve (and validate) the variant suffix up front.
APPID_SUFFIX="$(variant_suffix)"

TS="$(date +%Y%m%d-%H%M%S)"
OUT="${OUT:-./berty-logs-$TS}"
mkdir -p "$OUT"
log "writing to $OUT"

# ---- android ----------------------------------------------------------------

collect_android() {
	require adb "https://developer.android.com/tools/adb"
	local adb=(adb)
	[ -n "$DEVICE" ] && adb=(adb -s "$DEVICE")

	# Fail early with a clear message if no/many devices.
	local n
	n="$("${adb[@]}" devices | grep -cE '\sdevice$' || true)"
	[ "$n" -eq 0 ] && die "no Android device/emulator connected (adb devices)"
	[ "$n" -gt 1 ] && [ -z "$DEVICE" ] && die "multiple devices connected; pass -d <serial>"

	local pkg="${ANDROID_BASE}${APPID_SUFFIX}"
	log "android package: $pkg"

	"${adb[@]}" shell getprop > "$OUT/device-props.txt" 2>/dev/null || true
	"${adb[@]}" shell dumpsys package "$pkg" 2>/dev/null | sed -n '1,40p' > "$OUT/package-info.txt" || true

	[ "$CLEAR" -eq 1 ] && { log "clearing logcat buffer"; "${adb[@]}" logcat -c || true; }

	local pid
	pid="$("${adb[@]}" shell pidof -s "$pkg" 2>/dev/null | tr -d '\r' || true)"
	if [ -n "$pid" ]; then
		log "app pid: $pid"
	else
		warn "app '$pkg' is not running; capturing by tag instead (start the app for full output)"
	fi

	# Capture the app's output. By PID when running (everything the process
	# emits: ReactNativeJS, GoLog, bertybridge, ...); otherwise by the known tags
	# so a not-yet-started or restarting app is still covered.
	local logcat_args=(-v threadtime)
	if [ -n "$pid" ]; then
		logcat_args+=(--pid="$pid")
	else
		logcat_args+=(ReactNativeJS:V GoLog:V bertybridge:V '*:S')
	fi

	if [ "$FOLLOW" -eq 1 ]; then
		log "streaming logcat (Ctrl-C to stop)…"
		"${adb[@]}" logcat "${logcat_args[@]}" | tee "$OUT/logcat.txt" || true
	else
		log "dumping logcat…"
		"${adb[@]}" logcat -d "${logcat_args[@]}" > "$OUT/logcat.txt" || true
		log "saved $(wc -l < "$OUT/logcat.txt" | tr -d ' ') lines to logcat.txt"
	fi

	if [ "$PULL_FILES" -eq 1 ]; then
		if "${adb[@]}" shell run-as "$pkg" true >/dev/null 2>&1; then
			log "pulling on-device Go log files…"
			# run-as cwd is the app data dir; the Go logger writes JSON logs under
			# no_backup/berty/accounts/<N>/logs.
			"${adb[@]}" exec-out run-as "$pkg" \
				sh -c 'tar c no_backup/berty/accounts/*/logs 2>/dev/null' \
				> "$OUT/berty-file-logs.tar" 2>/dev/null || true
			if [ -s "$OUT/berty-file-logs.tar" ]; then
				log "saved berty-file-logs.tar"
			else
				rm -f "$OUT/berty-file-logs.tar"
				warn "no Go log files found on device"
			fi
		else
			warn "build '$pkg' is not debuggable (run-as denied); skipping file logs"
		fi
	fi
}

# ---- ios --------------------------------------------------------------------

ios_collect_simulator() {
	local bundle="$1" udid="$2"
	local sim=(xcrun simctl)

	log "ios simulator bundle: $bundle (device: $udid)"
	xcrun simctl listapps "$udid" >/dev/null 2>&1 || warn "could not list apps; is the simulator booted?"

	# Console logs: live stream in follow mode, otherwise the last 10 minutes.
	local pred='processImagePath CONTAINS[c] "berty" OR senderImagePath CONTAINS[c] "berty"'
	if [ "$FOLLOW" -eq 1 ]; then
		log "streaming simulator log (Ctrl-C to stop)…"
		"${sim[@]}" spawn "$udid" log stream --level debug --style compact --predicate "$pred" \
			| tee "$OUT/console.txt" || true
	else
		log "dumping last 10m of simulator log…"
		"${sim[@]}" spawn "$udid" log show --last 10m --style compact --predicate "$pred" \
			> "$OUT/console.txt" 2>/dev/null || warn "log show failed"
	fi

	if [ "$PULL_FILES" -eq 1 ]; then
		local container
		container="$("${sim[@]}" get_app_container "$udid" "$bundle" data 2>/dev/null || true)"
		if [ -n "$container" ] && [ -d "$container" ]; then
			log "searching app container for Go log files…"
			# shellcheck disable=SC2038
			find "$container" -type d -name logs 2>/dev/null | while read -r d; do
				local rel; rel="$(basename "$(dirname "$d")")"
				mkdir -p "$OUT/file-logs/$rel"
				cp -R "$d/." "$OUT/file-logs/$rel/" 2>/dev/null || true
			done
			[ -d "$OUT/file-logs" ] && log "copied file logs" || warn "no Go log files in container"
		else
			warn "app '$bundle' not installed on this simulator; skipping file logs"
		fi
	fi
}

ios_collect_device() {
	local bundle="$1" udid="$2"
	log "ios device bundle: $bundle (udid: ${udid:-auto})"

	if [ "$FOLLOW" -eq 1 ]; then
		if command -v idevicesyslog >/dev/null 2>&1; then
			log "streaming device syslog via idevicesyslog (Ctrl-C to stop)…"
			idevicesyslog ${udid:+-u "$udid"} | grep --line-buffered -iE 'berty|GoLog' \
				| tee "$OUT/console.txt" || true
		elif xcrun devicectl --version >/dev/null 2>&1; then
			warn "live device streaming via devicectl is limited; install libimobiledevice (idevicesyslog) for best results"
			xcrun devicectl device console ${udid:+--device "$udid"} 2>/dev/null \
				| tee "$OUT/console.txt" || true
		else
			die "no device log tool: install libimobiledevice ('brew install libimobiledevice') or Xcode 15+"
		fi
	else
		warn "one-shot device console capture is unreliable; use --follow with idevicesyslog"
		if command -v idevicesyslog >/dev/null 2>&1; then
			# Best-effort: stream for a few seconds.
			( idevicesyslog ${udid:+-u "$udid"} | grep --line-buffered -iE 'berty|GoLog' > "$OUT/console.txt" ) &
			local p=$!; sleep 8; kill "$p" 2>/dev/null || true
		fi
	fi

	if [ "$PULL_FILES" -eq 1 ]; then
		if xcrun devicectl --version >/dev/null 2>&1; then
			log "attempting to copy app container (Go log files) via devicectl…"
			xcrun devicectl device copy from ${udid:+--device "$udid"} \
				--domain-type appDataContainer --domain-identifier "$bundle" \
				--source "Documents" --destination "$OUT/container" 2>/dev/null \
				&& log "copied container -> $OUT/container" \
				|| warn "container copy failed (app must be a debuggable/dev build)"
		else
			warn "Xcode 15+ (devicectl) required to pull device file logs; skipping"
		fi
	fi
}

collect_ios() {
	require xcrun "Xcode command line tools"
	local bundle="${IOS_BASE}${APPID_SUFFIX}"

	# Decide simulator vs physical device. A booted simulator is the default;
	# pass -d <udid> of a physical device to target it.
	local booted
	booted="$(xcrun simctl list devices booted 2>/dev/null | grep -oE '\(([0-9A-F-]{36})\)' | head -1 | tr -d '()' || true)"

	if [ -n "$DEVICE" ] && [ "$DEVICE" != "$booted" ]; then
		ios_collect_device "$bundle" "$DEVICE"
	elif [ -n "$booted" ]; then
		ios_collect_simulator "$bundle" "${DEVICE:-$booted}"
	else
		warn "no booted simulator found; treating as physical device"
		ios_collect_device "$bundle" "$DEVICE"
	fi
}

# ---- run --------------------------------------------------------------------

{
	echo "platform: $PLATFORM"
	echo "variant:  $VARIANT"
	echo "device:   ${DEVICE:-<auto>}"
	echo "date:     $(date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "host:     $(uname -a)"
} > "$OUT/capture-info.txt"

case "$PLATFORM" in
	android) collect_android ;;
	ios)     collect_ios ;;
esac

# Zip the result (skip in follow mode if interrupted before this point).
if command -v zip >/dev/null 2>&1; then
	zip -rq "${OUT}.zip" "$OUT" && log "archive: ${OUT}.zip"
else
	tar czf "${OUT}.tar.gz" "$OUT" && log "archive: ${OUT}.tar.gz"
fi

log "done."
