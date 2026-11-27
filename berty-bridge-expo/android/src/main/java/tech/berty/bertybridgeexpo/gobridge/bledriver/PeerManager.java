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

    // Peers whose loss is queued on sLostPeerNotifier and not delivered yet (peerID -> count).
    // A peer is not reported as found again before its previous loss has been delivered,
    // otherwise the late "lost" would close the new connection in Go.
    // Guarded by mLossLock. Lock order: this object, then mLossLock (never the reverse).
    private final Object mLossLock = new Object();
    private final HashMap<String, Integer> mPendingLoss = new HashMap<>();
    private static final long LOSS_BEFORE_FOUND_TIMEOUT_MS = 5000;
    private static final int REGISTER_ATTEMPTS = 3;

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

    public Peer registerDevice(String peerID, PeerDevice peerDevice, boolean isClient) {
        mLogger.i(TAG, String.format("registerDevice called: device=%s peerID=%s client=%b", mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(peerID), isClient));

        for (int attempt = 0; attempt < REGISTER_ATTEMPTS; attempt++) {
            // wait for a previous loss of this peer to be delivered, without holding the monitor
            // (the loss handler may wait for a writer that needs it, see sLostPeerNotifier)
            if (!awaitPendingLoss(peerID, LOSS_BEFORE_FOUND_TIMEOUT_MS)) {
                mLogger.e(TAG, String.format("registerDevice: device=%s peerID=%s: previous loss of the peer still being delivered", mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(peerID)));
                return null;
            }
            synchronized (this) {
                // a new loss may have been queued in the meantime: wait for it too
                if (hasPendingLoss(peerID)) {
                    continue;
                }
                return registerDeviceLocked(peerID, peerDevice, isClient);
            }
        }
        mLogger.e(TAG, String.format("registerDevice: device=%s peerID=%s: peer lost again while registering", mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(peerID)));
        return null;
    }

    private Peer registerDeviceLocked(String peerID, PeerDevice peerDevice, boolean isClient) {
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

    private boolean hasPendingLoss(String peerID) {
        synchronized (mLossLock) {
            return mPendingLoss.containsKey(peerID);
        }
    }

    // true when no loss of this peer is pending (anymore), false on timeout
    private boolean awaitPendingLoss(String peerID, long timeoutMs) {
        long deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(timeoutMs);
        synchronized (mLossLock) {
            while (mPendingLoss.containsKey(peerID)) {
                long leftMs = TimeUnit.NANOSECONDS.toMillis(deadline - System.nanoTime());
                if (leftMs <= 0) {
                    return false;
                }
                try {
                    mLossLock.wait(leftMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
            return true;
        }
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
            synchronized (mLossLock) {
                Integer count = mPendingLoss.get(peerID);
                mPendingLoss.put(peerID, count == null ? 1 : count + 1);
            }
            sLostPeerNotifier.execute(() -> {
                try {
                    BleInterface.BLEHandleLostPeer(peerID);
                } catch (RuntimeException e) {
                    mLogger.e(TAG, String.format("HandleLostPeer failed: peer=%s", mLogger.sensitiveObject(peerID)), e);
                } finally {
                    synchronized (mLossLock) {
                        Integer count = mPendingLoss.get(peerID);
                        if (count == null || count <= 1) {
                            mPendingLoss.remove(peerID);
                        } else {
                            mPendingLoss.put(peerID, count - 1);
                        }
                        mLossLock.notifyAll();
                    }
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
