package tech.berty.bertybridgeexpo.gobridge.bledriver;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class PeerManager {
    private static final String TAG = "bty.ble.PeerManager";
    private final Logger mLogger;

    private final HashMap<String, Peer> mPeers = new HashMap<>();

    // Lost-peer notifications are delivered to the Go side on their own thread, never while a
    // lock of the driver is held: BLEHandleLostPeer() closes the libp2p connection and waits
    // for its writers, and a writer may itself be waiting for this monitor in SendToPeer() ->
    // get(). One thread, so the notifications keep their order. It is independent of the
    // driver loopers, which are thrown away when the driver stops.
    private static final ExecutorService sLostPeerNotifier = Executors.newSingleThreadExecutor(runnable -> {
        Thread thread = new Thread(runnable, "bty.ble.LostPeer");
        thread.setDaemon(true);
        return thread;
    });

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
            notifyLostPeers(Collections.singletonList(peerID));
        }

        peer.removeDevices();
        mPeers.remove(peerID);
    }

    // Drop every known peer and notify the Go side. Used when the BLE driver is stopped
    // (e.g. Bluetooth turned off): the underlying connections no longer exist.
    // The peers are taken and cleared under the monitor, the Go side is notified after it has
    // been released (see sLostPeerNotifier).
    public void unregisterAllPeers() {
        List<String> lost = new ArrayList<>();
        synchronized (this) {
            for (Map.Entry<String, Peer> entry : mPeers.entrySet()) {
                Peer peer = entry.getValue();
                if (peer.isHandshakeSuccessful()) {
                    lost.add(entry.getKey());
                }
                peer.removeDevices();
            }
            mPeers.clear();
        }
        notifyLostPeers(lost);
    }

    private void notifyLostPeers(List<String> peerIDs) {
        for (String peerID : peerIDs) {
            sLostPeerNotifier.execute(() -> {
                try {
                    BleInterface.BLEHandleLostPeer(peerID);
                } catch (RuntimeException e) {
                    mLogger.e(TAG, String.format("HandleLostPeer failed: peer=%s", mLogger.sensitiveObject(peerID)), e);
                }
            });
        }
    }

    // Waits (at most timeoutMs) until the lost-peer notifications queued so far have been
    // delivered. Called before the driver starts again, so that the Go side does not get the
    // "lost" of the previous Bluetooth session after the "found" of the new one.
    // Must not be called with the monitor of this object held.
    public void awaitLostPeerNotifications(long timeoutMs) {
        try {
            sLostPeerNotifier.submit(() -> { }).get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            mLogger.w(TAG, "awaitLostPeerNotifications: lost-peer notifications still pending");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (ExecutionException e) {
            // the no-op task can't fail
        }
    }

    public synchronized Peer get(String peerID) {
        return mPeers.get(peerID);
    }
}
