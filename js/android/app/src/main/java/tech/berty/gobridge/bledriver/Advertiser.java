package tech.berty.gobridge.bledriver;

import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.util.Log;

public class Advertiser extends AdvertiseCallback {
    private static final String TAG = "Advertiser";

    static AdvertiseData buildAdvertiseData() {
        return new AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceUuid(GattServer.P_SERVICE_UUID)
                .build();
    }

    static AdvertiseSettings buildAdvertiseSettings() {
        return new AdvertiseSettings.Builder()
                .setConnectable(true)
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setTimeout(0)
                .build();
    }

    @Override
    public void onStartFailure(int errorCode) {
        String errorString;
        boolean advertising = false;

        switch (errorCode) {
            case ADVERTISE_FAILED_ALREADY_STARTED: errorString = "ADVERTISE_FAILED_ALREADY_STARTED";
                advertising = true;
                break;

            case ADVERTISE_FAILED_DATA_TOO_LARGE: errorString = "ADVERTISE_FAILED_DATA_TOO_LARGE";
                break;

            case ADVERTISE_FAILED_TOO_MANY_ADVERTISERS: errorString = "ADVERTISE_FAILED_TOO_MANY_ADVERTISERS";
                break;

            case ADVERTISE_FAILED_INTERNAL_ERROR: errorString = "ADVERTISE_FAILED_INTERNAL_ERROR";
                break;

            case ADVERTISE_FAILED_FEATURE_UNSUPPORTED: errorString = "ADVERTISE_FAILED_FEATURE_UNSUPPORTED";
                break;

            default: errorString = "UNKNOWN ADVERTISE FAILURE (" + errorCode + ")";
                break;
        }
        Log.e(TAG, "onStartFailure: " + errorString);
        BleDriver.setAdvertisingState(advertising);
        super.onStartFailure(errorCode);
    }

    @Override
    public void onStartSuccess(AdvertiseSettings settingsInEffect) {
        Log.d(TAG, "onStartSuccess: advertising started");
        BleDriver.setAdvertisingState(true);
        super.onStartSuccess(settingsInEffect);
    }
}
