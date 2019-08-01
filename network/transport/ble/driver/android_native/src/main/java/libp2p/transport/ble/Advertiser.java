package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
class Advertiser extends AdvertiseCallback {
    private static final String TAG = "advertise";

    static AdvertiseData buildAdvertiseData() {
        return new AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceUuid(BleManager.P_SERVICE_UUID)
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

    /**
     * Callback triggered in response to {@link BluetoothLeAdvertiser#startAdvertising} indicating
     * that the advertising has been started successfully.
     *
     * @param settingsInEffect The actual settings used for advertising, which may be different from
     *                         what has been requested.
     */
    @Override
    public void onStartSuccess(AdvertiseSettings settingsInEffect) {
        Log.i(TAG, "Start advertising succeeded with settings: " + settingsInEffect);
        BleManager.setAdvertisingState(true);

        super.onStartSuccess(settingsInEffect);
    }

    /**
     * Callback when advertising could not be started.
     *
     * @param errorCode Error code (see ADVERTISE_FAILED_* constants) for advertising start
     *                  failures.
     */
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
        Log.e(TAG, "Start advertising failed with error: " + errorString);
        BleManager.setAdvertisingState(advertising);

        super.onStartFailure(errorCode);
    }
}
