package tech.berty.gobridge.bledriver;

import android.util.Log;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Map;

public class DeviceManager {
    private static final String TAG = "bty.ble.DeviceManager";

    // key is MAC address
    private static final HashMap<String, PeerDevice> mPeerDevices = new HashMap<>();

    public static synchronized PeerDevice put(String macAddress, PeerDevice value) {
        Log.d(TAG, "put() called");
        PeerDevice peerDevice = mPeerDevices.get(macAddress);
        if (peerDevice == null) {
            Log.d(TAG, "put(): device unknown");
            return mPeerDevices.put(macAddress, value);
        } else {
            Log.d(TAG, "put(): device already known");
            return peerDevice;
        }
    }

    public static synchronized PeerDevice get(String macAddress) {
        Log.v(TAG, "get() called");
        PeerDevice peerDevice = mPeerDevices.get(macAddress);
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

    public static synchronized PeerDevice getByPID(@NonNull String pid) {
        Log.v(TAG, "getById called: id=" + pid);

        for (PeerDevice peerDevice : mPeerDevices.values()) {
            Log.v(TAG, "getByPID: pid=" + peerDevice.getRemotePID());
            if (peerDevice.getRemotePID() != null && (peerDevice.getRemotePID().compareTo(pid) == 0)) {
                Log.v(TAG, "getByPID: pid=" + pid + " found");
                return peerDevice;
            }
        }

        Log.v(TAG, "getByPID: pid=" + pid + " not found");
        return null;
    }

    public static synchronized void closeDeviceConnection(String pid) {
        Log.i(TAG, String.format("closeDeviceConnection: pid=%s", pid));

        PeerDevice peerDevice;
        if ((peerDevice = DeviceManager.getByPID(pid)) != null) {
            peerDevice.disconnect();
        } else {
            Log.i(TAG, "closeDeviceConnection: peer not found");
        }
    }

    public static synchronized void closeAllDeviceConnections() {
        for (Map.Entry<String, PeerDevice> stringPeerDeviceEntry : mPeerDevices.entrySet()) {
            Map.Entry mapElement = (Map.Entry) stringPeerDeviceEntry;
            PeerDevice peerDevice = (PeerDevice) mapElement.getValue();
            peerDevice.disconnect();
        }
    }

    public static synchronized void remove(String macAddress) {
        Log.d(TAG, String.format("remove called: device=%s", macAddress));

        PeerDevice peerDevice = mPeerDevices.remove(macAddress);

        if (peerDevice == null) {
            Log.e(TAG, String.format("remove: device=%s unknown", macAddress));
        } else {
            Log.d(TAG, String.format("remove: device=%s deleted", macAddress));
        }
    }
}
