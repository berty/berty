package tech.berty.gobridge.bledriver;

import android.util.Log;

import java.util.HashMap;

public class PeerManager {
    private static final String TAG = "bty.ble.PeerManager";

    private static final HashMap<String, Peer> mPeers = new HashMap<>();

    public static synchronized Peer getPeer(String peerID) {
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            Log.v(TAG, "addPeer: peer unknown");
            peer = new Peer(peerID);
            mPeers.put(peerID, peer);
        } else {
            Log.v(TAG, "addPeer: peer already known");
        }
        return peer;
    }

    public static synchronized Peer registerDevice(String peerID, PeerDevice peerDevice, boolean isClient) {
        Log.i(TAG, String.format("registerDevice called: device=%s peerID=%s client=%b", peerDevice.getMACAddress(), peerID, isClient));

        if (!BleInterface.BLEHandleFoundPeer(peerID)) {
            Log.e(TAG, String.format("registerDevice: device=%s peerID=%s: HandleFoundPeer failed", peerDevice.getMACAddress(), peerID));
            return null;
        }

        Peer peer = getPeer(peerID);
        if (isClient) {
            peer.addClientDevice(peerDevice);
        } else {
            peer.addServerDevice(peerDevice);
        }

        peer.getDevice().flushServerDataCache();

        return peer;
    }

    public static synchronized void unregisterDevices(String peerID) {
        Log.v(TAG, String.format("unregisterDevices called: peerID=%s", peerID));
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            Log.i(TAG, String.format("unregisterDevices error: Peer not found: peer=%s", peerID));
            return;
        }

        if (peer.isHandshakeSuccessful()) {
            Log.i(TAG, String.format("unregisterDevices: call HandleLostPeer for peer: peer=%s", peerID));
            BleDriver.mCallbacksHandler.post(() -> {
                BleInterface.BLEHandleLostPeer(peerID);
            });
        }

        peer.removeDevices();
        mPeers.remove(peerID);
    }

    public static synchronized Peer get(String peerID) {
        return mPeers.get(peerID);
    }
}
