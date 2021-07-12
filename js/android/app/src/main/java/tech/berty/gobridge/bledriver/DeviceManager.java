package tech.berty.gobridge.bledriver;

import android.util.Log;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Map;

public class DeviceManager {
    private static final String TAG = "bty.ble.DeviceManager";

    // key is MAC address
    private static final HashMap<String, PeerDevice> mPeerDevices = new HashMap<>();

    public static synchronized PeerDevice put(String key, PeerDevice value) {
        Log.d(TAG, "put() called");
        PeerDevice peerDevice = mPeerDevices.get(key);
        if (peerDevice == null) {
            Log.d(TAG, "put(): device unknown");
            return mPeerDevices.put(key, value);
        } else {
            Log.d(TAG, "put(): device already known");
            return peerDevice;
        }
    }

    public static synchronized PeerDevice get(String key) {
        Log.v(TAG, "get() called");
        PeerDevice peerDevice = mPeerDevices.get(key);
        if (peerDevice != null) {
            Log.v(TAG, "get(): device found");
        } else {
            Log.d(TAG, "get(): device not found");
        }
        return peerDevice;
    }

    public static synchronized PeerDevice getById(@NonNull String id) {
        Log.v(TAG, "getById called: id=" + id);

        for (PeerDevice peerDevice : mPeerDevices.values()) {
            if (peerDevice.getId() != null && (peerDevice.getId().compareTo(id) == 0)) {
                Log.v(TAG, "getById: id=" + id + " found");
                return peerDevice;
            }
        }

        Log.v(TAG, "getById: id=" + id + " not found");
        return null;
    }

    public static synchronized void closeDeviceConnection(String key) {
        PeerDevice peerDevice;
        if ((peerDevice = DeviceManager.get(key)) != null) {
            peerDevice.disconnect();
        }
    }

    public static synchronized void closeAllDeviceConnections() {
        for (Map.Entry<String, PeerDevice> stringPeerDeviceEntry : mPeerDevices.entrySet()) {
            Map.Entry mapElement = (Map.Entry) stringPeerDeviceEntry;
            PeerDevice peerDevice = (PeerDevice) mapElement.getValue();
            peerDevice.disconnect();
        }
    }

//    public static synchronized void addDevice(@NonNull PeerDevice peerDevice) {
//        String key = peerDevice.getMACAddress();
//        if (get(key) == null) {
//            put(key, peerDevice);
//        }
//    }
}
