# mobile-logs

`get-mobile-logs.sh` collects debug logs from the Berty mobile app (Android &
iOS) into a single timestamped, zipped folder you can attach to a bug report.

It captures:

- the **JS / React-Native console** (`ReactNativeJS`),
- the **Go core logs** (`GoLog`, `bertybridge`), and
- the **on-device JSON log files** the Go logger writes under
  `<store-dir>/accounts/<N>/logs` (debuggable builds only).

## Requirements

- **Android:** `adb` (Android platform-tools).
- **iOS simulator:** Xcode command-line tools (`xcrun simctl`).
- **iOS device:** Xcode 15+ (`xcrun devicectl`) and/or
  [libimobiledevice](https://libimobiledevice.org/) (`brew install libimobiledevice`)
  for `idevicesyslog`.

## Usage

```sh
# one-shot dump from the running debug app on the only connected Android device
./get-mobile-logs.sh -p android

# stream live (Ctrl-C to stop) from a specific device, clearing the buffer first
./get-mobile-logs.sh -p android -d emulator-5554 -f --clear

# iOS simulator (booted), staff variant
./get-mobile-logs.sh -p ios -v staff

# iOS physical device, live
./get-mobile-logs.sh -p ios -d <udid> -f
```

| Flag | Meaning | Default |
|------|---------|---------|
| `-p, --platform` | `android` \| `ios` | required |
| `-v, --variant` | `debug` \| `staff` \| `yolo` \| `prod` | `debug` |
| `-d, --device` | device serial / udid | the only connected one |
| `-f, --follow` | stream live until Ctrl-C | one-shot dump |
| `-o, --out` | output directory | `./berty-logs-<ts>` |
| `--no-files` | skip pulling on-device Go log files | pull them |
| `--clear` | clear the log buffer first (Android) | off |

The `--variant` values map to the app ids in
`berty-bridge-expo/mobile/app.config.ts` (e.g. `debug` → `tech.berty.android.debug`
/ `tech.berty.ios.debug`).

## Notes & limitations

- **File logs need a debuggable build.** Release/`prod` builds aren't accessible
  via `run-as` (Android) or the app data container (iOS), so the Go log *files*
  are skipped with a warning — console logs are still captured.
- **iOS physical device** capture is best-effort: live streaming relies on
  `idevicesyslog`; container copy relies on `devicectl` and a dev-signed app.
- For the fullest Android capture, have the app **running** so logs are filtered
  by its PID; otherwise capture falls back to the known tags.
- Logs may contain identifiers and message metadata — review before sharing.
