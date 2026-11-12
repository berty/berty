package tech.berty.bertybridgeexpo.gobridge.bledriver;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.ParcelUuid;
import android.os.SystemClock;

import java.util.ArrayList;
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
    // The scan cycle is driven by a timer that ticks every SCAN_TICK_MS: the scanner runs for
    // SCAN_WINDOW_TICKS ticks, then is paused for SCAN_PAUSE_TICKS tick(s) (Android refuses more
    // than 5 scan starts per 30 seconds). Before, it was 12 s of scan and 12 s of pause.
    private static final long SCAN_TICK_MS = 4000;
    private static final int SCAN_WINDOW_TICKS = 3;
    private static final int SCAN_PAUSE_TICKS = 1;
    // minimum delay between two "connect now" requests (see maybeRequestEarlyProcessing)
    private static final long EARLY_MIN_INTERVAL_MS = 2000;
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
    private volatile int mScannerState;
    private boolean mProcessingResult = false;
    private volatile Timer mTimer;
    private TimerTask mTask;
    private volatile int mTicks = 0;
    private volatile long mLastEarlyMs = 0;

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
        // take the results found so far; the ones found while connecting stay for the next time
        List<ScanResult> results;
        synchronized (foundMap) {
            results = new ArrayList<>(foundMap.values());
            foundMap.clear();
        }

        setProcessingResult(true);
        CountDownLatch countDown = new CountDownLatch(results.size());
        for (ScanResult result : results) {
            parseResult(result, countDown);
        }
        try {
            countDown.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            mLogger.e(TAG, "processResult: interrupted exception", e);
        }
        setProcessingResult(false);
    }

    // Stop the scan and connect to the devices found. Always runs on the timer thread.
    private void pauseAndProcess(ScanCallback callback) {
        mLogger.d(TAG, "stop scanning");
        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
            mBluetoothLeScanner.stopScan(callback);
        } else {
            mLogger.e(TAG, "stop scanner in timer error: BT adapter not running");
        }
        setScannerState(SCANNER_STATE_PAUSED);
        mTicks = 0;

        // Processing scan result
        processResult();
    }

    private void resumeScanning(ScanCallback callback) {
        mLogger.d(TAG, "start scanning");
        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
            mBluetoothLeScanner.startScan(Collections.singletonList(mScanFilter), mScanSettings, callback);
        } else {
            mLogger.e(TAG, "start scanner in timer error: BT adapter not running");
        }
        setScannerState(SCANNER_STATE_ENABLED);
        mTicks = 0;
    }

    // Before, the devices found were only handled at the end of the scan window (every 24 s in
    // the worst case), so a peer that came back (e.g. after a Bluetooth off/on) was dialed up to
    // 24 s after it was visible. Now, as soon as a Berty device we would connect to is seen, the
    // scan is stopped and the connection is started on the timer thread (same thread as the
    // regular ticks, so both can't run at the same time).
    private void requestEarlyProcessing() {
        final Timer timer = mTimer;
        if (timer == null) {
            return;
        }
        final ScanCallback callback = this;
        try {
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    if (getScannerState() == SCANNER_STATE_ENABLED) {
                        mLogger.d(TAG, "Berty device found, connecting without waiting for the end of the scan window");
                        pauseAndProcess(callback);
                    }
                }
            }, 0);
        } catch (IllegalStateException e) {
            // timer cancelled by stop()
        }
    }

    // true if the scan result is a Berty device we would connect to as a client: has the Berty
    // service, has a greater ID than ours and is not connected yet (same rules as parseResult)
    private boolean isConnectCandidate(ScanResult result) {
        try {
            ScanRecord record = result.getScanRecord();
            if (record == null) {
                return false;
            }
            List<ParcelUuid> services = record.getServiceUuids();
            if (services == null || !services.contains(GattServer.P_SERVICE_UUID)) {
                return false;
            }

            String id = null;
            if (record.getDeviceName() != null && record.getDeviceName().length() > 0) {
                id = record.getDeviceName();
            } else {
                byte[] data = record.getServiceData(GattServer.P_SERVICE_UUID);
                if (data != null && data.length > 0) {
                    id = new String(data);
                }
            }
            String localId = mId;
            if (id == null || localId == null || localId.compareTo(id) >= 0) {
                return false;
            }

            PeerDevice peerDevice = mBleDriver.deviceManager().get(result.getDevice().getAddress());
            return peerDevice == null || peerDevice.isClientDisconnected();
        } catch (RuntimeException e) {
            return false;
        }
    }

    private void maybeRequestEarlyProcessing(ScanResult result) {
        if (mScannerState != SCANNER_STATE_ENABLED) {
            return;
        }
        long now = SystemClock.elapsedRealtime();
        if (now - mLastEarlyMs < EARLY_MIN_INTERVAL_MS) {
            return;
        }
        if (!isConnectCandidate(result)) {
            return;
        }
        mLastEarlyMs = now;
        requestEarlyProcessing();
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
        mTicks = 0;
        mTimer = new Timer();
        mTask = new TimerTask() {
            @Override
            public void run() {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    if (getScannerState() == SCANNER_STATE_ENABLED) {
                        mTicks++;
                        if (mTicks >= SCAN_WINDOW_TICKS) {
                            pauseAndProcess(callback);
                        }
                    } else if (!isProcessingResult()) {
                        mTicks++;
                        if (mTicks >= SCAN_PAUSE_TICKS) {
                            resumeScanning(callback);
                        }
                    }
                }
            }
        };

        mTimer.schedule(mTask, SCAN_TICK_MS, SCAN_TICK_MS);

        return true;
    }

    // disable scanning
    public void stop() {
        if (!isInit()) {
            mLogger.e(TAG, "stop: driver not init");
            return;
        }

        // Always stop the scan cycle first: the state can be DISABLED while the timer is alive
        // (pause phase of the cycle) and a timer left running would keep driving a scanner that
        // is no longer valid after the driver has been restarted.
        if (mTask != null) {
            mTask.cancel();
        }
        if (mTimer != null) {
            mTimer.cancel(); // also ends the timer thread
            mTimer.purge();
            mTimer = null;
        }

        if (getScannerState() == SCANNER_STATE_DISABLED) {
            mLogger.i(TAG, "stop: scanner not running");
            return;
        }

        mLogger.i(TAG, "stop scanning");
        if (mBluetoothAdapter.getState() == BluetoothAdapter.STATE_ON) {
            mBluetoothLeScanner.stopScan(this);
        } else {
            mLogger.e(TAG, "stop scanner error: BT adapter not running");
        }
        // always reset the state, even if Bluetooth is off (otherwise the scanner stays "enabled")
        setScannerState(SCANNER_STATE_DISABLED);
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
        synchronized (foundMap) {
            foundMap.put(result.getDevice().getAddress(), result);
        }
        maybeRequestEarlyProcessing(result);
        super.onScanResult(callbackType, result);
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        if (mLogger.showSensitiveData()) {
            mLogger.v(TAG, "onBatchScanResult() called with results: " + results);
        }

        for (ScanResult result : results) {
            synchronized (foundMap) {
                foundMap.put(result.getDevice().getAddress(), result);
            }
            maybeRequestEarlyProcessing(result);
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
