package tech.berty.bletesting;

import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTING;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTING;

class Log {

    static void v(String tag, String log) {
        android.util.Log.v(tag, log);
    }

    static void d(String tag, String log) {
        android.util.Log.d(tag, log);
    }

    static void i(String tag, String log) {
        android.util.Log.i(tag, log);
    }

    static void w(String tag, String log) {
        android.util.Log.w(tag, log);
    }

    static void e(String tag, String log) {
        android.util.Log.e(tag, log);
    }
}

class Helper {

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