package chat.berty;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class BertyBluetoothConnection extends Thread {
    private final BluetoothDevice mmDevice;

    private final BertyBluetooth bb;

    private BluetoothSocket mmSocket;

    private InputStream mmInStream;

    private OutputStream mmOutStream;

    private byte[] mmBuffer; // mmBuffer store for the stream

    public boolean isConnected = false;

    private String TAG = "BertyBluetoothConnection";

    private interface MessageConstants {
        public static final int MESSAGE_READ = 0;
        public static final int MESSAGE_WRITE = 1;
        public static final int MESSAGE_TOAST = 2;

        // ... (Add other message types here as needed.)
    }

    public BertyBluetoothConnection(BertyBluetooth m, BluetoothSocket socket) {
        mmSocket = socket;
        mmDevice = socket.getRemoteDevice();
        bb = m;
        InputStream tmpIn = null;
        OutputStream tmpOut = null;

        // Get the input and output streams; using temp objects because
        // member streams are final.
        try {
            tmpIn = socket.getInputStream();
        } catch (IOException e) {
            Log.e(TAG, "Error occurred when creating input stream", e);
        }
        try {
            tmpOut = socket.getOutputStream();
        } catch (IOException e) {
            Log.e(TAG, "Error occurred when creating output stream", e);
        }

        mmInStream = tmpIn;
        mmOutStream = tmpOut;
        isConnected = true;
    }

    public void run() {
        mmBuffer = new byte[1024];
        int numBytes; // bytes returned from read()
        String msg;

        // Keep listening to the InputStream until an exception occurs.
        while (true) {
            try {
                // Read from the InputStream.
                numBytes = mmInStream.read(mmBuffer);
                msg = new String(mmBuffer, StandardCharsets.UTF_8);
                Log.d(TAG,  Integer.toString(numBytes)+ " bytes readed, msg: " + msg);
            } catch (IOException e) {
                Log.d(TAG, "Input stream was disconnected", e);
                isConnected = false;
                break;
            }
        }
    }

    public void disconnect() {
        Log.d(TAG, "Disconnecting " + mmDevice.getAddress());
        if (mmInStream != null) {
            try {
                Log.d(TAG, "Trying to close mmInStream");
                mmInStream.close();
            } catch (Exception e) {
                Log.e(TAG, "Failed closing mmInStream", e);
            }
            mmInStream = null;
        }
        if (mmOutStream != null) {
            try {
                Log.d(TAG, "Trying to close mmOutStream");
                mmOutStream.close();
            } catch (Exception e) {
                Log.e(TAG, "Failed closing mmOutStream", e);
            }
            mmOutStream = null;
        }
        if (mmSocket != null) {
            try {
                Log.d(TAG, "Trying to close mmSocket");
                mmSocket.close();
            } catch (Exception e) {
                Log.e(TAG, "Failed closing mmSocket", e);
            }
            mmSocket = null;
        }
        bb.disconnect(mmDevice.getAddress());
    }

    // Call this from the main activity to send data to the remote device.
    public void write(byte[] bytes) {
        try {
            mmOutStream.write(bytes);
        } catch (IOException e) {
            Log.e(TAG, "Error occurred when sending data", e);
            bb.disconnect(mmDevice.getAddress());
        }
    }

    // Call this method from the main activity to shut down the connection.
    public void cancel() {
        try {
            mmSocket.close();
            bb.disconnect(mmDevice.getAddress());
        } catch (IOException e) {
            Log.e(TAG, "Could not close the connect socket", e);
        }
    }
}
