package com.bluetooth;

import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.util.Log;

import java.io.IOException;

public class BertyBluetoothListerner extends Thread {
    private final BluetoothServerSocket mmServerSocket;

    private BertyBluetooth bb;

    protected String TAG = "BertyBluetoothListerner";

    protected boolean go = true;

    public BertyBluetoothListerner(BertyBluetooth m) {
        // Use a temporary object that is later assigned to mmServerSocket
        // because mmServerSocket is final.
        bb = m;
        BluetoothServerSocket tmp = null;
        try {
            // MY_UUID is the app's UUID string, also used by the client code.
            tmp = bb.bAdapter.listenUsingInsecureRfcommWithServiceRecord("Berty", bb.MY_UUID);
        } catch (IOException e) {
            Log.e(TAG, "Socket's listen() method failed", e);
        }
        mmServerSocket = tmp;
    }

    public void run() {
        BluetoothSocket socket = null;

        if (mmServerSocket == null) {
            Log.e(TAG, "Can't start Listener thread no socket for listening");
            return;
        }

        while (go) {
            try {
                socket = mmServerSocket.accept();
            } catch (IOException e) {
                Log.e(TAG, "Socket's accept() method failed", e);
            }

            if (socket != null) {
                synchronized (this) {
                    Log.d(TAG, "Incoming connection from: "
                            + socket.getRemoteDevice().getName());
                    bb.connect(socket.getRemoteDevice().getAddress(), socket);
                }
            }
        }
    }

    // Closes the connect socket and causes the thread to finish.
    public void cancel() {
        go = false;
        try {
            mmServerSocket.close();
        } catch (IOException e) {
            Log.e(TAG, "Could not close the connect socket", e);
        }
    }
}
