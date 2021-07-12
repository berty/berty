package tech.berty.gobridge.bledriver;

import android.util.Log;

import java.util.HashMap;

public class PeerManager {
    private static final String TAG = "bty.ble.PeerManager";

    private static final HashMap<String, Peer> mPeers = new HashMap<>();

    public static synchronized Peer addPeer(String peerID) {
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
        Log.d(TAG, String.format("registerDevice called: peerID=%s device=%s client=%b", peerID, peerDevice.getMACAddress(), isClient));

        Peer peer = addPeer(peerID);
        boolean prevState = peer.isHandshakeSuccessful();
        if (isClient) {
            peer.addClientDevice(peerDevice);

            // add a timeout to disconnect the client if the server side is not ready after a while
            if (!peer.isServerReady()) {
                peer.enableTimeout();
            }
        } else {
            peer.addServerDevice(peerDevice);
            peer.disableTimeout();
        }

        if (!prevState && peer.isHandshakeSuccessful()) {
            Log.i(TAG, String.format("registerDevice: BLE handshake successful: peer=%s device=%s", peerID, peerDevice.getMACAddress()));
            BleInterface.BLEHandleFoundPeer(peerID);
        }

        return peer;
    }

    /*public static synchronized void unregisterDevice(String peerID, PeerDevice peerDevice, boolean isClient) {
        Log.v(TAG, String.format("unregisterDevice called: peerID=%s device=%s client=%b", peerID, peerDevice.getMACAddress(), isClient));
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            Log.e(TAG, String.format("unregisterDevice error: Peer not found: peer=%s device=%s client=%b", peerID, peerDevice.getMACAddress(), isClient));
            return;
        }

        boolean prevState = peer.isHandshakeSuccessful();

        if (isClient) {
            peer.removeClientDevice(peerDevice);
        } else {
            peer.removeServerDevice(peerDevice);
        }

        if (prevState && !peer.isHandshakeSuccessful()) {
            Log.i(TAG, String.format("unregisterDevice: lost remote peer: peer=%s device=%s", peerID, peerDevice.getMACAddress()));
            BleInterface.BLEHandleLostPeer(peerID);
        }

        if (!peer.isClientReady() && !peer.isServerReady()) {
            Log.d(TAG, String.format("unregisterDevice: delete Peer: peer=%s device=%s", peerID, peerDevice.getMACAddress()));
            mPeers.remove(peerID);
        }
    }*/

    public static synchronized void unregisterDevices(String peerID) {
        Log.v(TAG, String.format("unregisterDevices called: peerID=%s", peerID));
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            Log.e(TAG, String.format("unregisterDevices error: Peer not found: peer=%s", peerID));
            return;
        }

        if (peer.isHandshakeSuccessful()) {
            Log.i(TAG, String.format("unregisterDevices: lost remote peer: peer=%s", peerID));
            BleInterface.BLEHandleLostPeer(peerID);
        }

        peer.disableTimeout();
        peer.disconnectAndRemoveDevices();
        mPeers.remove(peerID);
    }

    public static synchronized Peer get(String peerID) {
        return mPeers.get(peerID);
    }
}
