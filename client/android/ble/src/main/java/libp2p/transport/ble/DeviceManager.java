package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import java.util.Arrays;
import java.util.HashMap;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class DeviceManager {
    private static final String TAG = "device_manager";

    private static final HashMap<String, PeerDevice> peerDevices = new HashMap<>();

    // Index management
    static void addDeviceToIndex(PeerDevice peerDevice) {
        synchronized (peerDevices) {
            if (!peerDevices.containsKey(peerDevice.getAddr())) {
                Log.d(TAG, "addDeviceToIndex() called with device: " + peerDevice.getAddr() + ", current index size: " + peerDevices.size() + ", new index size: " + (peerDevices.size() + 1));
                peerDevices.put(peerDevice.getAddr(), peerDevice);
            } else {
                Log.e(TAG, "addDeviceToIndex() device already in index: " + peerDevice.getAddr());
            }
        }
    }

    static void removeDeviceFromIndex(PeerDevice peerDevice) {
        synchronized (peerDevices) {
            if (peerDevices.containsKey(peerDevice.getAddr())) {
                Log.d(TAG, "removeDeviceFromIndex() called with device: " + peerDevice.getAddr() + ", current index size: " + peerDevices.size() + ", new index size: " + (peerDevices.size() - 1));
                peerDevices.remove(peerDevice.getAddr());
            } else {
                Log.e(TAG, "removeDeviceFromIndex() device not found in index: " + peerDevice.getAddr());
            }
        }
    }

    static void disconnectFromAllDevices() {
        Log.d(TAG, "disconnectFromAllDevices() called from thread: " + Thread.currentThread().getId());

        synchronized (peerDevices) {
            for (PeerDevice peerDevice : peerDevices.values()) {
                peerDevice.interruptConnectionThread();
                peerDevice.interruptHandshakeThread();
                peerDevices.remove(peerDevice.getAddr());
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

    private static PeerDevice getDeviceFromPeerID(String peerID) {
        Log.d(TAG, "getDeviceFromPeerID() called with PeerID: " + peerID);

        synchronized (peerDevices) {
            for (PeerDevice peerDevice : peerDevices.values()) {
                if (peerDevice.getPeerID() != null && peerDevice.getPeerID().equals(peerID)) {
                    return peerDevice;
                }
            }
        }

        Log.e(TAG, "getDeviceFromPeerID() device not found with PeerID: " + peerID);

        return null;
    }


    // Libp2p bound functions
    public static boolean dialPeer(String remotePID) {
        Log.i(TAG, "dialDevice() called with PeerID: " + remotePID);

        PeerDevice peerDevice = getDeviceFromPeerID(remotePID);

        return peerDevice != null && peerDevice.isGattConnected();

    }

    public static boolean sendToPeer(String remotePID, byte[] payload) {
        Log.i(TAG, "writeToDevice() called with payload: " + Arrays.toString(payload) + ", hashCode: " + Arrays.toString(payload).hashCode() + ", string: " + new String(payload).replaceAll("\\p{C}", "?") + ", length: " + payload.length + ", to PeerID: " + remotePID);

        PeerDevice peerDevice = getDeviceFromPeerID(remotePID);

        if (peerDevice == null) {
            // Could happen if device has fully disconnected and libp2p isn't aware of it
            Log.e(TAG, "writeToDevice() failed: unknown device");
            return false;
        } else if (!peerDevice.isIdentified()) {
            // Could happen if device has fully disconnected, libp2p isn't aware of it and device is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device not ready yet");
            return false;
        }

        try {
            return peerDevice.writeToRemoteWriterCharacteristic(payload);
        } catch(InterruptedException e) {
            Log.e(TAG, "writeToDevice() failed: " + e.getMessage());
            return false;
        }
    }

    public static void closeConnWithPeer(String remotePID) {
        Log.i(TAG, "disconnectFromDevice() called with PeerID: " + remotePID);

        PeerDevice peerDevice = getDeviceFromPeerID(remotePID);

        if (peerDevice != null) {
            peerDevice.interruptConnectionThread();
            peerDevice.interruptHandshakeThread();
            peerDevice.disconnectFromDevice("libp2p request");
        } else {
            Log.e(TAG, "disconnectFromDevice() failed: unknown device");
        }
    }
}
