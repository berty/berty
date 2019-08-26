package libp2p.transport.ble;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import java.util.Arrays;
import java.util.Objects;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public final class GoToJava {
    private static final String TAG = "go_to_java";

    private static final StateLock receiverRegistered = new StateLock();

    public static void enableGoLogger() { Log.enableGoLogger(); }

    // Application Context is tied to the lifetime of the process so storing it in a static variable
    // won't produce a memory leak
    @SuppressLint("StaticFieldLeak")
    private static Context context = getApplicationContext();

    // The method for getting application context directly from this lib is kind of
    // hacky. It might not work in the future. If it doesn't work anymore, we'll make sure
    // to fix it and hope that by then, Android offers a way to do it properly.
    private static Context getApplicationContext() {
        try {
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Application application = (Application) activityThreadClass.getMethod("currentApplication").invoke(null);
            return application.getApplicationContext();
        } catch (Exception e) {
            android.util.Log.e(TAG, "getAppContext() failed: " + e.toString());
            return null;
        }
    }

    static Context getContext() {
        return context;
    }

    // TODO: Give option to pass an Application Context from Go
    public static boolean startBleDriver(@NonNull String localPID) {
        Log.d(TAG, "startBleDriver() called");

        Objects.requireNonNull(localPID);
        if (localPID.isEmpty()) {
            Log.e(TAG, "startBleDriver() failed: localPID can't be empty");
            return false;
        }
        BleDriver.setLocalPeerID(localPID);

        // This device may not support Bluetooth
        if (BluetoothAdapter.getDefaultAdapter() == null) {
            Log.e(TAG, "startBleDriver() failed: this device is not compatible with Bluetooth");
            return false;
        }

        // Check if context has been retrieved successfully
        // (see comment above getApplicationContext() method)
        if (context == null) {
            Log.e(TAG, "startBleDriver() failed: can't get application context");
            return false;
        }

        // ACCESS_FINE_LOCATION permission is required by BLE, you need to request it within your app
        // before calling startBleDriver().
        // See https://developer.android.com/training/permissions/requesting.html#make-the-request
        if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "startBleDriver() failed: location permission isn't granted");
            return false;
        }

        // If Bluetooth is turned off when calling startBleDriver, it won't fail. A Bluetooth state watcher
        // will run in background and will start/stop BLE driver according to the Bluetooth adapter state.
        synchronized (receiverRegistered) {
            if (!receiverRegistered.getState()) {
                context.registerReceiver(BleDriver.getBluetoothStateWatcher(), new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
                receiverRegistered.setState(true);
            }
        }

        return true;
    }

    public static void stopBleDriver() {
        Log.d(TAG, "stopBleDriver() called");

        // Disable the Bluetooth state watcher
        synchronized (receiverRegistered) {
            if (receiverRegistered.getState()) {
                try { context.unregisterReceiver(BleDriver.getBluetoothStateWatcher()); } catch(Throwable t) {}
                receiverRegistered.setState(false);
            }
        }

        BleDriver.stopScanning();
        BleDriver.stopAdvertising();

        try {
            BleDriver.getGattServerCallback().closeGattServer();
            DeviceManager.disconnectFromAllDevices();
        } catch (Exception e) {
            Log.e(TAG, "stopBleDriver() failed: " + e.getMessage());
        }
    }

    public static boolean dialPeer(String remotePID) {
        Log.i(TAG, "dialDevice() called with PeerID: " + remotePID);

        PeerDevice peerDevice = DeviceManager.getDeviceFromPeerID(remotePID);

        return peerDevice != null && peerDevice.isGattConnected();

    }

    public static boolean sendToPeer(String remotePID, byte[] payload) {
        Log.i(TAG, "writeToDevice() called with payload: " + Arrays.toString(payload) + ", hashCode: " + Arrays.toString(payload).hashCode() + ", string: " + new String(payload).replaceAll("\\p{C}", "?") + ", length: " + payload.length + ", to PeerID: " + remotePID);

        PeerDevice peerDevice = DeviceManager.getDeviceFromPeerID(remotePID);

        if (peerDevice == null) {
            // Could happen if device has fully disconnected and libp2p isn't aware of it
            Log.e(TAG, "writeToDevice() failed: unknown device");
            return false;
        } else if (!peerDevice.isIdentified()) {
            // Could happen if device has fully disconnected, libp2p isn't aware of it and device is reconnecting right now
            Log.e(TAG, "writeToDevice() failed: device not ready yet");
            return false;
        }

        try {
            return peerDevice.writeToRemoteWriterCharacteristic(payload);
        } catch(InterruptedException e) {
            Log.e(TAG, "writeToDevice() failed: " + e.getMessage());
            return false;
        }
    }

    public static void closeConnWithPeer(String remotePID) {
        Log.i(TAG, "disconnectFromDevice() called with PeerID: " + remotePID);

        PeerDevice peerDevice = DeviceManager.getDeviceFromPeerID(remotePID);

        if (peerDevice != null) {
            peerDevice.interruptConnectionThread();
            peerDevice.interruptHandshakeThread();
            peerDevice.disconnectFromDevice("libp2p request");
        } else {
            Log.e(TAG, "disconnectFromDevice() failed: unknown device");
        }
    }
}
