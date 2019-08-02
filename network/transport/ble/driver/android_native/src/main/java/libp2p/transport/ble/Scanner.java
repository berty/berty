package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;

import android.bluetooth.BluetoothDevice;

import java.util.List;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
class Scanner extends ScanCallback {
    private static final String TAG = "scan";

    static ScanSettings createScanSetting() {
        return new ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build();
    }

    static ScanFilter makeFilter() {
        return new ScanFilter.Builder()
                .setServiceUuid(BleManager.P_SERVICE_UUID)
                .build();
    }

    /**
     * Callback when a BLE advertisement has been found.
     *
     * @param callbackType Determines how this callback was triggered. Could be one of
     *                     {@link ScanSettings#CALLBACK_TYPE_ALL_MATCHES},
     *                     {@link ScanSettings#CALLBACK_TYPE_FIRST_MATCH} or
     *                     {@link ScanSettings#CALLBACK_TYPE_MATCH_LOST}
     * @param result       A Bluetooth LE scan result.
     */
    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        Log.v(TAG, "onScanResult() called with callbackType: " + callbackType + ", result: " + result);

        parseResult(result);
        super.onScanResult(callbackType, result);
    }

    /**
     * Callback when batch results are delivered.
     *
     * @param results List of scan results that are previously scanned.
     */
    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        Log.v(TAG, "onBatchScanResult() called with results: " + results);

        for (ScanResult result:results) {
            parseResult(result);
        }
        super.onBatchScanResults(results);
    }

    /**
     * Callback when scan could not be started.
     *
     * @param errorCode Error code (one of SCAN_FAILED_*) for scan failure.
     */
    @Override
    public void onScanFailed(int errorCode) {
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
        Log.e(TAG, "Start scanning failed with error: " + errorString);
        BleManager.setScanningState(scanning);

        super.onScanFailed(errorCode);
    }

    private static void parseResult(ScanResult result) {
        Log.v(TAG, "parseResult() called with device: " + result.getDevice());

        if (!BleManager.isScanning()) {
            Log.i(TAG, "Start scanning succeeded");
            BleManager.setScanningState(true);
        }

        BluetoothDevice device = result.getDevice();
        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (peerDevice == null) {
            Log.i(TAG, "parseResult() scanned a new device: " + device.getAddress());
            peerDevice = new PeerDevice(device);
            DeviceManager.addDeviceToIndex(peerDevice);

            // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
            peerDevice.asyncConnectionToDevice("parseResult()");
        }
    }
}
