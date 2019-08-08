package libp2p.transport.ble;

import android.annotation.TargetApi;
import android.os.Build;

import core.Core;

import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTING;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTING;

import static android.bluetooth.BluetoothAdapter.STATE_OFF;
import static android.bluetooth.BluetoothAdapter.STATE_TURNING_ON;
import static android.bluetooth.BluetoothAdapter.STATE_ON;
import static android.bluetooth.BluetoothAdapter.STATE_TURNING_OFF;

import static android.bluetooth.BluetoothGatt.GATT_CONNECTION_CONGESTED;
import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_INSUFFICIENT_AUTHENTICATION;
import static android.bluetooth.BluetoothGatt.GATT_INSUFFICIENT_ENCRYPTION;
import static android.bluetooth.BluetoothGatt.GATT_INVALID_ATTRIBUTE_LENGTH;
import static android.bluetooth.BluetoothGatt.GATT_INVALID_OFFSET;
import static android.bluetooth.BluetoothGatt.GATT_READ_NOT_PERMITTED;
import static android.bluetooth.BluetoothGatt.GATT_REQUEST_NOT_SUPPORTED;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothGatt.GATT_WRITE_NOT_PERMITTED;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
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
                return "unknown (" + state + ")";
        }
    }

    static String bluetoothAdapterStateToString(int state) {
        switch (state) {
            case STATE_OFF:
                return "off";
            case STATE_TURNING_ON:
                return "turning on";
            case STATE_ON:
                return "on";
            case STATE_TURNING_OFF:
                return "turning off";
            default:
                return "unknown (" + state + ")";
        }
    }

    static String gattStatusToString(int status) {
        // See: https://android.googlesource.com/platform/external/bluetooth/bluedroid/+/master/stack/include/gatt_api.h#48
        final int GATT_ILLEGAL_PARAMETER = 0x87;
        final int GATT_NO_RESOURCES = 0x80;
        final int GATT_INTERNAL_ERROR = 0x81;
        final int GATT_WRONG_STATE = 0x82;
        final int GATT_DB_FULL = 0x83;
        final int GATT_BUSY = 0x84;
        final int GATT_ERROR = 0x85;
        final int GATT_AUTH_FAIL = 0x89;
        final int GATT_INVALID_CFG = 0x8b;

        switch (status) {
            case GATT_SUCCESS:
                return "success";
            case GATT_READ_NOT_PERMITTED:
                return "read not permitted";
            case GATT_WRITE_NOT_PERMITTED:
                return "write not permitted";
            case GATT_INSUFFICIENT_AUTHENTICATION:
                return "insufficient authentication";
            case GATT_REQUEST_NOT_SUPPORTED:
                return "request not supported";
            case GATT_INSUFFICIENT_ENCRYPTION:
                return "insufficient encryption";
            case GATT_INVALID_OFFSET:
                return "invalid offset";
            case GATT_INVALID_ATTRIBUTE_LENGTH:
                return "invalid attribut length";
            case GATT_CONNECTION_CONGESTED:
                return "connection congested";
            case GATT_FAILURE:
                return "failure";
            case GATT_ILLEGAL_PARAMETER:
                return "illegal parameter";
            case GATT_NO_RESOURCES:
                return "no ressources";
            case GATT_INTERNAL_ERROR:
                return "internal error";
            case GATT_WRONG_STATE:
                return "wrong state";
            case GATT_DB_FULL:
                return "DB full";
            case GATT_BUSY:
                return "busy";
            case GATT_ERROR:
                return "error";
            case GATT_AUTH_FAIL:
                return "authentication failed";
            case GATT_INVALID_CFG:
                return "invalid config";
            default:
                return "unknown (" + status + ")";
        }
    }
}
