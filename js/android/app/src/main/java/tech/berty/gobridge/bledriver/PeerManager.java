package tech.berty.gobridge.bledriver;

import java.util.HashMap;

public class PeerManager {
    private static final String TAG = "bty.ble.PeerManager";
    private final Logger mLogger;

    private final HashMap<String, Peer> mPeers = new HashMap<>();
    
    public PeerManager(Logger logger) {
        mLogger = logger;
    }

    public synchronized Peer getPeer(String peerID) {
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            mLogger.v(TAG, "addPeer: peer unknown");
            peer = new Peer(mLogger, peerID);
            mPeers.put(peerID, peer);
        } else {
            mLogger.v(TAG, "addPeer: peer already known");
        }
        return peer;
    }

    public synchronized Peer registerDevice(String peerID, PeerDevice peerDevice, boolean isClient) {
        mLogger.i(TAG, String.format("registerDevice called: device=%s peerID=%s client=%b", mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(peerID), isClient));

        if (!BleInterface.BLEHandleFoundPeer(peerID)) {
            mLogger.e(TAG, String.format("registerDevice: device=%s peerID=%s: HandleFoundPeer failed", mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(peerID)));
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

    public synchronized void unregisterDevices(String peerID) {
        mLogger.v(TAG, String.format("unregisterDevices called: peerID=%s", mLogger.sensitiveObject(peerID)));
        Peer peer;

        if ((peer = mPeers.get(peerID)) == null) {
            mLogger.i(TAG, String.format("unregisterDevices error: Peer not found: peer=%s", mLogger.sensitiveObject(peerID)));
            return;
        }

        if (peer.isHandshakeSuccessful()) {
            mLogger.i(TAG, String.format("unregisterDevices: call HandleLostPeer for peer: peer=%s", mLogger.sensitiveObject(peerID)));
            BleDriver.mCallbacksHandler.post(() -> {
                BleInterface.BLEHandleLostPeer(peerID);
            });
        }

        peer.removeDevices();
        mPeers.remove(peerID);
    }

    public synchronized Peer get(String peerID) {
        return mPeers.get(peerID);
    }
}
