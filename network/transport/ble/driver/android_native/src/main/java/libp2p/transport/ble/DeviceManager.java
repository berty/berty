package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class DeviceManager {
    private static final String TAG = "device_manager";

    private static final HashMap<String, PeerDevice> peerDevices = new HashMap<>();

    // Index management
    static void addDeviceToIndex(PeerDevice peerDevice) {
        Log.d(TAG, "addDeviceToIndex() called with device: " + peerDevice + ", current index size: " + peerDevices.size() + ", new index size: " + (peerDevices.size() + 1));

        synchronized (peerDevices) {
            if (!peerDevices.containsKey(peerDevice.getAddr())) {
                peerDevices.put(peerDevice.getAddr(), peerDevice);
            } else {
                Log.e(TAG, "addDeviceToIndex() device already in index: " + peerDevice.getAddr());
            }
        }
    }

    static void removeDeviceFromIndex(PeerDevice peerDevice) {
        Log.d(TAG, "removeDeviceFromIndex() called with device: " + peerDevice + ", current index size: " + peerDevices.size() + ", new index size: " + (peerDevices.size() - 1));

        synchronized (peerDevices) {
            if (peerDevices.containsKey(peerDevice.getAddr())) {
                peerDevices.remove(peerDevice.getAddr());
            } else {
                Log.e(TAG, "removeDeviceFromIndex() device not found in index: " + peerDevice.getAddr());
            }
        }
    }


    // Device getters
    static PeerDevice getDeviceFromAddr(String addr) {
        Log.d(TAG, "getDeviceFromAddr() called with address: " + addr);

        synchronized (peerDevices) {
            if (peerDevices.containsKey(addr)) {
                return peerDevices.get(addr);
            }
        }

        Log.w(TAG, "getDeviceFromAddr() device not found with address: " + addr);

        return null;
    }

    private static PeerDevice getDeviceFromMultiAddr(String multiAddr) {
        Log.d(TAG, "getDeviceFromMultiAddr() called with MultiAddr: " + multiAddr);

        synchronized (peerDevices) {
            PeerDevice peerDevice;

            for (Map.Entry<String, PeerDevice> entry : peerDevices.entrySet()) {
                peerDevice = entry.getValue();
                if (peerDevice != null && peerDevice.getMultiAddr() != null && peerDevice.getMultiAddr().equals(multiAddr)) {
                    return peerDevice;
                }
            }
        }

        Log.e(TAG, "getDeviceFromMultiAddr() device not found with MultiAddr: " + multiAddr);

        return null;
    }


    // Libp2p bound functions
    public static boolean dialDevice(String multiAddr) {
        Log.i(TAG, "dialDevice() called with MultiAddr: " + multiAddr);

        PeerDevice peerDevice = getDeviceFromMultiAddr(multiAddr);

        return peerDevice != null && peerDevice.isGattConnected();

    }

    public static boolean sendToDevice(String multiAddr, byte[] payload) {
        Log.i(TAG, "writeToDevice() called with payload: " + Arrays.toString(payload) + ", hashCode: " + Arrays.toString(payload).hashCode() + ", string: " + new String(payload).replaceAll("\\p{C}", "?") + ", length: " + payload.length + ", to MultiAddr: " + multiAddr);

        PeerDevice peerDevice = getDeviceFromMultiAddr(multiAddr);

        if (peerDevice == null) {
            // Could happen if device has fully disconnected and libp2p isn't aware of it
            Log.e(TAG, "writeToDevice() failed: unknown device");
            return false;
        } else if (!peerDevice.isGattConnected()) {
            // Could happen if device has GATT disconnected and is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device GATT disconnected");
            return false;
        } else if (!peerDevice.isIdentified()) {
            // Could happen if device has fully disconnected, libp2p isn't aware of it and device is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device not ready yet");
            return false;
        }

        return peerDevice.writeOnCharacteristic(payload, peerDevice.writerCharacteristic);
    }

    public static void closeConnWithDevice(String multiAddr) {
        Log.i(TAG, "disconnectFromDevice() called with MultiAddr: " + multiAddr);

        PeerDevice peerDevice = getDeviceFromMultiAddr(multiAddr);

        if (peerDevice != null) {
            peerDevice.asyncDisconnectFromDevice("libp2p request");
        } else {
            Log.e(TAG, "disconnectFromDevice() failed: unknown device");
        }
    }
}
