package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import java.util.Arrays;
import java.util.HashMap;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class DeviceManager {
    private DeviceManager() {} // Equivalent to a static class in Java

    private static final String TAG = "device_manager";

    private static final HashMap<String, PeerDevice> peerDevices = new HashMap<>();

    // Index management
    static void addDeviceToIndex(final PeerDevice peerDevice) {
        synchronized (peerDevices) {
            if (!peerDevices.containsKey(peerDevice.getAddr())) {
                Log.d(TAG, "addDeviceToIndex() called with device: " + peerDevice.getAddr() + ", current index size: " + peerDevices.size() + ", new index size: " + (peerDevices.size() + 1));
                peerDevices.put(peerDevice.getAddr(), peerDevice);
            } else {
                Log.e(TAG, "addDeviceToIndex() device already in index: " + peerDevice.getAddr());
            }
        }
    }

    static void removeDeviceFromIndex(final PeerDevice peerDevice) {
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
    static PeerDevice getDeviceFromAddr(final String addr) {
        Log.d(TAG, "getDeviceFromAddr() called with address: " + addr);

        synchronized (peerDevices) {
            if (peerDevices.containsKey(addr)) {
                return peerDevices.get(addr);
            }
        }

        Log.w(TAG, "getDeviceFromAddr() device not found with address: " + addr);

        return null;
    }

    static PeerDevice getDeviceFromPeerID(final String peerID) {
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
}
