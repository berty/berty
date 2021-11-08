package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothSocket;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class Peer {
    private static final String TAG = "bty.ble.Peer";

    private static final long TIMEOUT = 30000;
    private final String mPeerID;
    private final ArrayList<PeerDevice> mClientDevices = new ArrayList<>();
    private final ArrayList<PeerDevice> mServerDevices = new ArrayList<>();

    private Runnable mTimeoutRunnable;

    public Peer(String peerID) {
        mPeerID = peerID;
    }

    public synchronized String getPeerID() {
        return mPeerID;
    }

    public synchronized void addClientDevice(PeerDevice peerDevice) {
        mClientDevices.add(peerDevice);
    }

    public synchronized void addServerDevice(PeerDevice peerDevice) {
        mServerDevices.add(peerDevice);
    }

    public synchronized void removeDevices() {
        Log.d(TAG, String.format("removeDevices called: pid=%s", mPeerID));

        mClientDevices.clear();
        mServerDevices.clear();
    }

    public synchronized PeerDevice getPeerClientDevice() {
        if (mClientDevices.size() > 0) {
            return mClientDevices.get(0);
        }
        return null;
    }

    public synchronized PeerDevice getPeerServerDevice() {
        if (mServerDevices.size() > 0) {
            return mServerDevices.get(0);
        }
        return null;
    }

    public synchronized PeerDevice getDevice() {
        if (mClientDevices.size() > 0) {
            return mClientDevices.get(0);
        } else if (mServerDevices.size() > 0) {
            return mServerDevices.get(0);
        }

        return null;
    }

    public synchronized boolean isClientReady() {
        return mClientDevices.size() > 0;
    }

    public synchronized boolean isServerReady() {
        return mServerDevices.size() > 0;
    }

    public synchronized boolean isHandshakeSuccessful() {
        return isClientReady() || isServerReady();
    }
}
