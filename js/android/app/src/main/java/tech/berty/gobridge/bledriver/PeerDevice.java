package tech.berty.gobridge.bledriver;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_NOTIFY;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Build;
import android.util.Base64;

import androidx.annotation.NonNull;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;

public class PeerDevice {
    // Mark used to tell all data is transferred
    public static final String EOD = "EOD";
    // Max MTU that Android can handle
    public static final int MAX_MTU = 517;
    // L2cap read/write buffer
    public static final int L2CAP_BUFFER = 1024;
    // Max PDU size = max payload we can write
    public static final int L2CAP_MPS = 1024;
    // Size of the byte array data used for l2cap connection test
    public static final int L2CAP_HANDSHAKE_DATA_LEN = 1024;

    private static final String TAG = "bty.ble.PeerDevice";
    private final Logger mLogger;
    private final BleDriver mBleDriver;
    // Connection timeout
    private static final int CONNECTION_TIMEOUT = 15000;
    // Minimal and default MTU
    private static final int DEFAULT_MTU = 23;
    // Client Characteristic Configuration (CCC) descriptor of the characteristic
    private final UUID CCC_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    public final int STATUS_SUCCESS = 0;
    public final int STATUS_ERROR = 1;

    private final boolean mIsClient;
    public final Object mLockServer = new Object();
    private final Object mLockRemotePID = new Object();
    private final Object mLockClient = new Object();
    private final Object mLockPeer = new Object();
    private GattServer mGattServer;
    private CONNECTION_STATE mClientState = CONNECTION_STATE.DISCONNECTED;
    private CONNECTION_STATE mServerState = CONNECTION_STATE.DISCONNECTED;
    private final Context mContext;
    private final BluetoothDevice mBluetoothDevice;
    private BluetoothGatt mBluetoothGatt;
    private final BleQueue mBleQueue;
    private final BleQueue mWriteQueue;
    private final BleQueue mReadQueue;
    private Runnable mTimeoutRunnable;
    private CountDownLatch mConnectionLatch;
    private BluetoothGattService mBertyService;
    private BluetoothGattCharacteristic mPIDCharacteristic;
    private BluetoothGattCharacteristic mWriterCharacteristic;
    private String mId;
    private Peer mPeer;
    private String mRemotePID;
    private final String mLocalPID;
    private int mPSM = 0;
    private BluetoothSocket mBluetoothSocket;
    private InputStream mInputStream;
    private OutputStream mOutputStream;
    private byte[] mInDataBuffer;
    private CircularBuffer<byte[]> mDataCache = new CircularBuffer<>(10);
    private int mMtu = DEFAULT_MTU;
    private boolean mL2capClientHandshakeStarted;
    private boolean mL2capServerHandshakeStarted;
    private byte[] mL2capHandshakeData;
    private ByteArrayOutputStream mL2capHandshakeRcvData;
    private int mL2capHandshakeRcvDataLen;
    private boolean mL2capHandshakeStepStatus;
    private CountDownLatch mL2capHandshakeLatch;
    private boolean mUseL2cap = false;

    private final BluetoothGattCallback mGattCallback =
        new BluetoothGattCallback() {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                super.onConnectionStateChange(gatt, status, newState);
                mLogger.v(TAG, String.format("onConnectionStateChange(): device=%s status=%d newState=%d", mLogger.sensitiveObject(gatt.getDevice().getAddress()), status, newState));
                BluetoothDevice device = gatt.getDevice();

                cancelTimer();

                if (status == GATT_SUCCESS) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        mLogger.i(TAG, String.format("onConnectionStateChange(): connected: device=%s", mLogger.sensitiveObject(device.getAddress())));

                        if (getClientState() != CONNECTION_STATE.CONNECTING) {
                            mLogger.w(TAG, String.format("onConnectionStateChange: device status error: device=%s status=%s newState=CONNECTED", mLogger.sensitiveObject(mLogger.sensitiveObject(getMACAddress())), getClientState()));
//                            mConnectionLatch.countDown();
                            // duplicate callback, just ignore it.
                            return;
                        }
                        setClientState(CONNECTION_STATE.CONNECTED);

                        if (gatt.getService(GattServer.SERVICE_UUID) == null) {
                            if (!discoverServices()) {
                                mLogger.e(TAG, String.format("onConnectionStateChange error: failed to launch service discovering: device=%s", mLogger.sensitiveObject(mLogger.sensitiveObject(getMACAddress()))));
                                disconnect();
                            }
                        } else {
                            // Speed up connection
                            requestMtu(PeerDevice.MAX_MTU);
                        }
                    } else {
                        mLogger.i(TAG, String.format("onConnectionStateChange: disconnected: device=%s", mLogger.sensitiveObject(device.getAddress())));

                        setClientState(CONNECTION_STATE.DISCONNECTED);
                        closeClient();
                    }
                } else {
                    mLogger.e(TAG, String.format("onConnectionStateChange(): status error=%d for device %s", status, mLogger.sensitiveObject(device.getAddress())));

                    setClientState(CONNECTION_STATE.DISCONNECTED);
                    closeClient();
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                super.onServicesDiscovered(gatt, status);
                mLogger.v(TAG, String.format("onServicesDiscovered for device %s", mLogger.sensitiveObject(getMACAddress())));

                if (status != GATT_SUCCESS) {
                    mLogger.e(TAG, String.format("service discovery failed due to internal error '%s', disconnecting", status));
                    disconnect();
                } else {
                    mLogger.d(TAG, String.format("discovered %d services: device=%s", gatt.getServices().size(), mLogger.sensitiveObject(mBluetoothDevice.getAddress())));
                    // Speed up connection
                    requestMtu(PeerDevice.MAX_MTU);
                }
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt,
                                             BluetoothGattCharacteristic characteristic,
                                             int status) {
                super.onCharacteristicRead(gatt, characteristic, status);
                mLogger.v(TAG, String.format("onCharacteristicRead: device=%s", mLogger.sensitiveObject(getMACAddress())));

                if (status != GATT_SUCCESS) {
                    mLogger.e(TAG, String.format("onCharacteristicRead error: device=%s status=%d", mLogger.sensitiveObject(getMACAddress()), status));
                    disconnect();
                    mBleQueue.completedCommand(status);
                    return;
                }
                if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                    byte[] value = characteristic.getValue();
                    if (value.length == 0) {
                        mLogger.d(TAG, "onCharacteristicRead(): received data length is null");
                        mBleQueue.completedCommand(STATUS_ERROR);
                        return;
                    } else {
                        if (mLogger.showSensitiveData()) {
                            mLogger.v(TAG, String.format("onCharacteristicRead: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length));
                        }
                        boolean success = BleDriver.mCallbacksHandler.post(() -> {
                            mLogger.v(TAG, String.format("onCharacteristicRead in thread: device=%s", mLogger.sensitiveObject(getMACAddress())));
                            boolean ret = handleClientPIDReceived(value);
                            mBleQueue.completedCommand(ret ? STATUS_SUCCESS : STATUS_ERROR);
                        });

                        if (!success) {
                            mLogger.e(TAG, "onCharacteristicRead error: handler.post() failed");
                            disconnect();
                            mBleQueue.completedCommand(STATUS_ERROR);
                        }
                    }
                } else {
                    mLogger.e(TAG, "onCharacteristicRead(): wrong read characteristic");
                    disconnect();
                    mBleQueue.completedCommand(STATUS_ERROR);
                }
            }

            @Override
            public void onCharacteristicWrite(BluetoothGatt gatt,
                                              BluetoothGattCharacteristic characteristic,
                                              int status) {
                super.onCharacteristicWrite(gatt, characteristic, status);
                mLogger.v(TAG, String.format("onCharacteristicWrite for device %s", mLogger.sensitiveObject(getMACAddress())));

                if (status != GATT_SUCCESS) {
                    mLogger.e(TAG, String.format("onCharacteristicWrite error: device=%s status=%d", mLogger.sensitiveObject(getMACAddress()), status));
                    disconnect();
                }

                mBleQueue.completedCommand(status);
            }

            @Override
            public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                super.onMtuChanged(gatt, mtu, status);
                mLogger.d(TAG, String.format("onMtuChanged(): mtu %s for device %s", mtu, mLogger.sensitiveObject(getMACAddress())));

                if (status != GATT_SUCCESS) {
                    mLogger.e(TAG, "onMtuChanged() error: transmission error");
                } else {
                    setMtu(mtu);
                }

                mBleQueue.completedCommand(status);

                // continue connection handshake even with a little MTU
                BleDriver.mHandshakeHandler.post(() -> handshake());
            }

            @Override
            public void onCharacteristicChanged (BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
                super.onCharacteristicChanged(gatt, characteristic);

                byte[] value = characteristic.getValue();
                if (mLogger.showSensitiveData()) {
                    mLogger.v(TAG, String.format("onCharacteristicChanged: device=%s base64=%s value=%s length=%d", mLogger.sensitiveObject(getMACAddress()), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length));
                } else {
                    mLogger.v(TAG, "onCharacteristicChanged called");
                }

                handleDataReceived(value);
            }

            @Override
            public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorRead(gatt, descriptor, status);

                mLogger.v(TAG, String.format("onDescriptorRead: device=%s", mLogger.sensitiveObject(getMACAddress())));
            }

            @Override
            public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorWrite(gatt, descriptor, status);

                mLogger.v(TAG, String.format("onDescriptorWrite: device=%s status=%d", mLogger.sensitiveObject(getMACAddress()), status));
                mBleQueue.completedCommand(status);
            }
        };

    public PeerDevice(@NonNull Context context, @NonNull BleDriver bleDriver, @NonNull Logger logger, @NonNull BluetoothDevice bluetoothDevice, String localPID, boolean isClient) {
        mContext = context;
        mBleDriver = bleDriver;
        mLogger = logger;
        mBluetoothDevice = bluetoothDevice;
        mLocalPID = localPID;
        mIsClient = isClient;
        mBleQueue = new BleQueue(logger, BleDriver.mainHandler);
        mWriteQueue = new BleQueue(logger, BleDriver.mWriteHandler);
        mReadQueue = new BleQueue(logger, BleDriver.mReadHandler);
    }

    public void setGattServer(GattServer gattServer) {
        mGattServer = gattServer;
    }

    public synchronized String getId() {
        return mId;
    }

    public synchronized void setId(String mId) {
        this.mId = mId;
        mBleQueue.setId(mId);
        mWriteQueue.setId(mId + " (writer)");
        mReadQueue.setId(mId + " (reader)");
    }

    public BluetoothDevice getBluetoothDevice() {
        return mBluetoothDevice;
    }

    public String getMACAddress() {
        return mBluetoothDevice.getAddress();
    }

    @NonNull
    @Override
    public String toString() {
        return getMACAddress();
    }

    public BluetoothSocket getBluetoothSocket() {
        return mBluetoothSocket;
    }

    public void setBluetoothSocket(BluetoothSocket bluetoothSocket) {
        this.mBluetoothSocket = bluetoothSocket;
    }

    public InputStream getInputStream() {
        return mInputStream;
    }

    public void setInputStream(InputStream inputStream) {
        this.mInputStream = inputStream;
    }

    public OutputStream getOutputStream() {
        return mOutputStream;
    }

    public void setOutputStream(OutputStream outputStream) {
        this.mOutputStream = outputStream;
    }

    public byte[] getInDataBuffer() {
        return mInDataBuffer;
    }

    public byte[] flushInDataBuffer() {
        byte[] tmp = mInDataBuffer;
        mInDataBuffer = null;
        return tmp;
    }

    private void startTimer(Runnable task, long delay) {
        mLogger.v(TAG, String.format("startConnectionTimer called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        cancelTimer();
        mTimeoutRunnable = task;

        BleDriver.mainHandler.postDelayed(mTimeoutRunnable, delay);
    }

    private void cancelTimer() {
        mLogger.v(TAG, String.format("cancelTimer called: device=%s", mLogger.sensitiveObject(getMACAddress())));
        if (mTimeoutRunnable != null) {
            BleDriver.mainHandler.removeCallbacks(mTimeoutRunnable);
            mTimeoutRunnable = null;
        }
    }

    // GATT connection is enqueued to not avoid ongoing GATT operation, between this operation and its callback
    // API 23 minimum for connectGatt()
    public void connectToDevice(boolean autoConnect, CountDownLatch countDown) {
        mLogger.v(TAG, "connectToDevice: add to main queue: device=" + mLogger.sensitiveObject(getMACAddress()));

        if (checkAndSetClientState(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.CONNECTING)) {
            boolean status = BleDriver.mainHandler.postDelayed(() -> {
                mLogger.d(TAG, "connectToDevice: connecting to device=" + mLogger.sensitiveObject(getMACAddress()));
                mConnectionLatch = countDown;
                setBluetoothGatt(mBluetoothDevice.connectGatt(mContext, autoConnect,
                    mGattCallback, BluetoothDevice.TRANSPORT_LE));

                startTimer(() -> {
                    mLogger.d(TAG, String.format("timer fired: cancel connection: device=%s", mLogger.sensitiveObject(getMACAddress())));

                    // need to disconnect manually as callbacks won't be called
                    mBluetoothGatt.disconnect();
                    mBluetoothGatt = null;
                    mBleQueue.clear();
                    setClientState(CONNECTION_STATE.DISCONNECTED);

                    mConnectionLatch.countDown();
                    mTimeoutRunnable = null;
                }, CONNECTION_TIMEOUT);
            }, 500);

            if (!status) {
                mLogger.e(TAG, String.format("connectToDevice error: can't add in job queue: device=%s", mLogger.sensitiveObject(getMACAddress())));
                countDown.countDown();
            }
        } else {
            mLogger.v(TAG, String.format("connectToDevice canceled, device %s is not disconnected", mLogger.sensitiveObject(getMACAddress())));
            countDown.countDown();
        }
    }

    public boolean isClientConnected() {
        return getClientState() == CONNECTION_STATE.CONNECTED;
    }

    public boolean isClientDisconnected() {
        return getClientState() == CONNECTION_STATE.DISCONNECTED;
    }

    public boolean isServerDisconnected() {
        return getServerState() == CONNECTION_STATE.DISCONNECTED;
    }

    public boolean isServerConnected() {
        return getServerState() == CONNECTION_STATE.CONNECTED;
    }

    public void disconnect() {
        if (mIsClient) {
            mLogger.d(TAG, String.format("disconnect called: client device=%s", mLogger.sensitiveObject(getMACAddress())));

            synchronized (mLockClient) {
                if (mClientState == CONNECTION_STATE.CONNECTED || mClientState == CONNECTION_STATE.CONNECTING) {
                    mClientState = CONNECTION_STATE.DISCONNECTING;
                } else {
                    mLogger.d(TAG, String.format("disconnect: client device=%s not connected", mLogger.sensitiveObject(getMACAddress())));
                    return ;
                }
            }

            if (mBluetoothGatt != null) {
                mLogger.d(TAG, String.format("disconnect: device=%s is disconnecting", mLogger.sensitiveObject(getMACAddress())));
                getBluetoothGatt().disconnect(); // onConnectionStateChange will be called
            } else {
                mLogger.e(TAG, String.format("disconnect error: device=%s: bluetoothGatt object is null", mLogger.sensitiveObject(getMACAddress())));
            }

            // The client side needs to set the state server too
            synchronized (mLockServer) {
                mServerState = CONNECTION_STATE.DISCONNECTING;
            }
        } else {
            mLogger.d(TAG, String.format("disconnect: server device=%s", mLogger.sensitiveObject(getMACAddress())));

            // We cannot disconnect from the server side, but we can reject future GATT operations
            synchronized (mLockServer) {
                if (mServerState == CONNECTION_STATE.CONNECTED) {
                    mServerState = CONNECTION_STATE.DISCONNECTING;
                } else {
                    mLogger.d(TAG, String.format("disconnect: server device=%s not connected", mLogger.sensitiveObject(getMACAddress())));
                    return ;
                }
            }

            closeServer();
        }
    }

    private void closeL2cap() {
        if (mBluetoothSocket != null) {
            mLogger.d(TAG, String.format("closeL2cap called: device=%s", mLogger.sensitiveObject(getMACAddress())));
            try {
                if (mInputStream != null) {
                    mInputStream.close();
                    mInputStream = null;
                }
                if (mOutputStream != null) {
                    mOutputStream.close();
                    mOutputStream = null;
                }
                mBluetoothSocket.close();
                mBluetoothSocket = null;
            } catch (IOException e) {
                mLogger.e(TAG, String.format("disconnect: device=%s: error when closing l2cap channel", mLogger.sensitiveObject(getMACAddress())));
            }
        }
    }

    public void closeClient() {
        mLogger.d(TAG, String.format("closeClient called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        closeL2cap();

        if (getBluetoothGatt() != null) {
            getBluetoothGatt().close();
            setBluetoothGatt(null);
        }
        setPIDCharacteristic(null);
        setWriterCharacteristic(null);
        setBertyService(null);

        mBleQueue.clear();
        mWriteQueue.clear();
        mReadQueue.clear();

        mBleDriver.peerManager().unregisterDevices(mRemotePID);
        setPeer(null);
    }

    public void closeServer() {
        mLogger.d(TAG, String.format("closeServer called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        closeL2cap();

        mBleQueue.clear();
        mWriteQueue.clear();
        mReadQueue.clear();

        mInDataBuffer = null;

        if (mPeer != null) {
            mBleDriver.peerManager().unregisterDevices(mRemotePID);
            setPeer(null);
        }
    }

    public CONNECTION_STATE getClientState() {
        synchronized (mLockClient) {
            return mClientState;
        }
    }

    private void setClientState(CONNECTION_STATE state) {
        synchronized (mLockClient) {
            mLogger.v(TAG, String.format("setClientState called: device=%s state=%s", mLogger.sensitiveObject(getMACAddress()), state));
            mClientState = state;
        }
    }

    private boolean checkAndSetClientState(CONNECTION_STATE state, CONNECTION_STATE newState) {
        mLogger.v(TAG, String.format("checkAndSetClientState called for device %s, state=%s newState=%s", mLogger.sensitiveObject(getMACAddress()), state, newState));
        synchronized (mLockClient) {
            if (mClientState == state) {
                mClientState = newState;
                return true;
            }
            return false;
        }
    }

    public CONNECTION_STATE getServerState() {
        synchronized (mLockServer) {
            return mServerState;
        }
    }

    public void setServerState(CONNECTION_STATE state) {
        synchronized (mLockServer) {
            mLogger.v(TAG, String.format("setServerState called: device=%s state=%s", mLogger.sensitiveObject(getMACAddress()), state));
            mServerState = state;
        }
    }

    public boolean checkAndSetServerState(CONNECTION_STATE state, CONNECTION_STATE newState) {
        mLogger.v(TAG, String.format("checkAndSetServerState called for device %s, state=%s newState=%s", mLogger.sensitiveObject(getMACAddress()), state, newState));
        synchronized (mLockServer) {
            if (mServerState == state) {
                mServerState = newState;
                return true;
            }
            return false;
        }
    }

    private synchronized BluetoothGatt getBluetoothGatt() {
        return mBluetoothGatt;
    }

    private synchronized void setBluetoothGatt(BluetoothGatt gatt) {
        mBluetoothGatt = gatt;
    }

    private BluetoothGattCharacteristic getPIDCharacteristic() {
        return mPIDCharacteristic;
    }

    private void setPIDCharacteristic(BluetoothGattCharacteristic peerID) {
        mPIDCharacteristic = peerID;
    }

    // Public access by BleDriver.SendToPeer()
    public BluetoothGattCharacteristic getWriterCharacteristic() {
        return mWriterCharacteristic;
    }

    private void setWriterCharacteristic(BluetoothGattCharacteristic write) {
        mWriterCharacteristic = write;
    }

    private BluetoothGattService getBertyService() {
        return mBertyService;
    }

    private void setBertyService(BluetoothGattService service) {
        mBertyService = service;
    }

    public String getRemotePID() {
        synchronized (mLockRemotePID) {
            return mRemotePID;
        }
    }

    private void setRemotePID(String peerID) {
        mLogger.d(TAG, String.format("setRemotePID called: device=%s remotePID=%s", mLogger.sensitiveObject(getMACAddress()), peerID));
        synchronized (mLockRemotePID) {
            if (mRemotePID != null && !mRemotePID.equals(peerID)) {
                mLogger.w(TAG, String.format("setRemotePID error: PID already set is different: device=%s oldPID=%s newPID=%s", mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(mRemotePID), mLogger.sensitiveObject(peerID)));
            }
            mRemotePID = peerID;
        }
    }

    public Peer getPeer() {
        synchronized (mLockPeer) {
            return mPeer;
        }
    }

    public void setPeer(Peer peer) {
        synchronized (mLockPeer) {
            mPeer = peer;
        }
    }

    public BleQueue getBleQueue() {
        return mBleQueue;
    }

    public void setL2capServerHandshakeStarted(boolean status) {
        mL2capServerHandshakeStarted = status;
        mL2capHandshakeStepStatus = false;
    }

    public boolean canUseL2cap() {
        return mUseL2cap;
    }

    public void l2capRead() {
        // read loop
        byte[] buffer = new byte[L2CAP_BUFFER];
        int size;

        while (true) {
            try {
                if (!mBluetoothSocket.isConnected()) {
                    mLogger.w(TAG, "l2capRead: socket not connected");
                    return;
                }
                if (mInputStream == null || ((size = mInputStream.read(buffer, 0, L2CAP_BUFFER)) == -1)) {
                    mLogger.e(TAG, String.format("l2capRead stream error: device=%s ", mLogger.sensitiveObject(getMACAddress())));
                    return;
                }
            } catch (IOException e) {
                mLogger.e(TAG, String.format("l2capRead catch error: device=%s ", mLogger.sensitiveObject(getMACAddress())), e);
                return;
            }
            byte[] payload = Arrays.copyOfRange(buffer, 0, size);
            if (mLogger.showSensitiveData()) {
                mLogger.v(TAG, String.format("l2capRead: read from l2cap: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));
            } else {
                mLogger.v(TAG, "l2capRead: data read");
            }

            // L2CAP handshake
            if (mL2capClientHandshakeStarted) {
                try {
                    mL2capHandshakeRcvData.write(payload);
                } catch (IOException e) {
                    mLogger.e(TAG, String.format("l2capRead: L2cap client handshake OutputStream error: error=%s device=%s payload=%s remotePID=%s", e, mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(BleDriver.bytesToHex(payload)), mLogger.sensitiveObject(BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8)))));
                    cancelTimer();
                    mL2capHandshakeLatch.countDown();
                }

                if (mL2capHandshakeRcvData.size() < L2CAP_HANDSHAKE_DATA_LEN) {
                    mLogger.d(TAG, String.format("l2capRead: L2cap client handshake received incomplete payload: device=%s", mLogger.sensitiveObject(getMACAddress())));
                } else if (mL2capHandshakeRcvData.size() == L2CAP_HANDSHAKE_DATA_LEN) {
                    if (Arrays.equals(mL2capHandshakeRcvData.toByteArray(), mL2capHandshakeData)) {
                        mLogger.d(TAG, String.format("l2capRead: L2cap client handshake received payload: device=%s", mLogger.sensitiveObject(getMACAddress())));
                        mL2capHandshakeStepStatus = true;
                        cancelTimer();
                        mL2capHandshakeLatch.countDown();
                    } else {
                        mLogger.e(TAG, String.format("l2capRead: L2cap client handshake received wrong payload: device=%s payload=%s remotePID=%s", mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(BleDriver.bytesToHex(payload)), (BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8)))));
                        cancelTimer();
                        mL2capHandshakeLatch.countDown();
                        disconnect();
                    }
                } else {
                    mLogger.e(TAG, String.format("l2capRead: L2cap client handshake received bigger payload than expected: device=%s payload=%s remotePID=%s", mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(BleDriver.bytesToHex(payload)), mLogger.sensitiveObject(BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8)))));
                }
            } else if (mL2capServerHandshakeStarted) {
                if (!mL2capHandshakeStepStatus) {
                    // Server step 1
                    mLogger.d(TAG, String.format("l2capRead: L2cap server handshake received payload, going to write it back: device=%s", mLogger.sensitiveObject(getMACAddress())));

                    mL2capHandshakeRcvDataLen += payload.length;
                    if (mL2capHandshakeRcvDataLen == L2CAP_HANDSHAKE_DATA_LEN) {
                        mL2capHandshakeStepStatus = true;
                        mL2capHandshakeRcvDataLen = 0;
                    }

                    if (!l2capWrite(payload)) {
                        mLogger.e(TAG, String.format("l2cap server handshake: write failed: device=%s", mLogger.sensitiveObject(getMACAddress())));
                        mL2capHandshakeStepStatus = false;
                        mL2capServerHandshakeStarted = false;
                    }
                } else if (mL2capHandshakeStepStatus && Arrays.equals(payload, mLocalPID.getBytes(StandardCharsets.UTF_8))) { // server step 2
                    mLogger.d(TAG, String.format("l2capRead: L2cap server handshake received second payload: device=%s", mLogger.sensitiveObject(getMACAddress())));
                    mL2capServerHandshakeStarted = false;
                    mUseL2cap = true;
                } else {
                    mLogger.e(TAG, String.format("l2capRead: L2cap server handshake received wrong payload: device=%s payload=%s remotePID=%s", mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(BleDriver.bytesToHex(payload)), mLogger.sensitiveObject(BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8)))));
                    disconnect();
                }
            } else {
                if (!handleDataReceived(payload)) {
                    disconnect();
                }
            }
        }
    }

    public boolean handleDataReceived(byte[] payload) {
        mLogger.v(TAG, String.format("handleDataReceived: device=%s", mLogger.sensitiveObject(getMACAddress())));

        Peer peer;
        if ((peer = getPeer()) == null) {
            mLogger.e(TAG, String.format("handleDataReceived error: Peer not found: peer=%s device=%s", mLogger.sensitiveObject(getRemotePID()), mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        if (peer.isHandshakeSuccessful()) {
            return mReadQueue.add(() -> {
                BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
                mReadQueue.completedCommand(STATUS_SUCCESS);
            }, null, 0, this::disconnect);
        } else {
            mLogger.d(TAG, String.format("handleDataReceived: device=%s not ready, putting in cache", mLogger.sensitiveObject(getMACAddress())));
            return mDataCache.offer(payload);

        }
    }

    public synchronized boolean handleServerPIDReceived(byte[] payload) {
        mLogger.v(TAG, String.format("handleServerPIDReceived called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        if (getPeer() != null) {
            mLogger.e(TAG, String.format("handleServerPIDReceived error: device=%s: handshake already completed", mLogger.sensitiveObject(getMACAddress())));
            disconnect();
            return false;
        }

        if (new String(payload).equals(EOD)) {
            mLogger.d(TAG, String.format("handleServerPIDReceived: device=%s EOD received", mLogger.sensitiveObject(getMACAddress())));

            if (mInDataBuffer == null) {
                return false;
            }

            String remotePID = new String(mInDataBuffer);
            mInDataBuffer = null;

            setRemotePID(remotePID);
            setId(BleDriver.idFromPid(remotePID));
        } else {
            mLogger.d(TAG, String.format("handleServerPIDReceived: device=%s add data to buffer", mLogger.sensitiveObject(getMACAddress())));
            putInDataBuffer(payload);
        }
        return true;
    }

    private boolean setNotify(BluetoothGattCharacteristic characteristic, final boolean enable) {
        mLogger.d(TAG, String.format("setNotify called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        if (!isClientConnected()) {
            mLogger.e(TAG, "setNotify error: device not connected");
            return false;
        }

        // Get the CCC Descriptor for the characteristic
        final BluetoothGattDescriptor descriptor = characteristic.getDescriptor(CCC_DESCRIPTOR_UUID);
        if(descriptor == null) {
            mLogger.e(TAG, String.format("setNotify error: device=%s: cannot get CCC descriptor for characteristic=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
            return false;
        }

        // Check if characteristic has NOTIFY or INDICATE properties and set the correct byte value to be written
        byte[] value;
        int properties = characteristic.getProperties();
        if ((properties & PROPERTY_NOTIFY) > 0) {
            value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE;
        } else {
            mLogger.e(TAG, String.format("setNotify error: device=%s: characteristic=%s does not have notify property", mLogger.sensitiveObject(getMACAddress()) , characteristic.getUuid()));
            return false;
        }
        final byte[] finalValue = enable ? value : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;

        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            mLogger.d(TAG, "setNotify: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        // turn on/off the notification in queue
        success[0] = mBleQueue.add(() -> {
            if (!isClientConnected()) {
                mLogger.e(TAG, "setNotify error: device not connected");
                mBleQueue.completedCommand(STATUS_ERROR);
                return;
            }

            // set notification for Gatt object
            if(!mBluetoothGatt.setCharacteristicNotification(characteristic, enable)) {
                mLogger.e(TAG, String.format("setNotify error: device=%s: setCharacteristicNotification failed for characteristic=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
                mBleQueue.completedCommand(STATUS_ERROR);
                return ;
            }

            // write to descriptor to complete process
            descriptor.setValue(finalValue);
            if(!mBluetoothGatt.writeDescriptor(descriptor)) {
                mLogger.e(TAG, String.format("setNotify error: device=%s: writeDescriptor failed for descriptor=%s", descriptor.getUuid()));
                mBleQueue.completedCommand(STATUS_ERROR);
            }
        }, callback, 0, this::disconnect);

        if (success[0] == false) {
            mLogger.e(TAG, String.format("setNotify error: device=%s: unable to put code in queue", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            mLogger.e(TAG, "setNotify: interrupted exception:", e);
        }

        return success[0];
}

    public synchronized boolean handleClientPIDReceived(byte[] payload) {
        if (mLogger.showSensitiveData()) {
            mLogger.v(TAG, String.format("handleClientPIDReceived for device=%s base64=%s payload=%s", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload)));
        } else {
            mLogger.v(TAG, "handleClientPIDReceived called");
        }

        Peer peer;
        String remotePID;

        ByteArrayInputStream bis = new ByteArrayInputStream(Arrays.copyOfRange(payload, 0, 4));
        DataInputStream dis = new DataInputStream(bis);
        try {
            mPSM = dis.readInt();
        } catch (IOException e) {
            mLogger.e(TAG, String.format("handleClientPIDReceived error: ByteArrayInputStream failed for device=%s", mLogger.sensitiveObject(getMACAddress())));
            return false;
        } finally {
            try {
                bis.close();
            } catch (IOException e) {
                // ignore
            }
        }
        remotePID = new String(Arrays.copyOfRange(payload, 4, payload.length));
        mLogger.d(TAG, String.format("handleClientPIDReceived: got PSM=%d remotePID=%s for device=%s", mPSM, mLogger.sensitiveObject(remotePID), mLogger.sensitiveObject(getMACAddress())));
        setRemotePID(remotePID);

        // TODO: not necessary?
        peer = mBleDriver.peerManager().getPeer(remotePID);
        setPeer(peer);

        return true;
    }

    // takeBertyService get the Berty service in the list of services
    private boolean takeBertyService() {
        mLogger.v(TAG, String.format("takeBertyService: called for device %s", mLogger.sensitiveObject(getMACAddress())));

        setBertyService(getBluetoothGatt().getService(GattServer.SERVICE_UUID));

        if (getBertyService() == null) {
            mLogger.e(TAG, String.format("Berty service not found for device=%s", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        mLogger.d(TAG, String.format("Berty service found for device=%s", mLogger.sensitiveObject(getMACAddress())));
        return true;
    }

    // Not compatible with iOS devices
    // checkCharacteristicProperties checks if the characteristics have correct permissions (read/write).
//    private boolean checkCharacteristicProperties(BluetoothGattCharacteristic characteristic,
//                                                  int properties) {
//        mLogger.d(TAG, "checkCharacteristicProperties: device: " + mLogger.sensitiveObject(getMACAddress()));
//
//        if (characteristic.getProperties() == properties) {
//            mLogger.d(TAG, "checkCharacteristicProperties() match, device: " + mLogger.sensitiveObject(getMACAddress()));
//            return true;
//        }
//        mLogger.e(TAG, "checkCharacteristicProperties() doesn't match: " + characteristic.getProperties() + " / " + properties + ", device: " + mLogger.sensitiveObject(getMACAddress()));
//        return false;
//    }

    // takeBertyCharacteristics checks if the service has the two characteristics expected.
    private boolean takeBertyCharacteristics() {
        mLogger.v(TAG, String.format("takeBertyCharacteristic called for device=%s", mLogger.sensitiveObject(getMACAddress())));

        List<BluetoothGattCharacteristic> characteristics = getBertyService().getCharacteristics();
        for (BluetoothGattCharacteristic characteristic : characteristics) {
            if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                mLogger.d(TAG, String.format("PID characteristic found for device %s", mLogger.sensitiveObject(getMACAddress())));
                setPIDCharacteristic(characteristic);
            } else if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                mLogger.d(TAG, String.format("writer characteristic found for device=%s", mLogger.sensitiveObject(getMACAddress())));
                setWriterCharacteristic(characteristic);
            }
        }

        if (getPIDCharacteristic() != null && getWriterCharacteristic() != null) {
            return true;
        }

        mLogger.e(TAG, String.format("reader/writer characteristics not found for device %s", mLogger.sensitiveObject(getMACAddress())));
        return false;
    }

    public boolean read(BluetoothGattCharacteristic characteristic) {
        mLogger.v(TAG, String.format("read() called for device %s characteristicUUID=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));

        final boolean[] success = {false};

        if (!isClientConnected()) {
            mLogger.e(TAG, String.format("read error: not connected: device=%s", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            mLogger.d(TAG, "read: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        success[0] = mBleQueue.add(() -> {
            mLogger.v(TAG, String.format("BleQueue: read: device=%s characteristicUUID=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!getBluetoothGatt().readCharacteristic(characteristic)) {
                        mLogger.e(TAG, String.format("BleQueue: read error: characteristic=%s", characteristic.getUuid()));
                        mBleQueue.completedCommand(1);
                        disconnect();
                    } else {
                        mLogger.d(TAG, String.format("BleQueue: read successful: characteristic=%s", characteristic.getUuid()));
                        //mNrTries++;
                    }
                } else {
                    mLogger.e(TAG, String.format("BleQueue: read error: client not connected: device=%s", mLogger.sensitiveObject(getMACAddress())));
                    mBleQueue.completedCommand(1);
                }
            }
        }, callback, 0, this::disconnect);

        if (success[0] == false) {
            mLogger.e(TAG, String.format("read error: device=%s: unable to put code in queue", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            mLogger.e(TAG, "read: interrupted exception:", e);
        }

        return success[0];
    }

    public boolean l2capWrite(byte[] payload) {
        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            mLogger.d(TAG, "l2capWrite: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        if ((isClientConnected() || isServerConnected()) && mBluetoothSocket != null && mBluetoothSocket.isConnected() && mOutputStream != null && mInputStream != null) {
            success[0] = mWriteQueue.add(() -> {
                try {
                    int nbOfChunk = payload.length / L2CAP_MPS;
                    int minOffset = 0;
                    int maxOffset;
                    int i = 0;

                    mLogger.v(TAG, String.format("l2capWrite: device=%s payload length=%d", mLogger.sensitiveObject(getMACAddress()), payload.length));
                    // Send data to fit with MTU value
                    while (minOffset != payload.length) {
                        if ((isClientConnected() || isServerConnected()) && mBluetoothSocket != null && mBluetoothSocket.isConnected() && mOutputStream != null && mInputStream != null) {
                            maxOffset = (minOffset + L2CAP_MPS) > payload.length ? payload.length : (minOffset + L2CAP_MPS);
                            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
                            if (mLogger.showSensitiveData()) {
                                mLogger.v(TAG, String.format("l2capWrite: device=%s chunk=%d/%d minOffset=%d maxOffset=%d length=%d base64=%s", getMACAddress(), ++i, nbOfChunk, minOffset, maxOffset, toWrite.length, Base64.encodeToString(toWrite, Base64.DEFAULT)));
                                printLongLog(BleDriver.bytesToHex(toWrite));
                            }
                            minOffset = maxOffset;

                            mOutputStream.write(toWrite);
                        }
                    }
                    mWriteQueue.completedCommand(STATUS_SUCCESS);
                } catch (IOException e) {
                    mLogger.e(TAG, String.format("l2capWrite error: device=%s", mLogger.sensitiveObject(getMACAddress())), e);
                    try {
                        mOutputStream.close();
                        mInputStream.close();
                        mBluetoothSocket.close();
                    } catch (IOException ioException) {
                        mLogger.e(TAG, String.format("l2capWrite error: failed to close l2cap socket: device=%s", mLogger.sensitiveObject(getMACAddress())), e);
                    }
                    mBluetoothSocket = null;
                    mOutputStream = null;
                    mInputStream = null;
                    mWriteQueue.completedCommand(STATUS_ERROR);
                }
            }, callback, 0, this::disconnect);

            if (success[0] == false) {
                mLogger.e(TAG, String.format("l2capWrite error: device=%s: unable to put code in queue", mLogger.sensitiveObject(getMACAddress())));
                return false;
            }

            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                mLogger.e(TAG, "l2capWrite: interrupted exception:", e);
            }
        }

        return success[0];
    }

    public boolean internalWrite(BluetoothGattCharacteristic characteristic, byte[] payload) {
        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            mLogger.d(TAG, "internalWrite: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        success[0] = mBleQueue.add(() -> {
            mLogger.v(TAG, String.format("BleQueue: internalWrite: device %s length=%d base64=%s", mLogger.sensitiveObject(getMACAddress()), payload.length, mLogger.sensitiveObject(Base64.encodeToString(payload, Base64.DEFAULT))));
            if (mLogger.showSensitiveData()) {
                printLongLog(BleDriver.bytesToHex(payload));
            }
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!characteristic.setValue(payload) || !getBluetoothGatt().writeCharacteristic(characteristic)) {
                        mLogger.e(TAG, String.format("BleQueue: internalWrite failed: device=%s characteristic=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
                        mBleQueue.completedCommand(1);
                        disconnect();
                    } else {
                        mLogger.d(TAG, String.format("BleQueue: internalWrite successful: device=%s characteristic=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
                        //mNrTries++;
                    }
                } else {
                    mLogger.e(TAG, String.format("BleQueue: internalWrite failed: client not connected: device=%s characteristic=%s", mLogger.sensitiveObject(getMACAddress()), characteristic.getUuid()));
                    mBleQueue.completedCommand(1);
                }
            }
        }, callback,0, this::disconnect);

        if (success[0] == false) {
            mLogger.e(TAG, String.format("internalWrite error: device=%s: unable to put code in queue", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            mLogger.e(TAG, "internalWrite: interrupted exception:", e);
        }

        return success[0];
    }

    // write sends payload over the GATT connection.
    // EOD identifies the end of the transfer, useful for the handshake.
    public boolean write(BluetoothGattCharacteristic characteristic, byte[] payload, boolean withEOD) {
        mLogger.v(TAG, String.format("write called: device=%s length=%d characteristicUUID=%s", mLogger.sensitiveObject(getMACAddress()), payload.length, characteristic.getUuid()));

        if (!isClientConnected()) {
            mLogger.e(TAG, "write error: device not connected");
            return false;
        }

        int minOffset = 0;
        int maxOffset;

        // Send data to fit with MTU value
        while (minOffset != payload.length) {
            maxOffset = (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE) > payload.length ? payload.length : (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE);
            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
            minOffset = maxOffset;
            if (!internalWrite(characteristic, toWrite)) {
                mLogger.e(TAG, String.format("write payload failed: device=%s", mLogger.sensitiveObject(getMACAddress())));
                return false;
            }
        }

        if (withEOD && !internalWrite(characteristic, EOD.getBytes())) {
            mLogger.e(TAG, String.format("write EOD failed: device=%s", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }
        return true;
    }

    public byte[] createRandomBytes(int len) {
        Random rd = new Random();
        byte[] arr = new byte[len];

        rd.nextBytes(arr);
//        mLogger.d(TAG, String.format("getRandomBytes: device=%s bytes=%s", mLogger.sensitiveObject(getMACAddress()), BleDriver.bytesToHex(arr)));
        return arr;
    }

    // Test contains 2 steps:
    // 1) client sends local PID and waits for receiving remote PID
    // 2) client sends remote PID in response of 1) to the server
    private boolean testL2capConnection() {
        mL2capHandshakeStepStatus = false;
        mL2capHandshakeRcvData = new ByteArrayOutputStream();
        mL2capHandshakeLatch = new CountDownLatch(1);

        // step 1
        startTimer(() -> {
            mLogger.i(TAG, "testL2capConnection: timer fired, L2CAP will be not used");
            mL2capHandshakeLatch.countDown();
        }, 10000);

        mL2capHandshakeData = createRandomBytes(L2CAP_HANDSHAKE_DATA_LEN);
        if (!l2capWrite(mL2capHandshakeData)) {
            cancelTimer();
            mL2capHandshakeLatch = null;
            mL2capHandshakeData = null;
            return false;
        }

        // wait that l2capRead receives the remote PID
        try {
            mL2capHandshakeLatch.await();
        } catch (InterruptedException e) {
            mLogger.e(TAG, "testL2capConnection: interrupted exception:", e);
            cancelTimer();
            mL2capHandshakeLatch = null;
            mL2capHandshakeData = null;
            return false;
        }

        mL2capHandshakeLatch = null;
        mL2capHandshakeData = null;

        // step 2
        if (mL2capHandshakeStepStatus) {
            if (!l2capWrite(mRemotePID.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            mLogger.d(TAG, String.format("testL2capConnection: client handshake completed: device=%s", mLogger.sensitiveObject(getMACAddress())));
            return true;
        }

        return false;
    }

    private boolean createL2capSocket() {
        mLogger.d(TAG, String.format("createL2capSocket called: device=%s", mLogger.sensitiveObject(getMACAddress())));
        boolean success = false;
        mUseL2cap = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (mPSM != 0) {
                try {
                    mLogger.d(TAG, String.format("createL2capSocket: createInsecureL2capChannel: device=%s", mLogger.sensitiveObject(getMACAddress())));
                    mBluetoothSocket = getBluetoothDevice().createInsecureL2capChannel(mPSM);
                    mBluetoothSocket.connect();

                    try {
                        mInputStream = mBluetoothSocket.getInputStream();
                        mOutputStream = mBluetoothSocket.getOutputStream();

                        Thread l2capThread = new Thread(() -> {
                            l2capRead();
                        });
                        l2capThread.start();

                        mL2capClientHandshakeStarted = true;
                        success = testL2capConnection();
                        mL2capClientHandshakeStarted = false;

                        // wait that server complete L2CAP tests
                        Thread.sleep(2000);
                    } catch (IOException e) {
                        mLogger.e(TAG, String.format("createL2capSocket error: createInsecureL2capChannel cannot get stream device=%s", mLogger.sensitiveObject(getMACAddress())), e);
                        try {
                            mBluetoothSocket.close();
                        } catch (IOException ioException) {
                            // ignore
                        } finally {
                            mBluetoothSocket = null;
                            mInputStream = null;
                            mOutputStream = null;
                        }
                    } catch (InterruptedException e) {
                        mLogger.e(TAG, String.format("createL2capSocket error: device=%s: sleep error:", mLogger.sensitiveObject(getMACAddress())), e);
                    }
                } catch (IOException e) {
                    mLogger.e(TAG, String.format("handleClientPIDReceived error: createInsecureL2capChannel cannot connect device=%s", mLogger.sensitiveObject(getMACAddress())), e);
                }
            }
        }

        return success;
    }

    private boolean discoverServices() {
        mLogger.v(TAG, String.format("discoverServices called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        boolean result = false;

        if (!isClientConnected()) {
            mLogger.e(TAG, String.format("discoverServices error: device not connected: device=%s", mLogger.sensitiveObject(getMACAddress())));
            return false;
        }

        synchronized (mLockClient) {
            if (isClientConnected()) {
                result = BleDriver.mainHandler.postDelayed(() -> {
                    mLogger.d(TAG, String.format("mainQueue: discovering services: device=%s", mLogger.sensitiveObject(getMACAddress())));
                    synchronized (mLockClient) {
                        if (!isClientConnected()) {
                            mLogger.e(TAG, String.format("mainQueue: discoverServices error: device not connected: device=%s", mLogger.sensitiveObject(getMACAddress())));
                        } else if (!getBluetoothGatt().discoverServices()) {
                            mLogger.d(TAG, String.format("mainQueue: discoverServices error: failed to start for device %s", mLogger.sensitiveObject(getMACAddress())));
                        }
                    }
                }, 2500);
                if (!result) {
                    mLogger.e(TAG, String.format("discoverServices error: can't add job in queue: device=%s", mLogger.sensitiveObject(getMACAddress())));
                }
            } else {
                mLogger.e(TAG, String.format("discoverServices error: client not connected: device=%s", mLogger.sensitiveObject(getMACAddress())));
            }
        }
        return result;
    }

    private boolean requestMtu(final int mtu) {
        mLogger.v(TAG, "requestMtu called");

        if (mtu < DEFAULT_MTU || mtu > MAX_MTU) {
            mLogger.e(TAG, "mtu must be between 23 and 517");
            return false;
        }

        if (!isClientConnected()) {
            mLogger.e(TAG, "request mtu failed: device not connected");
            return false;
        }

        return mBleQueue.add(() -> {
            mLogger.v(TAG, String.format("BleQueue: requestMtu: device %s", mLogger.sensitiveObject(getMACAddress())));
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!getBluetoothGatt().requestMtu(mtu)) {
                        mLogger.e(TAG, "requestMtu failed");
                        mBleQueue.completedCommand(1);
                    }
                } else {
                    mLogger.e(TAG, "request MTU failed: device not connected");
                    mBleQueue.completedCommand(1);
                }
            }
        }, null,0, this::disconnect);
    }

    public int getMtu() {
        return mMtu;
    }

    public void setMtu(int mtu) {
        mMtu = mtu;
    }

    public void flushServerDataCache() {
        mLogger.v(TAG, String.format("flushServerDataCache called: device=%s", mLogger.sensitiveObject(getMACAddress())));

        byte[] payload;
        while ((payload = mDataCache.poll()) != null) {
            mLogger.d(TAG, String.format("flushServerDataCache: device=%s base64=%s value=%s length=%d", mLogger.sensitiveObject(getMACAddress()), mLogger.sensitiveObject(Base64.encodeToString(payload, Base64.DEFAULT)), mLogger.sensitiveObject(BleDriver.bytesToHex(payload)), payload.length));
            BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
        }
    }

    // handshake identifies the berty service and their characteristic, and exchange the peerID each other.
    private void handshake() {
        mLogger.d(TAG, "handshake: called");

        if (takeBertyService()) {
            if (takeBertyCharacteristics()) {

                // send local PID
                if (!write(getPIDCharacteristic(), mLocalPID.getBytes(), true)) {
                    mLogger.e(TAG, String.format("handshake error: device=%s: failed to send local PID", mLogger.sensitiveObject(getMACAddress())));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                // get remote PID
                if (!read(getPIDCharacteristic())) {
                    mLogger.e(TAG, String.format("handshake error: device=%s: failed to read remote PID", mLogger.sensitiveObject(getMACAddress())));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                // try to enable L2CAP
                if (!(mUseL2cap = createL2capSocket())) {
                    mLogger.w(TAG, String.format("handshake error: device=%s: failed to negotiate L2CAP", mLogger.sensitiveObject(getMACAddress())));
                }

                if (!setNotify(mWriterCharacteristic, true)) {
                    mLogger.e(TAG, String.format("handshake error: device=%s: failed to enable notifications", mLogger.sensitiveObject(getMACAddress())));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                if (!isClientConnected() || mBleDriver.peerManager().registerDevice(getRemotePID(), this, true) == null) {
                    mLogger.e(TAG, String.format("handshake error: device=%s: registerDevice failed", mLogger.sensitiveObject(getMACAddress())));
                    closeClient();
                }

                // Complete this connection and allow to proceed an another pending connection
                mConnectionLatch.countDown();
                return;
            }
        }
        mLogger.e(TAG, String.format("handshake error: failed to find berty service: device=%s", mLogger.sensitiveObject(getMACAddress())));
        disconnect();
    }

    public void putInDataBuffer(byte[] value) {
        if (mInDataBuffer == null) {
            mInDataBuffer = new byte[0];
        }

        byte[] tmp = new byte[mInDataBuffer.length + value.length];
        System.arraycopy(mInDataBuffer, 0, tmp, 0, mInDataBuffer.length);
        System.arraycopy(value, 0, tmp, mInDataBuffer.length, value.length);

        mInDataBuffer = tmp;
    }

    private void printLongLog(@NonNull String message) {
        if (message.length() > 4000) {
            mLogger.v(TAG, "message.length = " + message.length());
            int chunkCount = message.length() / 4000;     // integer division
            for (int i = 0; i <= chunkCount; i++) {
                int max = 4000 * (i + 1);
                if (max >= message.length()) {
                    mLogger.v(TAG, "chunk " + i + " of " + chunkCount + ":" + message.substring(4000 * i));
                } else {
                    mLogger.v(TAG, "chunk " + i + " of " + chunkCount + ":" + message.substring(4000 * i, max));
                }
            }
        } else {
            mLogger.v(TAG, message);
        }
    }

    public enum CONNECTION_STATE {
        DISCONNECTED,
        CONNECTED,
        CONNECTING,
        DISCONNECTING
    }
}
