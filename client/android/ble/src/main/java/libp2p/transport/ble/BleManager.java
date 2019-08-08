package libp2p.transport.ble;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.ParcelUuid;
import android.support.v4.content.ContextCompat;
import android.os.Build;
import android.annotation.TargetApi;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;

import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_WRITE;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE;
import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.content.Context.BLUETOOTH_SERVICE;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.Semaphore;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public final class BleManager {
    private static final String TAG = "ble_manager";

    private BleManager() {}

    private static BluetoothStateWatcher bleStateWatcher;
    private static boolean driverEnabled;
    private static boolean advertising;
    private static boolean scanning;

    private static final GattServer mGattServerCallback = new GattServer();
    private static final Advertiser mAdvertisingCallback = new Advertiser();
    private static final GattClient mGattCallback = new GattClient();
    private static final Scanner mScanCallback = new Scanner();

    private static BluetoothManager bluetoothManager;
    private static BluetoothAdapter mBluetoothAdapter;
    private static BluetoothLeAdvertiser mBluetoothLeAdvertiser;
    private static BluetoothLeScanner mBluetoothLeScanner;

    static final UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D668D");
    static final UUID MA_UUID = UUID.fromString("9B827770-DC72-4C55-B8AE-0870C7AC15A9");
    static final UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B5");
    static final UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1B");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);

    private static final BluetoothGattService mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
    private static final BluetoothGattCharacteristic maCharacteristic = new BluetoothGattCharacteristic(MA_UUID, PROPERTY_READ, PERMISSION_READ);
    private static final BluetoothGattCharacteristic peerIDCharacteristic = new BluetoothGattCharacteristic(PEER_ID_UUID, PROPERTY_READ, PERMISSION_READ);
    private static final BluetoothGattCharacteristic writerCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);

    static boolean isDriverEnabled() { return driverEnabled; }

    static String getMultiAddr() { return maCharacteristic.getStringValue(0); }

    static String getPeerID() { return peerIDCharacteristic.getStringValue(0); }

    static GattClient getGattCallback() { return mGattCallback; }


    // Activity and context getters
    private static Activity getCurrentActivity() { // Based on this blog post: https://androidreclib.wordpress.com/2014/11/22/getting-the-current-activity/
        try {
            Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
            Object activityThread = activityThreadClass.getMethod("currentActivityThread").invoke(null);
            Field activitiesField = activityThreadClass.getDeclaredField("mActivities");
            activitiesField.setAccessible(true);
            Object activityList = activitiesField.get(activityThread);
            Collection activities = (Collection) activityList.getClass().getMethod("values").invoke(activityList);

            for (Object activityRecord : activities) {
                Class activityRecordClass = activityRecord.getClass();
                Field pausedField = activityRecordClass.getDeclaredField("paused");
                pausedField.setAccessible(true);

                if (!pausedField.getBoolean(activityRecord)) {
                    Field activityField = activityRecordClass.getDeclaredField("activity");
                    activityField.setAccessible(true);
                    return (Activity) activityField.get(activityRecord);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "getActivity() failed: " + e.toString());
        }

        return null;
    }

    static Context getContext() {
        Activity activity = getCurrentActivity();

        if (activity != null) {
            return activity.getApplicationContext();
        }

        return null;
    }


    // This inner class will receive update from Android when Bluetooth radio will turn on or off
    // and enable / disable the BLE driver accordingly
    static class BluetoothStateWatcher extends BroadcastReceiver {
        private static final String TAG = "ble_manager.watcher";

        private static Semaphore enableDriverLock = new Semaphore(1);
        private static Semaphore disableDriverLock = new Semaphore(1);

        BluetoothStateWatcher() {
            if (mBluetoothAdapter.isEnabled()) {
                enableDriver();
            }
        }

        @Override
        public void onReceive(Context context, Intent intent) {
            int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1);
            Log.d(TAG, "onReceive() called with Bluetooth state: " + Log.bluetoothAdapterStateToString(state));

            if (state == BluetoothAdapter.STATE_ON) {
                enableDriver();
            } else if (state == BluetoothAdapter.STATE_OFF) {
                disableDriver();
            }
        }

        private static void enableDriver() {
            Log.d(TAG, "enableDriver() called");

            if (!driverEnabled) {
                if (enableDriverLock.tryAcquire()) {
                    new Thread(() -> {
                        try {
                            // If we can't get the advertiser or scanner, it's probably because this
                            // device isn't compatible with BLE. Unfortunately, we can't check that
                            // until the adapter is turned on.
                            mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser();
                            mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner();

                            if (mBluetoothLeAdvertiser != null || mBluetoothLeScanner != null) {
                                if (setupService()) {
                                    if (!scanning) startScanning();
                                    if (!advertising) startAdvertising();
                                    driverEnabled = true;
                                    Log.d(TAG, "enableDriver() succeeded");
                                } else {
                                    Log.e(TAG, "enableDriver() failed: can't setup service");
                                }
                            } else {
                                Log.e(TAG, "enableDriver() failed: can't get Bluetooth advertiser / scanner; this device may not be compatible with BLE");
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "enableDriver() failed: " + e.getMessage());
                        }
                        enableDriverLock.release();
                    }).start();
                } else {
                    Log.d(TAG, "enableDriver() skipped: another attempt is running");
                }
            } else {
                Log.d(TAG, "enableDriver() skipped: driver already enabled");
            }
        }

        private static void disableDriver() {
            Log.d(TAG, "disableDriver() called");

            if (driverEnabled) {
                if (disableDriverLock.tryAcquire()) {
                    new Thread(() -> {
                        scanning = false;
                        advertising = false;
                        driverEnabled = false;
                        try {
                            Log.d(TAG, "424242 disableDriver() BEFORE CLOSE GATT");
                            mGattServerCallback.closeGattServer();
                            Log.d(TAG, "424242 disableDriver() BEFORE DISCONNECT DEVS");
                            DeviceManager.disconnectFromAllDevices();
                            Log.d(TAG, "disableDriver() succeeded");
                        } catch (Exception e) {
                            Log.e(TAG, "disableDriver() failed: " + e.getMessage());
                        }
                        disableDriverLock.release();
                    }).start();
                } else {
                    Log.d(TAG, "disableDriver() skipped: another attempt is running");
                }
            } else {
                Log.d(TAG, "disableDriver() skipped: driver already disabled");
            }
        }
    }

    public static boolean startBleDriver(String multiAddr, String peerID) {
        Log.d(TAG, "startBleDriver() called");

        // This device may not support Bluetooth
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (mBluetoothAdapter == null) {
            Log.e(TAG, "startBleDriver() failed: this device is not compatible with Bluetooth");
            return false;
        }

        // The method for getting current activity and context directly from this lib is kind of
        // hacky. It might not work in the future. If it doesn't work anymore, we'll make sure
        // to fix it and hope that by then, Android offers a way to do it properly.
        Activity activity = getCurrentActivity();
        Context context = (activity != null) ? activity.getApplicationContext() : null;
        if (activity == null || context == null) {
            Log.e(TAG, "startBleDriver() failed: can't get current activity/context");
            return false;
        }

        bluetoothManager = (BluetoothManager)context.getSystemService(BLUETOOTH_SERVICE);
        if (bluetoothManager == null) {
            Log.e(TAG, "startBleDriver() failed: can't access to Android Bluetooth Manager");
            return false;
        }


        // ACCESS_FINE_LOCATION permission is required by BLE, you need to request it within your app
        // before calling startBleDriver().
        // See https://developer.android.com/training/permissions/requesting.html#make-the-request
        if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "startBleDriver() failed: location permission isn't granted");
            return false;
        }

        // Set MultiAddr and PeerID characteristics
        maCharacteristic.setValue(multiAddr);
        peerIDCharacteristic.setValue(peerID);

        // If Bluetooth is turned off when calling startBleDriver, it won't fail. A Bluetooth state watcher
        // will run in background and will start/stop BLE driver according to the Bluetooth adapter state.
        if (bleStateWatcher == null) {
            bleStateWatcher = new BluetoothStateWatcher();
            context.registerReceiver(bleStateWatcher, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
        }

        return true;
    }

    public static boolean stopBleDriver() {
        Log.d(TAG, "stopBleDriver() called");

        // Disable the Bluetooth state watcher
        if (bleStateWatcher != null) {
            Context context = getContext();

            if (context != null) {
                context.unregisterReceiver(bleStateWatcher);
            }

            bleStateWatcher = null;
        }

        if (mBluetoothAdapter.isEnabled()) {
            if (scanning) stopScanning();
            if (advertising) stopAdvertising();
        }

        mGattServerCallback.closeGattServer();
        DeviceManager.disconnectFromAllDevices();

        // TODO: return void
        return true;
    }

    private static boolean setupService() {
        Log.d(TAG, "setupService() called");

        Context context = getContext();

        if (context == null) {
            Log.e(TAG, "setupService() failed: can't get context");
            return false;
        }

        if ((mService.getCharacteristic(MA_UUID) == null && !mService.addCharacteristic(maCharacteristic))          ||
            (mService.getCharacteristic(PEER_ID_UUID) == null && !mService.addCharacteristic(peerIDCharacteristic)) ||
            (mService.getCharacteristic(WRITER_UUID) == null && !mService.addCharacteristic(writerCharacteristic))) {
            Log.e(TAG, "setupService() failed: can't add characteristics to service");
            return false;
        }

        BluetoothGattServer gattServer = bluetoothManager.openGattServer(context, mGattServerCallback);
        gattServer.addService(mService);
        mGattServerCallback.setBluetoothGattServer(gattServer);

        return true;
    }


    // Scanning and advertising related
    private static void startScanning() {
        Log.d(TAG, "startScanning() called");

        ScanSettings settings = Scanner.createScanSetting();
        ScanFilter filter = Scanner.makeFilter();

        // Android only provides a way to know if startScan has failed so we set the scanning state
        // to true and ScanCallback will set it to false in case of failure.
        setScanningState(true);
        mBluetoothLeScanner.startScan(Collections.singletonList(filter), settings, mScanCallback);
    }

    private static void startAdvertising() {
        Log.d(TAG, "startAdvertising() called");

        AdvertiseSettings settings = Advertiser.buildAdvertiseSettings();
        AdvertiseData data = Advertiser.buildAdvertiseData();

        mBluetoothLeAdvertiser.startAdvertising(settings, data, mAdvertisingCallback);
    }

    private static void stopScanning() {
        Log.d(TAG, "stopScanning() called");

        mBluetoothLeScanner.stopScan(mScanCallback);
        setScanningState(false);
    }

    private static void stopAdvertising() {
        Log.d(TAG, "stopAdvertising() called");

        mBluetoothLeAdvertiser.stopAdvertising(mAdvertisingCallback);
        setAdvertisingState(false);
    }

    static void setAdvertisingState(boolean state) {
        Log.d(TAG, "setAdvertisingState() called with state: " + state);

        advertising = state;
    }

    static void setScanningState(boolean state) {
        Log.d(TAG, "setScanningState() called with state: " + state);

        scanning = state;
    }
}
