package tech.berty.gobridge.bledriver;

import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_WRITE;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_NOTIFY;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Build;
import android.os.ParcelUuid;
import android.util.Base64;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class GattServer {
    // BLE protocol reserves 3 bytes out of MTU_SIZE for metadata
    public static final int ATT_HEADER_SIZE = 3;
    private static final long OP_TIMEOUT = 10000;
    // GATT service UUID
    static final UUID SERVICE_UUID = UUID.fromString("00004240-0000-1000-8000-00805F9B34FB");
    // GATT characteristic used for peer ID exchange
    static final UUID PID_UUID = UUID.fromString("00004241-0000-1000-8000-00805F9B34FB");
    // GATT characteristic used for data exchange
    static final UUID WRITER_UUID = UUID.fromString("00004242-0000-1000-8000-00805F9B34FB");
    // Client Characteristic Configuration (CCC) descriptor of the characteristic
    private final UUID CCC_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);
    private final String TAG = "bty.ble.GattServer";
    private final Logger mLogger;
    private final BleDriver mBleDriver;

    // GATT service objects
    private BluetoothGattService mService;

    private final Context mContext;
    private final BluetoothManager mBluetoothManager;
    private CountDownLatch mDoneSignal;
    private GattServerCallback mGattServerCallback;
    private BluetoothGattServer mBluetoothGattServer;
    private BluetoothServerSocket mBluetoothServerSocket;
    private int PSM = 0;
    private volatile boolean mInit = false;
    private volatile boolean mStarted = false;
    private final Lock mLock = new ReentrantLock();
    private BluetoothGattCharacteristic mWriterCharacteristic;

    public GattServer(Context context, BleDriver bleDriver, Logger logger, BluetoothManager bluetoothManager) {
        mContext = context;
        mBleDriver = bleDriver;
        mLogger = logger;
        mBluetoothManager = bluetoothManager;
    }

    public BluetoothServerSocket getBluetoothServerSocket() {
        return mBluetoothServerSocket;
    }

    private boolean initGattService() {
        mLogger.i(TAG, "initGattService called");

        mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
        BluetoothGattCharacteristic mPIDCharacteristic = new BluetoothGattCharacteristic(PID_UUID, PROPERTY_READ | PROPERTY_WRITE, PERMISSION_READ | PERMISSION_WRITE);
        mWriterCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE | PROPERTY_NOTIFY, PERMISSION_WRITE);
        BluetoothGattDescriptor descriptor = new BluetoothGattDescriptor(CCC_DESCRIPTOR_UUID, PERMISSION_READ | PERMISSION_WRITE);
        descriptor.setValue(new byte[] { 0, 0 });
        mWriterCharacteristic.addDescriptor(descriptor);

        if (!mPIDCharacteristic.setValue("") || !mWriterCharacteristic.setValue("")) {
            mLogger.e(TAG, "setupService failed: setValue error");
            return false;
        }

        if (!mService.addCharacteristic(mPIDCharacteristic) || !mService.addCharacteristic(mWriterCharacteristic)) {
            mLogger.e(TAG, "setupService failed: can't add characteristics to service");
            return false;
        }

        mDoneSignal = new CountDownLatch(1);
        mGattServerCallback = new GattServerCallback(mContext, mBleDriver, mLogger, this, mDoneSignal);

        mInit = true;
        return true;
    }

    // After adding a new service, the success of this operation will be given to the callback
    // BluetoothGattServerCallback#onServiceAdded. It's only after this callback that the server
    // will be ready.
    public boolean start(final String peerID) {
        mLogger.i(TAG, "start called");

        if (!mInit && !initGattService()) {
            mLogger.e(TAG, "start: GATT service not init");
            return false;
        }
        if (isStarted()) {
            mLogger.i(TAG, "start: GATT service already started");
            return true;
        }

        mGattServerCallback.setLocalPID(peerID);

        mBluetoothGattServer = mBluetoothManager.openGattServer(mContext, mGattServerCallback);
        if (mBluetoothGattServer == null) {
            mLogger.e(TAG, "start: GATT server cannot be get");
            return false;
        }

        // listen for incoming l2cap connections
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                mBluetoothServerSocket = mBluetoothManager.getAdapter().listenUsingInsecureL2capChannel();
                PSM = mBluetoothServerSocket.getPsm();
                mLogger.d(TAG, String.format("start: listenUsingL2capChannel: PSM=%d", PSM));
            } catch (IOException e) {
                mLogger.e(TAG, "start error: listenUsingL2capChannel: ", e);
                mBluetoothServerSocket = null;
            }

            // loop to accept multiple incoming connections
            if (mBluetoothServerSocket != null) {
                Thread l2capThread = new Thread(() -> {
                    while (true) {
                        if (mBluetoothServerSocket != null) {
                            BluetoothSocket bluetoothSocket;
                            try {
                                bluetoothSocket = mBluetoothServerSocket.accept();
                            } catch (IOException e) {
                                mLogger.e(TAG, "L2CAP accept(): exception catch: ", e);
                                return;
                            }

                            PeerDevice peerDevice;
                            if ((peerDevice = mBleDriver.deviceManager().get(bluetoothSocket.getRemoteDevice().getAddress())) == null) {
                                mLogger.e(TAG, String.format("L2CAP accept(): device=%s not found", mLogger.sensitiveObject(bluetoothSocket.getRemoteDevice().getAddress())));
                                continue;
                            } else {
                                mLogger.d(TAG, String.format("L2CAP accept(): accepted incoming connection from known device=%s", mLogger.sensitiveObject(bluetoothSocket.getRemoteDevice().getAddress())));
                            }

                            peerDevice.setBluetoothSocket(bluetoothSocket);
                            peerDevice.setL2capServerHandshakeStarted(true);
                            try {
                                peerDevice.setInputStream(bluetoothSocket.getInputStream());
                                peerDevice.setOutputStream(bluetoothSocket.getOutputStream());

                                Thread readThread = new Thread(() -> {
                                    peerDevice.l2capRead();
                                });
                                readThread.start();
                            } catch (IOException e) {
                                mLogger.e(TAG, String.format("L2CAP accept() error: l2cap cannot get stream: device=%s", mLogger.sensitiveObject(peerDevice.getMACAddress())), e);
                                try {
                                    bluetoothSocket.close();
                                } catch (IOException ioException) {
                                    // ignore
                                } finally {
                                    peerDevice.setBluetoothSocket(null);
                                    peerDevice.setInputStream(null);
                                    peerDevice.setOutputStream(null);
                                }
                            }
                        } else {
                            mLogger.e(TAG, "L2CAP accept(): BluetoothServerSocket is null");
                            return;
                        }
                    }
                });
                l2capThread.start();
            }
        }

        if (!mBluetoothGattServer.addService(mService)) {
            mLogger.e(TAG, "setupGattServer error: cannot add a new service");
            mBluetoothGattServer.close();
            mBluetoothGattServer = null;
            return false;
        }

        // wait that service starts
        try {
            mDoneSignal.await();
        } catch (InterruptedException e) {
            mLogger.e(TAG, "start: interrupted exception:", e);
        }

        // mStarted is updated by GattServerCallback
        return isStarted();
    }

    public int getL2capPSM() {
        return PSM;
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

    public void setStarted(boolean started) {
        mLock.lock();
        try {
            mStarted = started;
        } finally {
            mLock.unlock();
        }
    }

    public void stop() {
        mLogger.i(TAG, "stop() called");
        if (isStarted()) {
            setStarted(false);
            if (mBluetoothServerSocket != null) {
                try {
                    mLogger.d(TAG, "stop BluetoothServerSocket (L2cap)");
                    mBluetoothServerSocket.close();
                } catch (IOException e) {
                    mLogger.e(TAG, "stop error: cannot close BluetoothServerSocket (L2cap)");
                } finally {
                    mBluetoothServerSocket = null;
                }
            }
            mBluetoothGattServer.close();
            mLock.lock();
            try {
                mBluetoothGattServer = null;
            } finally {
                mLock.unlock();
            }
        }
        mInit = false;
    }

    private boolean _writeAndNotify(PeerDevice device, byte[] payload) {
        if (mLogger.showSensitiveData()) {
            mLogger.v(TAG, String.format("_writeAndNotify: writing chunk of data: device=%s base64=%s value=%s length=%d", device.getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));
        } else {
            mLogger.v(TAG, "_writeAndNotify called");
        }

        if (!mWriterCharacteristic.setValue(payload)) {
            mLogger.e(TAG, "_writeAndNotify: set characteristic failed");
            return false;
        }

        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            mLogger.d(TAG, "_writeAndNotify: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        Runnable cancel = () -> {
            mLogger.w(TAG, "_writeAndNotify error: release latch and disconnect");
            success[0] = callback.getStatus() == GATT_FAILURE;
            countDownLatch.countDown();
            device.disconnect();
        };

        success[0] = device.getBleQueue().add(() -> {
            if (!device.isServerConnected()) {
                mLogger.e(TAG, "_writeAndNotify: server is disconnected");
                device.getBleQueue().completedCommand(device.STATUS_ERROR);
                return;
            }

            if (!mBluetoothGattServer.notifyCharacteristicChanged(device.getBluetoothDevice(), mWriterCharacteristic, true)) {
                mLogger.e(TAG, String.format("_writeAndNotify: notifyCharacteristicChanged failed for device=%s", mLogger.sensitiveObject(device.getMACAddress())));
                device.getBleQueue().completedCommand(device.STATUS_ERROR);
            }
        }, callback, 0, cancel);

        if (success[0] == false) {
            mLogger.e(TAG, String.format("_writeAndNotify error: device=%s: unable to put code in queue", mLogger.sensitiveObject(device.getMACAddress())));
            return false;
        }

        try {
            countDownLatch.await(OP_TIMEOUT, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            mLogger.e(TAG, String.format("_writeAndNotify: device=%s: await failed", mLogger.sensitiveObject(device.getMACAddress())));
            return false;
        }

        return true;
    }

    public boolean writeAndNotify(PeerDevice device, byte[] payload) {
        if (mLogger.showSensitiveData()) {
            mLogger.v(TAG, String.format("writeAndNotify: device=%s base64=%s value=%s length=%d", device.getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));
        } else {
            mLogger.v(TAG, "writeAndNotify called");
        }

        if (mBluetoothGattServer == null) {
            mLogger.e(TAG, "writeAndNotify: GATT server is not running");
            return false;
        }

        if (mWriterCharacteristic == null) {
            mLogger.e(TAG, "writeAndNotify: writer characteristic is null");
            return false;
        }

        byte[] toWrite;
        int minOffset = 0;
        int maxOffset;

        // Send data to fit with MTU value
        while (minOffset < payload.length) {
            if (!device.isServerConnected()) {
                mLogger.e(TAG, "writeAndNotify: server is disconnected");
                return false;
            }
            maxOffset = minOffset + device.getMtu() - ATT_HEADER_SIZE > payload.length ? payload.length : minOffset + device.getMtu() - ATT_HEADER_SIZE;
            toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
            minOffset = maxOffset;

            if (!_writeAndNotify(device, toWrite)) {
                return false;
            }
        }

        return true;
    }
}
