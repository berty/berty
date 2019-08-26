package libp2p.transport.ble;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.ParcelUuid;

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

import java.util.Collections;
import java.util.UUID;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class BleDriver {
    private BleDriver() {} // Equivalent to a static class in Java

    private static final String TAG = "ble_driver";

    private static final GattServer mGattServerCallback = new GattServer();
    private static final Advertiser mAdvertisingCallback = new Advertiser();
    private static final GattClient mGattCallback = new GattClient();
    private static final Scanner mScanCallback = new Scanner();

    private static BluetoothAdapter mBluetoothAdapter;
    private static BluetoothLeAdvertiser mBluetoothLeAdvertiser;
    private static BluetoothLeScanner mBluetoothLeScanner;

    static final UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D668D");
    static final UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B5");
    static final UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1B");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);

    private static final BluetoothGattService mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
    private static final BluetoothGattCharacteristic peerIDCharacteristic = new BluetoothGattCharacteristic(PEER_ID_UUID, PROPERTY_READ, PERMISSION_READ);
    private static final BluetoothGattCharacteristic writerCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);

    private static boolean advertising;
    private static boolean scanning;
    private static final StateLock driverEnabled = new StateLock();
    private static final BroadcastReceiver bluetoothStateWatcher = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, -1);
            Log.d(TAG, "onReceive() called with Bluetooth state: " + Log.bluetoothAdapterStateToString(state));

            if (state == BluetoothAdapter.STATE_ON) {
                BleDriver.enable();
            } else if (state == BluetoothAdapter.STATE_OFF) {
                BleDriver.disable();
            }
        }
    };

    static BroadcastReceiver getBluetoothStateWatcher() { return bluetoothStateWatcher; }
    static boolean isDriverEnabled() { return driverEnabled.getState(); }

    static void setLocalPeerID(String localPeerID) { peerIDCharacteristic.setValue(localPeerID); }
    static String getLocalPeerID() { return peerIDCharacteristic.getStringValue(0); }

    static GattClient getGattCallback() { return mGattCallback; }
    static GattServer getGattServerCallback() { return mGattServerCallback; }

    private static void enable() {
        Log.i(TAG, "enableDriver() called");

        synchronized (driverEnabled) {
            if (!driverEnabled.getState()) {
                try {
                    // If we can't get the advertiser or scanner, it's probably because this
                    // device isn't compatible with BLE. Unfortunately, we can't check that
                    // until the adapter is turned on.
                    mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
                    mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser();
                    mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner();

                    if (mBluetoothLeAdvertiser != null || mBluetoothLeScanner != null) {
                        if (setupService()) {
                            startScanning();
                            startAdvertising();
                            driverEnabled.setState(true);
                            Log.i(TAG, "enableDriver() succeeded");
                        } else {
                            Log.e(TAG, "enableDriver() failed: can't setup service");
                        }
                    } else {
                        Log.e(TAG, "enableDriver() failed: can't get Bluetooth advertiser / scanner; this device may not be compatible with BLE");
                    }
                } catch (Exception e) {
                    Log.e(TAG, "enableDriver() failed: " + e.getMessage());
                }
            } else {
                Log.w(TAG, "enableDriver() skipped: already enabled");
            }
        }
    }

    private static void disable() {
        Log.i(TAG, "disableDriver() called");

        synchronized (driverEnabled) {
            if (driverEnabled.getState()) {
                stopScanning();
                stopAdvertising();
                try { mGattServerCallback.closeGattServer(); } catch(Exception e) { /* ignore */ }
                try { DeviceManager.disconnectFromAllDevices(); } catch (Exception e) { /* ignore */ }
                driverEnabled.setState(false);
                Log.i(TAG, "disableDriver() succeeded");
            } else{
                Log.w(TAG, "disableDriver() skipped: driver already disabled");
            }
        }
    }

    private static boolean setupService() {
        Log.d(TAG, "setupService() called");

        if ((mService.getCharacteristic(PEER_ID_UUID) == null && !mService.addCharacteristic(peerIDCharacteristic)) ||
            (mService.getCharacteristic(WRITER_UUID) == null && !mService.addCharacteristic(writerCharacteristic))) {
            Log.e(TAG, "setupService() failed: can't add characteristics to service");
            return false;
        }

        BluetoothManager bluetoothManager = (BluetoothManager) GoToJava.getContext().getSystemService(BLUETOOTH_SERVICE);
        BluetoothGattServer gattServer = bluetoothManager.openGattServer(GoToJava.getContext(), mGattServerCallback);
        gattServer.addService(mService);
        mGattServerCallback.setBluetoothGattServer(gattServer);

        return true;
    }

    // Scanning and advertising related
    private static void startScanning() {
        Log.d(TAG, "startScanning() called");

        if (!scanning && mBluetoothAdapter.isEnabled()) {
            ScanSettings settings = Scanner.createScanSetting();
            ScanFilter filter = Scanner.makeFilter();

            // Android only provides a way to know if startScan has failed so we set the scanning state
            // to true and ScanCallback will set it to false in case of failure.
            setScanningState(true);
            mBluetoothLeScanner.startScan(Collections.singletonList(filter), settings, mScanCallback);
        }
    }

    private static void startAdvertising() {
        Log.d(TAG, "startAdvertising() called");

        if (!advertising && mBluetoothAdapter.isEnabled()) {
            AdvertiseSettings settings = Advertiser.buildAdvertiseSettings();
            AdvertiseData data = Advertiser.buildAdvertiseData();

            mBluetoothLeAdvertiser.startAdvertising(settings, data, mAdvertisingCallback);
        }
    }

    static void stopScanning() {
        Log.d(TAG, "stopScanning() called");

        if (scanning && mBluetoothAdapter.isEnabled()) {
            mBluetoothLeScanner.stopScan(mScanCallback);
        }
        setScanningState(false);
    }

    static void stopAdvertising() {
        Log.d(TAG, "stopAdvertising() called");

        if (advertising && mBluetoothAdapter.isEnabled()) {
            mBluetoothLeAdvertiser.stopAdvertising(mAdvertisingCallback);
        }
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
