package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.util.Log;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

// API level 21
public class Advertiser extends AdvertiseCallback {
    private static final String TAG = "bty.ble.Advertiser";

    private AdvertiseSettings mAdvertiseSettings;
    private AdvertiseData mAdvertiseData;
    private BluetoothLeAdvertiser mBluetoothLeAdvertiser;
    private boolean mInit;
    private boolean mAdvertising;

    private final BluetoothAdapter mBluetoothAdapter;
    private CountDownLatch mStartedLock;
    private Lock mLock = new ReentrantLock();

    public Advertiser(BluetoothAdapter bluetoothAdapter) {
        mBluetoothAdapter = bluetoothAdapter;
        setInit(init());
    }

    // Init BluetoothLeAdvertiser object.
    private boolean init() {

        if ((mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser()) == null) {
            Log.e(TAG, "init: hardware advertising initialization failed");
            return false;
        }
        mAdvertiseSettings = buildAdvertiseSettings();
        mAdvertiseData = buildAdvertiseData();
        Log.i(TAG, "init: hardware advertising initialization done");
        return true;
    }

    public boolean isInit() {
        return mInit;
    }

    private void setInit(boolean state) {
        mInit = state;
    }

    private AdvertiseData buildAdvertiseData() {
        return new AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(GattServer.P_SERVICE_UUID)
            .build();
    }

    private AdvertiseSettings buildAdvertiseSettings() {
        return new AdvertiseSettings.Builder()
            .setConnectable(true)
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
            .setTimeout(0)
            .build();
    }

    // enable scanning
    public boolean start() {
        if (!isInit()) {
            Log.e(TAG, "start: driver not init");
            return false;
        }
        if (!isAdvertising()) {
            Log.i(TAG, "starting advertising");

            mStartedLock = new CountDownLatch(1);
            mBluetoothLeAdvertiser.startAdvertising(mAdvertiseSettings, mAdvertiseData, this);
            try {
                // Need to set a max time because AVD hangs without that
                if (mStartedLock.await(1000, TimeUnit.MILLISECONDS) == false) {
                    return false;
                }
            } catch (InterruptedException e) {
                Log.e(TAG, "advertising: interrupted exception", e);
            }
            // advertising status is updated by callback
            return isAdvertising();
        }
        return false;
    }

    // disable scanning
    public void stop() {
        if (!isInit()) {
            Log.e(TAG, "stop: driver not init");
            return ;
        }

        if (isAdvertising()) {
            Log.i(TAG, "stopping advertising");
            mBluetoothLeAdvertiser.stopAdvertising(this);
            setAdvertisingState(false);
        }
    }

    public void setAdvertisingState(boolean state) {
        mLock.lock();
        try {
            mAdvertising = state;
        } finally {
            mLock.unlock();
        }
    }

    public boolean isAdvertising() {
        boolean advertising;
        mLock.lock();
        try {
            advertising = mAdvertising;
        } finally {
            mLock.unlock();
        }
        return advertising;
    }

    @Override
    public void onStartFailure(int errorCode) {
        super.onStartFailure(errorCode);

        Log.d(TAG, "onStartFailure called");
        String errorString;
        boolean state = false;

        switch (errorCode) {
            case ADVERTISE_FAILED_ALREADY_STARTED: errorString = "ADVERTISE_FAILED_ALREADY_STARTED";
                state = true;
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
        setAdvertisingState(state);
        mStartedLock.countDown();
    }

    @Override
    public void onStartSuccess(AdvertiseSettings settingsInEffect) {
        super.onStartSuccess(settingsInEffect);
        Log.d(TAG, "onStartSuccess called");

        setAdvertisingState(true);
        mStartedLock.countDown();
    }
}
