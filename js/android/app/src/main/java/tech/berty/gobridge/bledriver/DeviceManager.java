package tech.berty.gobridge.bledriver;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Map;

public class DeviceManager {
    private static final String TAG = "bty.ble.DeviceManager";
    private final Logger mLogger;

    // key is MAC address
    private final HashMap<String, PeerDevice> mPeerDevices = new HashMap<>();

    public DeviceManager(Logger logger) {
        mLogger = logger;
    }
    
    public synchronized PeerDevice put(String macAddress, PeerDevice value) {
        mLogger.d(TAG, "put() called");
        PeerDevice peerDevice = mPeerDevices.get(macAddress);
        if (peerDevice == null) {
            mLogger.d(TAG, "put(): device unknown");
            return mPeerDevices.put(macAddress, value);
        } else {
            mLogger.d(TAG, "put(): device already known");
            return peerDevice;
        }
    }

    public synchronized PeerDevice get(String macAddress) {
        mLogger.v(TAG, "get() called");
        PeerDevice peerDevice = mPeerDevices.get(macAddress);
        if (peerDevice != null) {
            mLogger.v(TAG, "get(): device found");
        } else {
            mLogger.d(TAG, "get(): device not found");
        }
        return peerDevice;
    }

    public synchronized PeerDevice getById(@NonNull String id) {
        mLogger.v(TAG, "getById called: id=" + mLogger.sensitiveObject(id));

        for (PeerDevice peerDevice : mPeerDevices.values()) {
            if (peerDevice.getId() != null && (peerDevice.getId().compareTo(id) == 0)) {
                mLogger.v(TAG, "getById: id=" + mLogger.sensitiveObject(id) + " found");
                return peerDevice;
            }
        }

        mLogger.v(TAG, "getById: id=" + mLogger.sensitiveObject(id) + " not found");
        return null;
    }

    public synchronized PeerDevice getByPID(@NonNull String pid) {
        mLogger.v(TAG, "getById called: id=" + mLogger.sensitiveObject(pid));

        for (PeerDevice peerDevice : mPeerDevices.values()) {
            mLogger.v(TAG, "getByPID: pid=" + mLogger.sensitiveObject(peerDevice.getRemotePID()));
            if (peerDevice.getRemotePID() != null && (peerDevice.getRemotePID().compareTo(pid) == 0)) {
                mLogger.v(TAG, "getByPID: pid=" + mLogger.sensitiveObject(pid) + " found");
                return peerDevice;
            }
        }

        mLogger.v(TAG, "getByPID: pid=" + mLogger.sensitiveObject(pid) + " not found");
        return null;
    }

    public synchronized void closeDeviceConnection(String pid) {
        mLogger.i(TAG, String.format("closeDeviceConnection: pid=%s", mLogger.sensitiveObject(pid)));

        PeerDevice peerDevice;
        if ((peerDevice = getByPID(pid)) != null) {
            peerDevice.disconnect();
        } else {
            mLogger.i(TAG, "closeDeviceConnection: peer not found");
        }
    }

    public synchronized void closeAllDeviceConnections() {
        for (Map.Entry<String, PeerDevice> stringPeerDeviceEntry : mPeerDevices.entrySet()) {
            Map.Entry mapElement = (Map.Entry) stringPeerDeviceEntry;
            PeerDevice peerDevice = (PeerDevice) mapElement.getValue();
            peerDevice.disconnect();
        }
    }

    public synchronized void remove(String macAddress) {
        mLogger.d(TAG, String.format("remove called: device=%s", mLogger.sensitiveObject(macAddress)));

        PeerDevice peerDevice = mPeerDevices.remove(macAddress);

        if (peerDevice == null) {
            mLogger.e(TAG, String.format("remove: device=%s unknown", mLogger.sensitiveObject(macAddress)));
        } else {
            mLogger.d(TAG, String.format("remove: device=%s deleted", mLogger.sensitiveObject(macAddress)));
        }
    }
}
