package libp2p.transport.ble;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.ParcelUuid;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.os.Build;
import android.annotation.TargetApi;
import android.support.annotation.Nullable;

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
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.content.Context.BLUETOOTH_SERVICE;

import java.util.Collections;
import java.util.UUID;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public final class BleManager {
    private static final String TAG = "ble_manager";

    // TODO: Get rid of this and make a proper context setter
    // For RN see: https://facebook.github.io/react-native/docs/native-modules-android
    private static ActivityAndContextGetter activityAndContextGetter;
    private static Object reactContext;

    static Context getContext() {
        return activityAndContextGetter.getApplicationContext();
    }

    static Context getActivity() {
        return activityAndContextGetter.getCurrentActivity();
    }

    public interface ActivityAndContextGetter {
        @Nullable
        Activity getCurrentActivity();

        @Nullable
        Context getApplicationContext();
    }

    public static void setReactGetter(Object rActivityAndContextGetter, Object rReactContext) {
        Log.d(TAG, "setmReactContext called with activityGetter: " + rActivityAndContextGetter + ", reactContext: " + reactContext);

        activityAndContextGetter = (ActivityAndContextGetter)rActivityAndContextGetter;
        reactContext = rReactContext;
    }
    /////////////////////////////////////////////////////////////////

    private static boolean bluetoothReady;
    private static boolean advertising;
    private static boolean scanning;

    private static final GattServer mGattServerCallback = new GattServer();
    private static final Advertiser mAdvertisingCallback = new Advertiser();
    private static final GattClient mGattCallback = new GattClient();
    private static final Scanner mScanCallback = new Scanner();

    private static final BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    private static final BluetoothLeAdvertiser mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser();
    private static final BluetoothLeScanner mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner();

    private static final int BLUETOOTH_ENABLE_REQUEST = 42;
    private static final int LOCATION_PERMISSION_REQUEST = 24;

    static final UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D6665");
    static final UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C");
    static final UUID MA_UUID = UUID.fromString("9B827770-DC72-4C55-B8AE-0870C7AC15A8");
    static final UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B3");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);

    private static final BluetoothGattService mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
    private static final BluetoothGattCharacteristic maCharacteristic = new BluetoothGattCharacteristic(MA_UUID, PROPERTY_WRITE, PERMISSION_WRITE);
    private static final BluetoothGattCharacteristic peerIDCharacteristic = new BluetoothGattCharacteristic(PEER_ID_UUID, PROPERTY_WRITE, PERMISSION_WRITE);
    private static final BluetoothGattCharacteristic writerCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);

    // Setters
    static void setAdvertisingState(boolean state) {
        Log.d(TAG, "setAdvertisingState() called with state: " + state);

        advertising = state;
    }

    static void setScanningState(boolean state) {
        Log.d(TAG, "setScanningState() called with state: " + state);

        scanning = state;
    }

    // Getters
    static String getMultiAddr() { return maCharacteristic.getStringValue(0); }

    static String getPeerID() { return peerIDCharacteristic.getStringValue(0); }

    static GattClient getGattCallback() { return mGattCallback; }


    // State related
    private static boolean isBluetoothReady() {
        if (!bluetoothReady) {
            Log.d(TAG, "Bluetooth Service not initialized yet");
        }

        return bluetoothReady;
    }

    private static boolean isAdvertising() {
        if (!advertising) {
            Log.d(TAG, "Not currently advertising");
        }

        return advertising;
    }

    static boolean isScanning() {
        if (!scanning) {
            Log.d(TAG, "Not currently scanning");
        }

        return scanning;
    }


    public static boolean startBleDriver(String multiAddr, String peerID) {
        Log.d(TAG, "startBleDriver() called");
        Activity activity = activityAndContextGetter.getCurrentActivity();
        Context context = activityAndContextGetter.getApplicationContext();

        // Set MultiAddr and PeerID characteristics
        maCharacteristic.setValue(multiAddr);
        peerIDCharacteristic.setValue(peerID);

        try {
            // Turn on Bluetooth adapter
            if (!mBluetoothAdapter.isEnabled()) {
                Log.d(TAG, "startBleDriver() Bluetooth adapter is off: turning it on");

                Intent enableBluetoothIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                activity.startActivityForResult(enableBluetoothIntent, BLUETOOTH_ENABLE_REQUEST);

                // TODO: Check result of BLUETOOTH_ENABLE_REQUEST
                // See: https://facebook.github.io/react-native/docs/native-modules-android#getting-activity-result-from-startactivityforresult
            }

            // Check Location permission (required by BLE)
            if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "startBleDriver() location permission isn't granted: requesting it");

                ActivityCompat.requestPermissions(activity, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST);
                // TODO: Check result of ACCESS_FINE_LOCATION
                // See: https://developer.android.com/training/permissions/requesting#handle-response
            }

            BluetoothManager bleManager = (BluetoothManager)context.getSystemService(BLUETOOTH_SERVICE);
            if (bleManager == null) {
                Log.e(TAG, "startBleDriver() failed: BLE Manager is null");
                return false;
            }

            BluetoothGattService libp2pService = createService();
            Log.d(TAG, "startBleDriver() service created: " + libp2pService);

            BluetoothGattServer gattServer = bleManager.openGattServer(context, mGattServerCallback);
            gattServer.addService(libp2pService);
            mGattServerCallback.setBluetoothGattServer(gattServer);

            bluetoothReady = true;

            if (startScanning() && startAdvertising()) {
                Log.i(TAG, "startBleDriver() succeeded");
                return true;
            }
        } catch (Exception e) {
            Log.e(TAG, "startBleDriver() failed: " + e.getMessage());
        }

        return false;
    }

    public static boolean stopBleDriver() {
        Log.d(TAG, "stopBleDriver() called");

        if (!isBluetoothReady()) {
            Log.w(TAG, "stopBleDriver() canceled");
            return false;
        }

        if ((scanning && !stopScanning()) || (advertising && !stopAdvertising()))
            return false;

        mGattServerCallback.closeGattServer();

        bluetoothReady = false;

        return true;
    }

    private static BluetoothGattService createService() {
        Log.d(TAG, "createService() called");

        if (!mService.addCharacteristic(maCharacteristic) ||
            !mService.addCharacteristic(peerIDCharacteristic) ||
            !mService.addCharacteristic(writerCharacteristic)) {
            Log.e(TAG, "Characteristic adding failed");
        }

        return mService;
    }


    // Advertise related
    private static boolean startAdvertising() {
        Log.d(TAG, "startAdvertising() called");

        if (!isBluetoothReady()) {
            Log.w(TAG, "startAdvertising() canceled");
            return false;
        }

        AdvertiseSettings settings = Advertiser.buildAdvertiseSettings();
        AdvertiseData data = Advertiser.buildAdvertiseData();

        mBluetoothLeAdvertiser.startAdvertising(settings, data, mAdvertisingCallback);

        return true;
    }

    private static boolean stopAdvertising() {
        Log.d(TAG, "stopAdvertising() called");

        if (!isBluetoothReady() || !isAdvertising()) {
            Log.w(TAG, "stopAdvertising() canceled");
            return false;
        }

        mBluetoothLeAdvertiser.stopAdvertising(mAdvertisingCallback);
        setAdvertisingState(false);

        return true;
    }


    // Scan related
    private static boolean startScanning() {
        Log.d(TAG, "startScanning() called");

        if (!isBluetoothReady()) {
            Log.w(TAG, "startScanning() canceled");
            return false;
        }

        ScanSettings settings = Scanner.createScanSetting();
        Log.d(TAG, "Scan settings: " + settings);

        ScanFilter filter = Scanner.makeFilter();
        Log.d(TAG, "Scan filter: " + filter);

        mBluetoothLeScanner.startScan(Collections.singletonList(filter), settings, mScanCallback);

        return true;
    }

    private static boolean stopScanning() {
        Log.d(TAG, "stopScanning() called");

        if (!isBluetoothReady() || !isScanning()) {
            Log.w(TAG, "stopScanning() canceled");
            return false;
        }

        mBluetoothLeScanner.stopScan(mScanCallback);
        setScanningState(false);

        return true;
    }
}
