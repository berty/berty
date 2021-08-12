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
    public final Object SocketLock = new Object();
    private final String mPeerID;
    private final ArrayList<PeerDevice> mClientDevices = new ArrayList<>();
    private final ArrayList<PeerDevice> mServerDevices = new ArrayList<>();
    private BluetoothSocket bluetoothSocket;
    private InputStream inputStream;
    private OutputStream outputStream;

    private Runnable mTimeoutRunnable;

    public Peer(String peerID) {
        mPeerID = peerID;
    }

    public BluetoothSocket getBluetoothSocket() {
        synchronized (SocketLock) {
            return bluetoothSocket;
        }
    }

    public void setBluetoothSocket(BluetoothSocket bluetoothSocket) {
        synchronized (SocketLock) {
            this.bluetoothSocket = bluetoothSocket;
        }
    }

    public InputStream getInputStream() {
        synchronized (SocketLock) {
            return inputStream;
        }
    }

    public void setInputStream(InputStream inputStream) {
        synchronized (SocketLock) {
            this.inputStream = inputStream;
        }
    }

    public OutputStream getOutputStream() {
        synchronized (SocketLock) {
            return outputStream;
        }
    }

    public void setOutputStream(OutputStream outputStream) {
        synchronized (SocketLock) {
            this.outputStream = outputStream;
        }
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

    public synchronized void disconnectAndRemoveDevices() {
        synchronized (SocketLock) {
            if (getBluetoothSocket() != null) {
                try {
                    getBluetoothSocket().close();
                } catch (IOException e) {
                    Log.e(TAG, String.format("disconnectAndRemoveDevices: peer=%s BluetoothSocket close error: ", getPeerID()), e);
                } finally {
                    setBluetoothSocket(null);
                    setInputStream(null);
                    setOutputStream(null);
                }
            }
        }

        for (PeerDevice device : mClientDevices) {
            device.disconnect();
        }
        mClientDevices.clear();

        for (PeerDevice device : mServerDevices) {
            device.disconnect();
        }
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
