package chat.berty.ble;

import android.app.Activity;
import android.arch.core.util.Function;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.ParcelUuid;
import android.support.annotation.Nullable;
import android.util.Log;

import java.util.UUID;

import android.bluetooth.BluetoothGatt;

import static android.bluetooth.BluetoothGattCharacteristic.*;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.content.Context.BLUETOOTH_SERVICE;

public class Manager {
    private static Manager instance = null;

    private Context mContext;

    private ActivityGetter mReactContext;

    final static int BLUETOOTH_ENABLE_REQUEST = 1;

    protected UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D6664");

    protected UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C");

    protected UUID CLOSER_UUID = UUID.fromString("AD127A46-D065-4D72-B15A-EB2B3DA20561");

    protected UUID IS_READY_UUID = UUID.fromString("D27DE0B5-2170-4C59-9C0B-750C760C74E6");

    protected UUID MA_UUID = UUID.fromString("9B827770-DC72-4C55-B8AE-0870C7AC15A8");

    protected UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B3");

    protected UUID ACCEPT_UUID = UUID.fromString("6F110ECA-9FCC-4BB3-AB45-6F13565E2E34");

    public static String TAG = "chat.berty.ble.Manager";

    protected BluetoothAdapter mBluetoothAdapter;

    protected BluetoothGattServer mBluetoothGattServer;

    protected BluetoothLeAdvertiser mBluetoothLeAdvertiser;

    protected BluetoothGattService mService;

    protected BluetoothGattCharacteristic acceptCharacteristic;
    protected BluetoothGattCharacteristic maCharacteristic;
    protected BluetoothGattCharacteristic peerIDCharacteristic;
    protected BluetoothGattCharacteristic writerCharacteristic;
    protected BluetoothGattCharacteristic isRdyCharacteristic;
    protected BluetoothGattCharacteristic closerCharacteristic;

    public interface ActivityGetter {
        Activity getCurrentActivity();
    }

    private Manager() {
        super();
        Log.e(TAG, "BLEManager init");
    }

    public void setmContext(Context ctx) {
        Log.e(TAG, "BLEManager context set");
        mContext = ctx;
    }

    public void setmReactContext(Object rCtx) {
        Log.e(TAG, "BLEManager ReactContext set");
        mReactContext = (ActivityGetter)rCtx;
    }

    public static Manager getInstance() {
        if (instance == null) {
            synchronized (Manager.class) {
                if (instance == null) {
                    instance = new Manager();
                    instance.mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
                }
            }
        }

        return instance;
    }

    public static AdvertiseSettings createAdvSettings(boolean connectable, int timeoutMillis) {
        AdvertiseSettings.Builder builder = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            builder = new AdvertiseSettings.Builder();
            builder.setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY);
            builder.setConnectable(connectable);
            builder.setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH);
            builder.setTimeout(timeoutMillis);
            return builder.build();
        }

        return null;
    }

    public AdvertiseData makeAdvertiseData() {
        ParcelUuid pUuid = new ParcelUuid(SERVICE_UUID);
        AdvertiseData.Builder builder = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder = new AdvertiseData.Builder()
                    .setIncludeDeviceName(true)
                    .setIncludeTxPowerLevel(false)
                    .addServiceUuid(pUuid);
            return builder.build();
        }
        return null;
    }

    private BluetoothGattService createService() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR2) {
            Boolean truer = true;

            mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
            acceptCharacteristic = new BluetoothGattCharacteristic(ACCEPT_UUID, PROPERTY_READ | PROPERTY_WRITE, PERMISSION_READ | PERMISSION_WRITE);
            maCharacteristic = new BluetoothGattCharacteristic(MA_UUID, PROPERTY_READ, PERMISSION_READ);
            peerIDCharacteristic = new BluetoothGattCharacteristic(PEER_ID_UUID, PROPERTY_READ, PERMISSION_READ);
            writerCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);
            isRdyCharacteristic = new BluetoothGattCharacteristic(IS_READY_UUID, PROPERTY_WRITE, PERMISSION_WRITE);
            closerCharacteristic = new BluetoothGattCharacteristic(CLOSER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);

            truer = mService.addCharacteristic(acceptCharacteristic) && truer;
            truer = mService.addCharacteristic(maCharacteristic) && truer;
            truer = mService.addCharacteristic(peerIDCharacteristic) && truer;
            truer = mService.addCharacteristic(writerCharacteristic) && truer;
            truer = mService.addCharacteristic(isRdyCharacteristic) && truer;
            truer = mService.addCharacteristic(closerCharacteristic) && truer;

            if (truer == false) {
                Log.e(TAG, "Error adding characteristic");
            }
            return mService;
        }

        return null;
    }

    private BluetoothGattServerCallback mGattServerCallback;

    public void initGattServerCallBack() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mGattServerCallback = new BluetoothGattServerCallback() {
                @Override
                public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {

                }

                @Override
                public void onCharacteristicReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattCharacteristic characteristic) {

                }

                @Override
                public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId, BluetoothGattCharacteristic characteristic, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {

                }

                @Override
                public void onDescriptorReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattDescriptor descriptor) {

                }

                @Override
                public void onDescriptorWriteRequest(BluetoothDevice device, int requestId, BluetoothGattDescriptor descriptor, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {

                }

                @Override
                public void onMtuChanged(BluetoothDevice device, int mtu) {
                    Log.d(TAG, "new mtu is: " + mtu);
                }
            };
        }
    }

    private AdvertiseCallback mAdvertisingCallback;

    public void initAdvertiseCallback() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mAdvertisingCallback = new AdvertiseCallback() {
                @Override
                public void onStartSuccess(AdvertiseSettings settingsInEffect) {
                    Log.e( "BLE", "Advertising onStartFai: " + settingsInEffect);
                    super.onStartSuccess(settingsInEffect);
                }
                @Override
                public void onStartFailure(int errorCode) {
                    Log.e( "BLE", "Advertising onStartFailure: " + errorCode );
                    super.onStartFailure(errorCode);
                }
            };
        }
    }


    public String realTest() {
        Log.e(TAG, "THIS IS REAL SHIT GUY");
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (!mBluetoothAdapter.isEnabled()) {
            Log.e(TAG, "NEED TO ENABLE");
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            mReactContext.getCurrentActivity().startActivityForResult(enableBtIntent, BLUETOOTH_ENABLE_REQUEST);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            Log.e(TAG, "THIS IS REAL SHIT GUY2");
            initGattServerCallBack();
            Log.e(TAG, "THIS IS REAL SHIT GUY3");
            BluetoothManager mb = (BluetoothManager) mContext.getSystemService(BLUETOOTH_SERVICE);
            Log.e(TAG, "THIS IS REAL SHIT GUY5");
            mBluetoothGattServer = mb.openGattServer(mContext, mGattServerCallback);
            Log.e(TAG, "THIS IS REAL SHIT GUY4");
            mBluetoothGattServer.addService(createService());
            Log.e(TAG, "THIS IS REAL SHIT GUY6");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                initAdvertiseCallback();
                Log.e(TAG, "THIS IS REAL SHIT GUY7");
                mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser();
                Log.e(TAG, "THIS IS REAL SHIT GUY8");
                mBluetoothLeAdvertiser.startAdvertising(createAdvSettings(true, 300), makeAdvertiseData(), mAdvertisingCallback);
            }
        }
        return "COMING FROM THAT MOTHA FUCKING JAVA";
    }
}
