package chat.berty.ble;

import android.os.Build;
import android.annotation.TargetApi;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class DeviceManager {
    private static final String TAG = "device_manager";

    private static final HashMap<String, BertyDevice> bertyDevices = new HashMap<>();

    private DeviceManager() {}


    // Index management
    static void addDeviceToIndex(BertyDevice bertyDevice) {
        Log.d(TAG, "addDeviceToIndex() called with device: " + bertyDevice + ", current index size: " + bertyDevices.size() + ", new index size: " + (bertyDevices.size() + 1));

        synchronized (bertyDevices) {
            if (!bertyDevices.containsKey(bertyDevice.getAddr())) {
                bertyDevices.put(bertyDevice.getAddr(), bertyDevice);
            } else {
                Log.e(TAG, "addDeviceToIndex() device already in index: " + bertyDevice.getAddr());
            }
        }
    }

    static void removeDeviceFromIndex(BertyDevice bertyDevice) {
        Log.d(TAG, "removeDeviceFromIndex() called with device: " + bertyDevice + ", current index size: " + bertyDevices.size() + ", new index size: " + (bertyDevices.size() - 1));

        synchronized (bertyDevices) {
            if (bertyDevices.containsKey(bertyDevice.getAddr())) {
                bertyDevices.remove(bertyDevice.getAddr());
            } else {
                Log.e(TAG, "removeDeviceFromIndex() device not found in index: " + bertyDevice.getAddr());
            }
        }
    }


    // Device getters
    static BertyDevice getDeviceFromAddr(String addr) {
        Log.d(TAG, "getDeviceFromAddr() called with address: " + addr);

        synchronized (bertyDevices) {
            if (bertyDevices.containsKey(addr)) {
                return bertyDevices.get(addr);
            }
        }

        Log.w(TAG, "getDeviceFromAddr() device not found with address: " + addr);

        return null;
    }

    private static BertyDevice getDeviceFromMultiAddr(String multiAddr) {
        Log.d(TAG, "getDeviceFromMultiAddr() called with MultiAddr: " + multiAddr);

        synchronized (bertyDevices) {
            BertyDevice bertyDevice;

            for (Map.Entry<String, BertyDevice> entry : bertyDevices.entrySet()) {
                bertyDevice = entry.getValue();
                if (bertyDevice != null && bertyDevice.getMultiAddr() != null && bertyDevice.getMultiAddr().equals(multiAddr)) {
                    return bertyDevice;
                }
            }
        }

        Log.e(TAG, "getDeviceFromMultiAddr() device not found with MultiAddr: " + multiAddr);

        return null;
    }


    // Libp2p bound functions
    public static void disconnectFromDevice(String multiAddr) {
        Log.i(TAG, "disconnectFromDevice() called with MultiAddr: " + multiAddr);

//        BertyDevice bertyDevice = getDeviceFromMultiAddr(multiAddr);

        // TODO: change logic about yamux connexion closer, maybe it will be more relevant to close GATT connexion only
//        if (bertyDevice != null) {
//            bertyDevice.asyncdisconnectFromDevice("libp2p request");
//        } else {
//            Log.e(TAG, "disconnectFromDevice() failed: unknown device");
//        }
    }

    public static boolean writeToDevice(byte[] payload, String multiAddr) {
        Log.i(TAG, "writeToDevice() called with payload: " + Arrays.toString(payload) + ", hashCode: " + Arrays.toString(payload).hashCode() + ", string: " + new String(payload).replaceAll("\\p{C}", "?") + ", length: " + payload.length + ", to MultiAddr: " + multiAddr);

        BertyDevice bertyDevice = getDeviceFromMultiAddr(multiAddr);

        if (bertyDevice == null) {
            // Could happen if device has fully disconnected and libp2p isn't aware of it
            Log.e(TAG, "writeToDevice() failed: unknown device");
            return false;
        } else if (!bertyDevice.isGattConnected()) {
            // Could happen if device has GATT disconnected and is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device GATT disconnected");
            return false;
        } else if (!bertyDevice.isIdentified()) {
            // Could happen if device has fully disconnected, libp2p isn't aware of it and device is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device not ready yet");
            return false;
        }

        return bertyDevice.writeOnCharacteristic(payload, bertyDevice.writerCharacteristic);
    }

    // TODO: Implement canDialPeer on yamux side
    public static boolean canDialPeer(String multiAddr) {
        Log.i(TAG, "dialPeer() called with MultiAddr: " + multiAddr);

        BertyDevice bertyDevice = getDeviceFromMultiAddr(multiAddr);

        if (bertyDevice != null) {
            return true;
        }

        return false;

    }

    public static boolean dialPeer(String multiAddr) {
        Log.i(TAG, "dialPeer() called with MultiAddr: " + multiAddr);

        BertyDevice bertyDevice = getDeviceFromMultiAddr(multiAddr);

        if (bertyDevice != null && bertyDevice.isGattConnected()) {
            return true;
        }

        return false;
    }
}
