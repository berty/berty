package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.util.Log;

import java.util.List;

// TODO : implementation of onBatchScanResults to improve performances
// see https://stackoverflow.com/questions/27040086/onbatchscanresults-is-not-called-in-android-ble

public class Scanner extends ScanCallback {
    private static final String TAG = "Scanner";

    private Context mContext;

    public Scanner (Context context) {
        mContext = context;
    }

    static ScanSettings BuildScanSettings() {
        return new ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build();
    }

    static ScanFilter buildScanFilter() {
        return new ScanFilter.Builder()
                .setServiceUuid(GattServer.P_SERVICE_UUID)
                .build();
    }

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
        Log.e(TAG, "onScanFailed: " + errorString);
        BleDriver.setScanningState(scanning);
        super.onScanFailed(errorCode);
    }

    @Override
    public void onScanResult(int callbackType, ScanResult result) {
        Log.d(TAG, "onScanResult called with result: " + result);
        parseResult(result);
        super.onScanResult(callbackType, result);
    }

    @Override
    public void onBatchScanResults(List<ScanResult> results) {
        Log.v(TAG, "onBatchScanResult() called with results: " + results);

        for (ScanResult result:results) {
            parseResult(result);
        }
        super.onBatchScanResults(results);
    }

    private void parseResult(ScanResult result) {
        Log.v(TAG, "parseResult() called with device: " + result.getDevice());

        BluetoothDevice device = result.getDevice();
        PeerDevice peerDevice = DeviceManager.get(device.getAddress());

        if (peerDevice == null) {
            Log.i(TAG, "parseResult() scanned a new device: " + device.getAddress());
            peerDevice = new PeerDevice(mContext, device);
            DeviceManager.addDevice(peerDevice);
        }
        if (peerDevice.isDisconnected()) {
            // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
            peerDevice.setState(PeerDevice.CONNECTION_STATE.CONNECTING);
            peerDevice.asyncConnectionToDevice();
        }
    }
}
