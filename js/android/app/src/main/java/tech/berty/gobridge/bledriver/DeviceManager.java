package tech.berty.gobridge.bledriver;

import android.util.Log;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class DeviceManager {
    private static final String TAG = "DeviceManager";

    private static HashMap<String, PeerDevice> mPeerDevices = new HashMap<>();

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
        Log.d(TAG, "get() called");
        PeerDevice peerDevice = mPeerDevices.get(key);
        if (peerDevice != null) {
            Log.d(TAG, "get(): device found");
        } else {
            Log.d(TAG, "get(): device not found");
        }
        return peerDevice;
    }

    public static synchronized void closeAllDeviceConnections() {
        Iterator iterator = mPeerDevices.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry mapElement = (Map.Entry)iterator.next();
            PeerDevice peerDevice = (PeerDevice)mapElement.getValue();
            peerDevice.close();
        }
    }

    public static PeerDevice addDevice(@NonNull PeerDevice peerDevice) {
        String key = peerDevice.getMACAddress();
        return put(key, peerDevice);
    }
}
