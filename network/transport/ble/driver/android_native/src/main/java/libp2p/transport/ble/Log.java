package libp2p.transport.ble;

import core.Core;

import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTING;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTING;

final class Log {

    static void v(String tag, String log) {
    Core.goLogger(tag, "verbose", log);
    }
    static void d(String tag, String log) {
        Core.goLogger(tag, "debug", log);
    }
    static void i(String tag, String log) {
        Core.goLogger(tag, "info", log);
    }
    static void w(String tag, String log) {
        Core.goLogger(tag, "warn", log);
    }
    static void e(String tag, String log) {
        Core.goLogger(tag, "error", log);
    }

    static String connectionStateToString(int state) {
        switch (state) {
            case STATE_DISCONNECTED:
                return "disconnected";
            case STATE_CONNECTING:
                return "connecting";
            case STATE_CONNECTED:
                return "connected";
            case STATE_DISCONNECTING:
                return "disconnecting";
            default:
                return "unknown";
        }
    }
}
