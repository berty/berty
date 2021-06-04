package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.ParcelUuid;
import android.util.Log;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_WRITE;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;

public class GattServer {
    private final String TAG = "bty.ble.GattServer";

    // BLE protocol reserves 3 bytes out of MTU_SIZE for metadata
    public static final int ATT_HEADER_SIZE = 3;

    // GATT service UUID
    static final UUID SERVICE_UUID = UUID.fromString("00004240-0000-1000-8000-00805F9B34FB");
    // GATT characteristic used for peer ID exchange
    static final UUID PID_UUID = UUID.fromString("00004241-0000-1000-8000-00805F9B34FB");
    // GATT characteristic used for data exchange
    static final UUID WRITER_UUID = UUID.fromString("00004242-0000-1000-8000-00805F9B34FB");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);

    // GATT service objects
    private BluetoothGattService mService;
    private BluetoothGattCharacteristic mPIDCharacteristic;
    private BluetoothGattCharacteristic mWriterCharacteristic;

    private final Context mContext;
    private final BluetoothManager mBluetoothManager;
    private CountDownLatch mDoneSignal;
    private GattServerCallback mGattServerCallback;
    private BluetoothGattServer mBluetoothGattServer;
    private volatile boolean mInit = false;
    private volatile boolean mStarted = false;

    private final Lock mLock = new ReentrantLock();

    public GattServer(Context context, BluetoothManager bluetoothManager) {
        mContext = context;
        mBluetoothManager = bluetoothManager;
        initGattService();
    }

    private void initGattService() {
        Log.i(TAG, "initGattService called");

        mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
        mPIDCharacteristic = new BluetoothGattCharacteristic(PID_UUID, PROPERTY_READ | PROPERTY_WRITE, PERMISSION_READ | PERMISSION_WRITE);
        mWriterCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);

        if (!mPIDCharacteristic.setValue("") || !mWriterCharacteristic.setValue("")) {
            Log.e(TAG, "setupService failed: setValue error");
            return ;
        }

        if (!mService.addCharacteristic(mPIDCharacteristic) || !mService.addCharacteristic(mWriterCharacteristic)) {
            Log.e(TAG, "setupService failed: can't add characteristics to service");
            return ;
        }

        mDoneSignal = new CountDownLatch(1);
        mGattServerCallback = new GattServerCallback(mContext, this, mDoneSignal);

        mInit = true;
    }

    // After adding a new service, the success of this operation will be given to the callback
    // BluetoothGattServerCallback#onServiceAdded. It's only after this callback that the server
    // will be ready.
    public boolean start(final String peerID) {
        Log.i(TAG, "start called");

        if (!mInit) {
            Log.e(TAG, "start: GATT service not init");
            return false;
        }
        if (isStarted()) {
            Log.i(TAG, "start: GATT service already started");
            return true;
        }

        mGattServerCallback.setLocalPID(peerID);

        mBluetoothGattServer = mBluetoothManager.openGattServer(mContext, mGattServerCallback);

        if (!mBluetoothGattServer.addService(mService)) {
            Log.e(TAG, "setupGattServer error: cannot add a new service");
            mBluetoothGattServer.close();
            mBluetoothGattServer = null;
            return false;
        }

        // wait that service starts
        try {
           mDoneSignal.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "start: interrupted exception:", e);
        }

        // mStarted is updated by GattServerCallback
        return isStarted();
    }

    public BluetoothGattServer getGattServer() {
        BluetoothGattServer gattServer;
        mLock.lock();
        try {
            gattServer = mBluetoothGattServer;
        } finally {
            mLock.unlock();
        }
        return gattServer;
    }

    public void setStarted(boolean started) {
        mLock.lock();
        try {
            mStarted = started;
        } finally {
            mLock.unlock();
        }
    }

    public boolean isStarted() {
        boolean started;
        mLock.lock();
        try {
            started = mStarted;
        } finally {
            mLock.unlock();
        }
        return started;
    }

    public void stop() {
        Log.i(TAG, "stop() called");
        if (isStarted()) {
            setStarted(false);
            mBluetoothGattServer.close();
            mLock.lock();
            try {
                mBluetoothGattServer = null;
            } finally {
                mLock.unlock();
            }
        }
    }

    /*public boolean writeAndNotify(PeerDevice device, byte[] payload) {
        if (mBluetoothGattServer == null) {
            Log.e(TAG, "writeAndNotify: GATT server is not running");
            return false;
        }

        if (mReaderCharacteristic == null) {
            Log.e(TAG, "writeAndNotify: reader characteristic is null");
            return false;
        }

        Log.v(TAG, String.format("writeAndNotify: device=%s base64=%s value=%s length=%d", device.getMACAddress(), Base64.getEncoder().encodeToString(payload), BleDriver.bytesToHex(payload), payload.length));

        return BleQueue.add(new Runnable() {
            @Override
            public void run() {
                Log.v(TAG, String.format("BleQueue: writeAndNotify for device %s", device.getMACAddress()));
                if (mBluetoothGattServer == null) {
                    Log.e(TAG, "writeAndNotify: GATT server is not running");
                    BleQueue.completedCommand();
                } else if (mReaderCharacteristic == null) {
                    Log.e(TAG, "writeAndNotify: reader characteristic is null");
                    BleQueue.completedCommand();
                } else {
                    byte[] toWrite;
                    int minOffset = 0;
                    int maxOffset;

                    // Send data to fit with MTU value
                    while (minOffset < payload.length) {
                        maxOffset = minOffset + device.getMtu() - ATT_HEADER_SIZE > payload.length ? payload.length : minOffset + device.getMtu() - ATT_HEADER_SIZE;
                        toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
                        minOffset = maxOffset;

                        Log.v(TAG, String.format("writeAndNotify: in BleQueue, writing chunk of data: device=%s base64=%s value=%s length=%d", device.getMACAddress(), Base64.getEncoder().encodeToString(toWrite), BleDriver.bytesToHex(toWrite), payload.toString()));
                        if (!mReaderCharacteristic.setValue(toWrite)) {
                            Log.e(TAG, "writeAndNotify: set characteristic failed");
                            // TODO: close connection?
                            return ;
                        }
                        if (!mBluetoothGattServer.notifyCharacteristicChanged(device.getBluetoothDevice(), mReaderCharacteristic, true)) {
                            Log.e(TAG, String.format("BleQueue: writeAndNotify: notifyCharacteristicChanged failed for device %s", device.getMACAddress()));
                            // TODO: close connection?
                            return ;
                        }
                    }

                    // Sent an empty value to terminate transfer
                    if (!mReaderCharacteristic.setValue("")) {
                        Log.e(TAG, "writeAndNotify: set characteristic failed");
                        // TODO: close connection?
                        return ;
                    }
                    if (!mBluetoothGattServer.notifyCharacteristicChanged(device.getBluetoothDevice(), mReaderCharacteristic, true)) {
                        Log.e(TAG, String.format("BleQueue: writeAndNotify: notifyCharacteristicChanged failed for device %s", device.getMACAddress()));
                        // TODO: close connection?
                    }
                }
            }
        });
    }*/
}
