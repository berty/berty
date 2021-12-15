package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.ParcelUuid;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

// see https://stackoverflow.com/questions/27040086/onbatchscanresults-is-not-called-in-android-ble

public class Scanner extends ScanCallback {
    private static final String TAG = "bty.ble.Scanner";
    private final Logger mLogger;
    private final BleDriver mBleDriver;
    private static final int SCANNER_STATE_DISABLED = 0;
    private static final int SCANNER_STATE_ENABLED = 1;
    private static final int SCANNER_STATE_PAUSED = 2;
    // key is MAC address
    private static final HashMap<String, ScanResult> foundMap = new HashMap<>();
    private final Context mContext;
    private final BluetoothAdapter mBluetoothAdapter;
    private String mLocalPID;
    private String mId;
    private ScanFilter mScanFilter;
    private ScanSettings mScanSettings;
    private BluetoothLeScanner mBluetoothLeScanner;
    private boolean mInit;
    private int mScannerState;
    private boolean mProcessingResult = false;
    private Timer mTimer;
    private TimerTask mTask;

    public Scanner(Context context, BleDriver bleDriver, Logger logger, BluetoothAdapter bluetoothAdapter) {
        mContext = context;
        mBleDriver = bleDriver;
        mLogger = logger;
        mBluetoothAdapter = bluetoothAdapter;
        setInit(init());
    }

    // Init BluetoothLeScanner object.
    private synchronized boolean init() {

        if ((mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner()) == null) {
            mLogger.e(TAG, "init: hardware scanning initialization failed");
            return false;
        }
        mScanFilter = buildScanFilter();
        mScanSettings = BuildScanSettings();
        mLogger.i(TAG, "init: hardware scanning initialization done");
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
            //.setServiceUuid(GattServer.P_SERVICE_UUID)
            .build();
    }

    private synchronized boolean isProcessingResult() {
        return mProcessingResult;
    }

    private synchronized void setProcessingResult(boolean state) {
        mProcessingResult = state;
    }

    private synchronized void processResult() {
        ScanResult result;
        CountDownLatch countDown;

        setProcessingResult(true);
        countDown = new CountDownLatch(foundMap.size());
        for (Map.Entry<String, ScanResult> keySet : foundMap.entrySet()) {
            result = keySet.getValue();

            parseResult(result, countDown);
        }
        try {
            countDown.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            mLogger.e(TAG, "processResult: interrupted exception", e);
        }
        foundMap.clear();
        setProcessingResult(false);
    }

    // enable scanning
    public boolean start(String localPID) {
        if (!isInit()) {
            mLogger.e(TAG, "start: driver not init");
            return false;
        }
        if (getScannerState() == SCANNER_STATE_ENABLED) {
            mLogger.i(TAG, "start: scanner already running");
            mBluetoothLeScanner.stopScan(this);
            setScannerState(SCANNER_STATE_DISABLED);
        }

        mLogger.i(TAG, "start scanning");
        mLocalPID = localPID;
        mId = localPID.substring(localPID.length() - 4);
        mBluetoothLeScanner.startScan(Collections.singletonList(mScanFilter), mScanSettings, this);

        setScannerState(SCANNER_STATE_ENABLED);

        ScanCallback callback = this;
        mTimer = new Timer();
        mTask = new TimerTask() {
            @Override
            public void run() {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    if (getScannerState() == SCANNER_STATE_ENABLED) {
                        mLogger.d(TAG, "stop scanning");
                        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
                            mBluetoothLeScanner.stopScan(callback);
                        } else {
                            mLogger.e(TAG, "stop scanner in timer error: BT adapter not running");
                        }
                        setScannerState(SCANNER_STATE_PAUSED);

                        // Processing scan result
                        processResult();
                    } else {
                        if (!isProcessingResult()) {
                            mLogger.d(TAG, "start scanning");
                            if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
                                mBluetoothLeScanner.startScan(Collections.singletonList(mScanFilter), mScanSettings, callback);
                            } else {
                                mLogger.e(TAG, "start scanner in timer error: BT adapter not running");
                            }
                            setScannerState(SCANNER_STATE_ENABLED);
                        }
                    }
                }
            }
        };

        mTimer.schedule(mTask, 12000, 12000);

        return true;
    }

    // disable scanning
    public void stop() {
        if (!isInit()) {
            mLogger.e(TAG, "stop: driver not init");
            return;
        }

        if (getScannerState() == SCANNER_STATE_DISABLED) {
            mLogger.i(TAG, "stop: scanner not running");
            return;
        }

        mLogger.i(TAG, "stop scanning");
        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
            mBluetoothLeScanner.stopScan(this);
            setScannerState(SCANNER_STATE_DISABLED);
        } else {
            mLogger.e(TAG, "stop scanner error: BT adapter not running");
        }
        mTask.cancel();
        mTimer.purge();
        mTimer = null;
    }

    // Return the status of the scanner
    // true: scanning is enabled
    // false: scanning is disabled
    public synchronized int getScannerState() {
        return mScannerState;
    }

    private synchronized void setScannerState(int state) {
        mScannerState = state;
    }

    @Override
    public void onScanFailed(int errorCode) {
        super.onScanFailed(errorCode);

        String errorString;
        int state = SCANNER_STATE_DISABLED;

        switch (errorCode) {
            case SCAN_FAILED_ALREADY_STARTED:
                errorString = "SCAN_FAILED_ALREADY_STARTED";
                state = SCANNER_STATE_ENABLED;
                break;

            case SCAN_FAILED_APPLICATION_REGISTRATION_FAILED:
                errorString = "SCAN_FAILED_APPLICATION_REGISTRATION_FAILED";
                break;

            case SCAN_FAILED_INTERNAL_ERROR:
                errorString = "SCAN_FAILED_INTERNAL_ERROR";
                break;

            case SCAN_FAILED_FEATURE_UNSUPPORTED:
                errorString = "SCAN_FAILED_FEATURE_UNSUPPORTED";
                break;

            default:
                errorString = "UNKNOWN SCAN FAILURE (" + errorCode + ")";
                break;
        }
        mLogger.e(TAG, "onScanFailed: " + errorString);
        setScannerState(state);
    }

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
//        mLogger.v(TAG, "onScanResult called with result: " + result);
        foundMap.put(result.getDevice().getAddress(), result);
        super.onScanResult(callbackType, result);
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        if (mLogger.showSensitiveData()) {
            mLogger.v(TAG, "onBatchScanResult() called with results: " + results);
        }

        for (ScanResult result : results) {
            foundMap.put(result.getDevice().getAddress(), result);
        }
        super.onBatchScanResults(results);
    }

    private synchronized void parseResult(ScanResult result, CountDownLatch countDown) {
        BluetoothDevice device = result.getDevice();

        List<ParcelUuid> services;
        if ((services = result.getScanRecord().getServiceUuids()) == null || !services.contains(GattServer.P_SERVICE_UUID)) {
            // very verbose log
//            mLogger.v(TAG, "parseResult: service not found, device=" + device.getAddress());
            countDown.countDown();
            return;
        }

        String id;
        if (result.getScanRecord().getDeviceName() != null && result.getScanRecord().getDeviceName().length() > 0) {
            // for ios
            id = result.getScanRecord().getDeviceName();
        } else if (result.getScanRecord().getServiceData(GattServer.P_SERVICE_UUID) != null && result.getScanRecord().getServiceData(GattServer.P_SERVICE_UUID).length > 0) {
            // for android
            id = new String(result.getScanRecord().getServiceData(GattServer.P_SERVICE_UUID));
        } else {
            mLogger.e(TAG, "parseResult error: failed to get ID for device=" + mLogger.sensitiveObject(device.getAddress()));
            countDown.countDown();
            return;
        }

        // only lower id can be client
        if (mId.compareTo(id) >= 0) {
            mLogger.v(TAG, String.format("parseResult: device=%s id=%s: greater ID, cancel client connection", mLogger.sensitiveObject(device.getAddress()), mLogger.sensitiveObject(id)));
            countDown.countDown();
            return;
        }

        PeerDevice peerDevice = mBleDriver.deviceManager().get(device.getAddress());
        if (peerDevice != null) {
            if (!peerDevice.isClientDisconnected()) {
                mLogger.v(TAG, String.format("parseResult: client is already connected, device=%s id=%s", mLogger.sensitiveObject(device.getAddress()), mLogger.sensitiveObject(id)));
                countDown.countDown();
                return;
            } else {
                PeerDevice tmpDevice = mBleDriver.deviceManager().getById(id);
                if (tmpDevice != null && !tmpDevice.isClientDisconnected()) {
                    mLogger.v(TAG, String.format("parseResult: client is already connected with another device object, result device=%s, other device=%s, id=%s", mLogger.sensitiveObject(result.getDevice().getAddress()), mLogger.sensitiveObject(tmpDevice.getMACAddress()), mLogger.sensitiveObject(id)));
                    countDown.countDown();
                    return;
                }
            }
        } else {
            peerDevice = mBleDriver.deviceManager().getById(id);
            if (peerDevice != null && !peerDevice.isClientDisconnected()) {
                mLogger.v(TAG, String.format("parseResult: client is already connected with another device object, result device=%s, other device=%s, id=%s", mLogger.sensitiveObject(result.getDevice().getAddress()), mLogger.sensitiveObject(peerDevice.getMACAddress()), mLogger.sensitiveObject(id)));
                countDown.countDown();
                return;
            } else {
                mLogger.i(TAG, String.format("parseResult: scanned a new device=%s id=%s", mLogger.sensitiveObject(device.getAddress()), mLogger.sensitiveObject(id)));
                peerDevice = new PeerDevice(mContext, mBleDriver, mLogger, device, mLocalPID, true);
                mBleDriver.deviceManager().put(peerDevice.getMACAddress(), peerDevice);
            }
        }

        peerDevice.setId(id);

        mLogger.i(TAG, String.format("parseResult: proceed connection to device=%s id=%s", mLogger.sensitiveObject(device.getAddress()), mLogger.sensitiveObject(id)));
        // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
        peerDevice.connectToDevice(false, countDown);
    }
}
