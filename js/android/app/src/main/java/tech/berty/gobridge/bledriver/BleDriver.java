package tech.berty.gobridge.bledriver;

import android.annotation.SuppressLint;
import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.IntentFilter;
import android.util.Log;

import java.util.Collections;

// Make the BleDriver class a Singleton
// see https://medium.com/@kevalpatel2106/how-to-make-the-perfect-singleton-de6b951dfdb0
public class BleDriver {
    private static final String TAG = "BleDriver";

    private static volatile BleDriver mBleDriver;

    static final String ACTION_PEER_FOUND = "BleDriver.ACTION_PEER_FOUND";

    private static Context mAppContext;
    private static BluetoothAdapter mBluetoothAdapter;

    // GATT server
    private static GattServer mGattServer;
    private static GattServerCallback mGattServerCallback;

    // Scanning
    // API level 21
    // Scanner is the implementation of the ScanCallback abstract class
    private static ScanFilter mScanFilter;
    private static ScanSettings mScanSettings;
    private static Scanner mScanCallback;
    private static BluetoothLeScanner mBluetoothLeScanner;
    private static boolean mScanning;

    // Advertising
    // API level 21
    // Advertiser is the implementation of the AdvertiseCallback abstract class
    private static AdvertiseSettings mAdvertiseSettings;
    private static AdvertiseData mAdvertiseData;
    private static Advertiser mAdvertiseCallback;
    private static BluetoothLeAdvertiser mBluetoothLeAdvertiser;
    private static boolean mAdvertising;

    private static boolean mStateInit = false;
    private static boolean mStateStarted = false;

    private BleDriver() {
        if (mBleDriver != null) {
            throw new RuntimeException("Use getInstance() method to get the singleton instance of this class");
        }
    }

    // Get Context by a hacking way.
    // If it already done, return immediately true.
    private static synchronized boolean initContext() {
        Log.d(TAG, "initContext() called");

        if (mAppContext == null) {
            try {
                @SuppressLint("PrivateApi")
                Class<?> activityThreadClass = Class.forName("android.app.ActivityThread");
                Application application = (Application) activityThreadClass.getMethod("currentApplication").invoke(null);
                mAppContext = application.getApplicationContext();
                Log.d(TAG, "initContext(): context gotten successfully");
            } catch (Exception e) {
                Log.e(TAG, "initContext(): context not found");
                return false;
            }
        }
        return true;
    }

    // Get BluetoothAdapter object and test if bluetooth is enabled.
    // If it already done, return immediately true.
    private static synchronized boolean initBluetoothAdapter() {
        Log.d(TAG, "initBluetoothAdapter() called");

        if (mBluetoothAdapter == null) {
            if ((mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter()) == null) {
                Log.e(TAG, "initBluetoothAdapter(): bluetooth is not supported on this hardware platform");
                return false;
            } else {
                Log.d(TAG, "initBluetoothAdapter(): bluetooth is supported on this hardware platform");
            }
        } else if (!mBluetoothAdapter.isEnabled()) {
            Log.e(TAG, "initBluetoothAdapter(): bluetooth is not enabled");
            return false;
        }
        return true;
    }

    // Get BluetoothLeScanner object.
    // If it already done, return immediately true.
    private static synchronized boolean initScanner() {
        Log.d(TAG, "initScanner() called");

        if (mBluetoothLeScanner == null) {
            if ((mBluetoothAdapter == null)
                    || (mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner()) == null) {
                Log.i(TAG, "initScanner(): hardware scanning initialization failed");
                return false;
            } else {
                Log.d(TAG, "initScanner(): hardware scanning initialization done");
                try {
                    mScanCallback = new Scanner(mAppContext);
                    mScanFilter = Scanner.buildScanFilter();
                    mScanSettings = Scanner.BuildScanSettings();
                } catch (NullPointerException e) {
                    Log.e(TAG, "initScanner() error: Scanner object allocation failed");
                    return false;
                }
            }
        }
        return true;
    }

    // Get BluetoothLeAdvertiser object.
    // If it already done, return immediately true.
    private static synchronized boolean initAdvertiser() {
        Log.d(TAG, "initAdvertiser() called");

        if (mBluetoothLeAdvertiser == null) {
            if ((mBluetoothAdapter == null)
                    || (mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser()) == null) {
                Log.i(TAG, "BleDriver constructor: hardware advertising initialization failed");
                return false;
            } else {
                mAdvertiseCallback = new Advertiser();
                mAdvertiseSettings = Advertiser.buildAdvertiseSettings();
                mAdvertiseData = Advertiser.buildAdvertiseData();
                Log.d(TAG, "BleDriver constructor: hardware advertising initialization done");
            }
        }
        return true;
    }

    // main initialization method
    private static synchronized boolean init() {
        mStateInit = false;
        if ((mAppContext != null) || initContext()) {
            mStateInit = true;
            if ((mBluetoothAdapter != null) || (mStateInit = initBluetoothAdapter())) {
                if (mBluetoothLeScanner == null) {
                    initScanner();
                }
                if (mBluetoothLeAdvertiser == null) {
                    initAdvertiser();
                }

                // Setup context dependant objects
                try {
                    PeerManager.setContext(mAppContext);
                    mGattServer = new GattServer(mAppContext);
                    mGattServerCallback = new GattServerCallback(mAppContext, mGattServer);
                } catch (NullPointerException e) {
                    Log.e(TAG, "init(): object creation failed");
                    mStateInit = false;
                }
            }
        }
        return (mStateInit);
    }

    // Singleton method
    public static BleDriver getInstance() {
        if (mBleDriver == null) {
            synchronized (BleDriver.class) {
                if (mBleDriver == null) mBleDriver = new BleDriver();
            }
        }
        return mBleDriver;
    }

    public static boolean isStarted() {
        return mStateStarted;
    }

    public static boolean StartBleDriver(String localPeerID) {
        Log.d(TAG, "StartBleDriver() called");

        if (mStateStarted) {
            Log.i(TAG, "StartBleDriver(): BLE driver is already on");
            return true;
        }
        mStateStarted = false;
        if (mStateInit || init()) {
            if (!mGattServer.start(localPeerID, mGattServerCallback)) {
               return (mStateStarted = false);
            }
            Log.d(TAG, "StartBleDriver: init completed");
            mStateStarted = true;
        }
        return mStateStarted;
    }

    public static void StopBleDriver() {
        if (!mStateStarted) {
            Log.d(TAG, "driver is not started");
            return ;
        }
        setAdvertising(false);
        setScanning(false);
        DeviceManager.closeAllDeviceConnections();
        mGattServer.stop();
        mStateStarted = false;
    }

    // Interface to enable scanning
    // Android only provides a way to know if startScan has failed so we set the scanning state
    // to true and ScanCallback will set it to false in case of failure.
    public static void setScanning(boolean enable) {
        if ((mBluetoothLeScanner == null) || (mGattServer.getState() != GattServer.State.STARTED)) {
            Log.d(TAG, "setScanning(): abort");
            return ;
        }
        if (enable && !getScanningState()) {
            Log.d(TAG, "setScanning(): enabled");
            mBluetoothLeScanner.startScan(Collections.singletonList(mScanFilter), mScanSettings, mScanCallback);
            setScanningState(true);
        } else if (!enable && getScanningState()) {
            Log.d(TAG, "setScanning(): disabled");
            mBluetoothLeScanner.stopScan(mScanCallback);
            setScanningState(false);
        }
    }

    public static void setScanningState(boolean state) {
        mScanning = state;
    }

    // Return the status of the scanner
    // true: scanning is enabled
    // false: scanning is disabled
    public static boolean getScanningState() {
        return mScanning;
    }

    // Interface to enable scanning
    public static void setAdvertising(boolean enable) {
        if (mBluetoothLeAdvertiser == null) {
            Log.d(TAG, "setAdvertising(): abort");
            return ;
        }
        if (enable && !getAdvertisingState()) {
            Log.d(TAG, "setAdvertising(): enabled");
            mBluetoothLeAdvertiser.startAdvertising(mAdvertiseSettings, mAdvertiseData, mAdvertiseCallback);
            setAdvertisingState(true);
        } else if (!enable && getAdvertisingState()) {
            Log.d(TAG, "setAdvertising(): disabled");
            mBluetoothLeAdvertiser.stopAdvertising(mAdvertiseCallback);
            setAdvertisingState(false);
        }
    }

    public static void setAdvertisingState(boolean state) {
        mAdvertising = state;
    }

    // Return the status of the advertiser
    // true: advertising is enabled
    // false: advertising is disabled
    public static boolean getAdvertisingState() {
        return mAdvertising;
    }

    private static IntentFilter makeIntentFilter() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_PEER_FOUND);
        return filter;
    }

    public static boolean SendToPeer(String remotePID, byte[] payload) {
        Log.d(TAG, "SendToPeer() called");
        PeerDevice peerDevice;
        BluetoothGattCharacteristic writer;
        BluetoothGatt gatt;

        try {
            peerDevice = PeerManager.get(remotePID).getPeerDevice();
            writer = peerDevice.getWriterCharacteristic();
            writer.setValue(payload);
            gatt = peerDevice.getBluetoothGatt();
            gatt.writeCharacteristic(writer);
        } catch (NullPointerException e) {
            Log.e(TAG, "Failed to get BluetoothGatt for peer: " + remotePID);
            return false;
        }
        return true;
    }
}
