package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.util.Log;

import java.util.Collections;
import java.util.List;

// see https://stackoverflow.com/questions/27040086/onbatchscanresults-is-not-called-in-android-ble

public class Scanner extends ScanCallback {
    private static final String TAG = "bty.ble.Scanner";

    private final Context mContext;
    private final BluetoothAdapter mBluetoothAdapter;

    private String mPeerID;

    private ScanFilter mScanFilter;
    private ScanSettings mScanSettings;
    private BluetoothLeScanner mBluetoothLeScanner;
    private boolean mInit;
    private boolean mScanning;

    public Scanner (Context context, BluetoothAdapter bluetoothAdapter) {
        mContext = context;
        mBluetoothAdapter = bluetoothAdapter;
        setInit(init());
    }

    // Init BluetoothLeScanner object.
    private synchronized boolean init() {

        if ((mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner()) == null) {
            Log.e(TAG, "init: hardware scanning initialization failed");
            return false;
        }
        mScanFilter = buildScanFilter();
        mScanSettings = BuildScanSettings();
        Log.i(TAG, "init: hardware scanning initialization done");
        return true;
    }

    public boolean isInit() {
        return mInit;
    }

    private void setInit(boolean state) {
        mInit = state;
    }

    private ScanSettings BuildScanSettings() {
        return new ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_POWER)
            .setNumOfMatches(ScanSettings.MATCH_NUM_ONE_ADVERTISEMENT)
            .build();
    }

    private ScanFilter buildScanFilter() {
        return new ScanFilter.Builder()
            .setServiceUuid(GattServer.P_SERVICE_UUID)
            .build();
    }

    // enable scanning
    public boolean start(String peerID) {
        if (!isInit()) {
            Log.e(TAG, "start: driver not init");
            return false;
        }
        if (!getScanningState()) {
            Log.i(TAG, "start scanning");
            mPeerID = peerID;
            mBluetoothLeScanner.startScan(Collections.singletonList(mScanFilter), mScanSettings, this);
            setScanningState(true);
        }
        setScanningState(true);
        return true;
    }

    // disable scanning
    public void stop() {
        if (!isInit()) {
            Log.e(TAG, "stop: driver not init");
            return ;
        }

        if (getScanningState()) {
            Log.i(TAG, "stop scanning");
            mBluetoothLeScanner.stopScan(this);
            setScanningState(false);
        }
    }

    private void setScanningState(boolean state) {
        mScanning = state;
    }

    // Return the status of the scanner
    // true: scanning is enabled
    // false: scanning is disabled
    public boolean getScanningState() {
        return mScanning;
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);

        String errorString;
        boolean scanning = false;

        switch(errorCode) {
            case SCAN_FAILED_ALREADY_STARTED: errorString = "SCAN_FAILED_ALREADY_STARTED";
                scanning = true;
                break;

            case SCAN_FAILED_APPLICATION_REGISTRATION_FAILED: errorString = "SCAN_FAILED_APPLICATION_REGISTRATION_FAILED";
                break;

            case SCAN_FAILED_INTERNAL_ERROR: errorString = "SCAN_FAILED_INTERNAL_ERROR";
                break;

            case SCAN_FAILED_FEATURE_UNSUPPORTED: errorString = "SCAN_FAILED_FEATURE_UNSUPPORTED";
                break;

            default: errorString = "UNKNOWN SCAN FAILURE (" + errorCode + ")";
                break;
        }
        Log.e(TAG, "onScanFailed: " + errorString);
        setScanningState(scanning);
    }

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        Log.v(TAG, "onScanResult called with result: " + result);
        parseResult(result);
        super.onScanResult(callbackType, result);
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        Log.d(TAG, "onBatchScanResult() called with results: " + results);

        for (ScanResult result:results) {
            parseResult(result);
        }
        super.onBatchScanResults(results);
    }

    private synchronized void parseResult(ScanResult result) {
        BluetoothDevice device = result.getDevice();
        PeerDevice peerDevice = DeviceManager.get(device.getAddress());

        if (peerDevice == null) {
            Log.i(TAG, "parseResult() scanned a new device: " + device.getAddress());
            peerDevice = new PeerDevice(mContext, device, mPeerID);
            DeviceManager.addDevice(peerDevice);
        }
        // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
        peerDevice.connectToDevice(false);
        /*stop();
        BleDriver.mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                start(mPeerID);
            }
        }, 10000);*/
    }
}
