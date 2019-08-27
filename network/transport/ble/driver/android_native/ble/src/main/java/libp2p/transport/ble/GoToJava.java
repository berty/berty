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

    public static void setApplicationContext(final Context context) { BleDriver.setContext(context); }

    // The method for getting application context directly from this lib is kind of hacky.
    // It might not work in the future. If it doesn't work anymore, you can still pass the
    // application context using the setter above, until Android offers a cleaner way to do it.
    private static Context getApplicationContext() {
        try {
            @SuppressLint("PrivateApi") // We know it's bad, see comment above
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Application application = (Application) activityThreadClass.getMethod("currentApplication").invoke(null);
            return application.getApplicationContext();
        } catch (Exception e) {
            android.util.Log.e(TAG, "getAppContext() failed: " + e.toString());
            return null;
        }
    }

    public static boolean startBleDriver(@NonNull final String localPID) {
        Objects.requireNonNull(localPID);
        Log.d(TAG, "startBleDriver() called");

        if (localPID.isEmpty()) {
            Log.e(TAG, "startBleDriver() failed: localPID can't be empty");
            return false;
        }
        BleDriver.setLocalPeerID(localPID);

        // This device may not support Bluetooth
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            Log.e(TAG, "startBleDriver() failed: this device is not compatible with Bluetooth");
            return false;
        }

        // Check if context has been set from Go, if not, get application context in a hacky way
        // (see comment above getApplicationContext() method)
        if (BleDriver.getContext() == null) {
            Context context = getApplicationContext();
            if (context == null) {
                Log.e(TAG, "startBleDriver() failed: can't get application context");
                return false;
            }
            BleDriver.setContext(context);
        }

        // ACCESS_FINE_LOCATION permission is required by BLE, you need to request it within your app
        // before calling startBleDriver().
        // See https://developer.android.com/training/permissions/requesting.html#make-the-request
        if (ContextCompat.checkSelfPermission(BleDriver.getContext(), android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "startBleDriver() failed: location permission isn't granted");
            return false;
        }

        // If Bluetooth is turned off when calling startBleDriver, it won't fail. A Bluetooth state watcher
        // will run in background and will start/stop BLE driver according to the Bluetooth adapter state.
        if (bluetoothAdapter.isEnabled()) { BleDriver.enable(); }

        synchronized (receiverRegistered) {
            if (!receiverRegistered.getState()) {
                BleDriver.getContext().registerReceiver(BleDriver.getBluetoothStateWatcher(), new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
                receiverRegistered.setState(true);
            }
        }

        return true;
    }

    public static void stopBleDriver() {
        Log.d(TAG, "stopBleDriver() called");

        JavaToGo.stopEventLoop();

        // Disable the Bluetooth state watcher
        synchronized (receiverRegistered) {
            if (receiverRegistered.getState()) {
                try { BleDriver.getContext().unregisterReceiver(BleDriver.getBluetoothStateWatcher()); } catch(Throwable t) {}
                receiverRegistered.setState(false);
            }
        }

        BleDriver.disable();
    }

    public static boolean dialPeer(@NonNull final String remotePID) {
        Objects.requireNonNull(remotePID);
        Log.i(TAG, "dialDevice() called with PeerID: " + remotePID);

        PeerDevice peerDevice = DeviceManager.getDeviceFromPeerID(remotePID);

        return peerDevice != null && peerDevice.isGattConnected();

    }

    public static boolean sendToPeer(@NonNull final String remotePID, @NonNull final byte[] payload) {
        Objects.requireNonNull(remotePID);
        Objects.requireNonNull(payload);
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

    public static void closeConnWithPeer(@NonNull final String remotePID) {
        Objects.requireNonNull(remotePID);
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
