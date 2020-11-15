package tech.berty.gobridge.bledriver;

import android.util.Log;

public class Peer {
    private static final String TAG = "Peer";

    private String mPeerID;
    private boolean mIsReady = false;
    private boolean mAlreadyFound = false;
    private PeerDevice mPeerDevice;

    public Peer(String peerID, boolean ready, PeerDevice peerDevice) {
        mPeerID = peerID;
        mIsReady = ready;
        mPeerDevice = peerDevice;
    }

    public synchronized String getPeerID() {
        return mPeerID;
    }

    public synchronized boolean isReady() {
        return (mIsReady == true);
    }

    public synchronized void setAlreadyFound(boolean status) {
        mAlreadyFound = status;
    }

    public synchronized boolean isAlreadyFound() {
        return mAlreadyFound == true;
    }

    public synchronized void setPeerDevice(PeerDevice peerDevice) {
        mPeerDevice = peerDevice;
    }

    public synchronized PeerDevice getPeerDevice() {
        return mPeerDevice;
    }

    // if the device is ready, send a signal to HandlePeerFound
    public synchronized void setIsReady(boolean ready) {
        Log.d(TAG, "setIsReady() called: " + ready);
        if (ready && !mIsReady) {
            mIsReady = true;
        }
    }
}
