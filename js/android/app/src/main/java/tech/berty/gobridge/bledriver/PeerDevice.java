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
import android.util.Log;

import androidx.annotation.NonNull;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
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
                Log.v(TAG, String.format("onConnectionStateChange(): device=%s status=%d newState=%d", gatt.getDevice().getAddress(), status, newState));
                BluetoothDevice device = gatt.getDevice();

                cancelTimer();

                if (status == GATT_SUCCESS) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        Log.i(TAG, String.format("onConnectionStateChange(): connected: device=%s", device.getAddress()));

                        if (getClientState() != CONNECTION_STATE.CONNECTING) {
                            Log.w(TAG, String.format("onConnectionStateChange: device status error: device=%s status=%s newState=CONNECTED", getMACAddress(), getClientState()));
//                            mConnectionLatch.countDown();
                            // duplicate callback, just ignore it.
                            return;
                        }
                        setClientState(CONNECTION_STATE.CONNECTED);

                        if (gatt.getService(GattServer.SERVICE_UUID) == null) {
                            if (!discoverServices()) {
                                Log.e(TAG, String.format("onConnectionStateChange error: failed to launch service discovering: device=%s", getMACAddress()));
                                disconnect();
                            }
                        } else {
                            // Speed up connection
                            requestMtu(PeerDevice.MAX_MTU);
                        }
                    } else {
                        Log.d(TAG, String.format("onConnectionStateChange: disconnected: device=%s", device.getAddress()));

                        setClientState(CONNECTION_STATE.DISCONNECTED);
                        closeClient();
                    }
                } else {
                    Log.e(TAG, String.format("onConnectionStateChange(): status error=%d for device %s", status, device.getAddress()));

                    setClientState(CONNECTION_STATE.DISCONNECTED);
                    closeClient();
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                super.onServicesDiscovered(gatt, status);
                Log.v(TAG, String.format("onServicesDiscovered for device %s", getMACAddress()));

                if (status != GATT_SUCCESS) {
                    Log.e(TAG, String.format("service discovery failed due to internal error '%s', disconnecting", status));
                    disconnect();
                } else {
                    Log.i(TAG, String.format("discovered %d services: device=%s", gatt.getServices().size(), mBluetoothDevice.getAddress()));
                    // Speed up connection
                    requestMtu(PeerDevice.MAX_MTU);
                }
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt,
                                             BluetoothGattCharacteristic characteristic,
                                             int status) {
                super.onCharacteristicRead(gatt, characteristic, status);
                Log.v(TAG, String.format("onCharacteristicRead: device=%s", getMACAddress()));

                if (status != GATT_SUCCESS) {
                    Log.e(TAG, String.format("onCharacteristicRead error: device=%s status=%d", getMACAddress(), status));
                    disconnect();
                    mBleQueue.completedCommand(status);
                    return;
                }
                if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                    byte[] value = characteristic.getValue();
                    if (value.length == 0) {
                        Log.d(TAG, "onCharacteristicRead(): received data length is null");
                        mBleQueue.completedCommand(STATUS_ERROR);
                        return;
                    } else {
                        Log.v(TAG, String.format("onCharacteristicRead: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length));
                        boolean success = BleDriver.mCallbacksHandler.post(() -> {
                            Log.v(TAG, String.format("onCharacteristicRead in thread: device=%s", getMACAddress()));
                            boolean ret = handleClientPIDReceived(value);
                            mBleQueue.completedCommand(ret ? STATUS_SUCCESS : STATUS_ERROR);
                        });

                        if (!success) {
                            Log.e(TAG, "onCharacteristicRead error: handler.post() failed");
                            disconnect();
                            mBleQueue.completedCommand(STATUS_ERROR);
                        }
                    }
                } else {
                    Log.e(TAG, "onCharacteristicRead(): wrong read characteristic");
                    disconnect();
                    mBleQueue.completedCommand(STATUS_ERROR);
                }
            }

            @Override
            public void onCharacteristicWrite(BluetoothGatt gatt,
                                              BluetoothGattCharacteristic characteristic,
                                              int status) {
                super.onCharacteristicWrite(gatt, characteristic, status);
                Log.v(TAG, String.format("onCharacteristicWrite for device %s", getMACAddress()));

                if (status != GATT_SUCCESS) {
                    Log.e(TAG, String.format("onCharacteristicWrite error: device=%s status=%d", getMACAddress(), status));
                    disconnect();
                }

                mBleQueue.completedCommand(status);
            }

            @Override
            public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                super.onMtuChanged(gatt, mtu, status);
                Log.d(TAG, String.format("onMtuChanged(): mtu %s for device %s", mtu, getMACAddress()));

                if (status != GATT_SUCCESS) {
                    Log.e(TAG, "onMtuChanged() error: transmission error");
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
                Log.v(TAG, String.format("onCharacteristicChanged: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length));

                handleDataReceived(value);
            }

            @Override
            public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorRead(gatt, descriptor, status);

                Log.v(TAG, String.format("onDescriptorRead: device=%s", getMACAddress()));
            }

            @Override
            public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                super.onDescriptorWrite(gatt, descriptor, status);

                Log.v(TAG, String.format("onDescriptorWrite: device=%s status=%d", getMACAddress(), status));
                mBleQueue.completedCommand(status);
            }
        };

    public PeerDevice(@NonNull Context context, @NonNull BluetoothDevice bluetoothDevice, String localPID, boolean isClient) {
        mContext = context;
        mBluetoothDevice = bluetoothDevice;
        mLocalPID = localPID;
        mIsClient = isClient;
        mBleQueue = new BleQueue(BleDriver.mainHandler);
        mWriteQueue = new BleQueue(BleDriver.mWriteHandler);
        mReadQueue = new BleQueue(BleDriver.mReadHandler);
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
    public java.lang.String toString() {
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
        Log.v(TAG, String.format("startConnectionTimer called: device=%s", getMACAddress()));

        cancelTimer();
        mTimeoutRunnable = task;

        BleDriver.mainHandler.postDelayed(mTimeoutRunnable, delay);
    }

    private void cancelTimer() {
        Log.v(TAG, String.format("cancelTimer called: device=%s", getMACAddress()));
        if (mTimeoutRunnable != null) {
            BleDriver.mainHandler.removeCallbacks(mTimeoutRunnable);
            mTimeoutRunnable = null;
        }
    }

    // GATT connection is enqueued to not avoid ongoing GATT operation, between this operation and its callback
    // API 23 minimum for connectGatt()
    public void connectToDevice(boolean autoConnect, CountDownLatch countDown) {
        Log.v(TAG, "connectToDevice: add to main queue: device=" + getMACAddress());

        if (checkAndSetClientState(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.CONNECTING)) {
            boolean status = BleDriver.mainHandler.postDelayed(() -> {
                Log.d(TAG, "connectToDevice: connecting to device=" + getMACAddress());
                mConnectionLatch = countDown;
                setBluetoothGatt(mBluetoothDevice.connectGatt(mContext, autoConnect,
                    mGattCallback, BluetoothDevice.TRANSPORT_LE));

                startTimer(() -> {
                    Log.i(TAG, String.format("timer fired: cancel connection: device=%s", getMACAddress()));

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
                Log.e(TAG, String.format("connectToDevice error: can't add in job queue: device=%s", getMACAddress()));
                countDown.countDown();
            }
        } else {
            Log.v(TAG, String.format("connectToDevice canceled, device %s is not disconnected", getMACAddress()));
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
            Log.d(TAG, String.format("disconnect called: client device=%s", getMACAddress()));

            synchronized (mLockClient) {
                if (mClientState == CONNECTION_STATE.CONNECTED || mClientState == CONNECTION_STATE.CONNECTING) {
                    mClientState = CONNECTION_STATE.DISCONNECTING;
                } else {
                    Log.d(TAG, String.format("disconnect: client device=%s not connected", getMACAddress()));
                    return ;
                }
            }

            if (mBluetoothGatt != null) {
                Log.i(TAG, String.format("disconnect: device=%s is disconnecting", getMACAddress()));
                getBluetoothGatt().disconnect(); // onConnectionStateChange will be called
            } else {
                Log.e(TAG, String.format("disconnect error: device=%s: bluetoothGatt object is null", getMACAddress()));
            }

            // The client side needs to set the state server too
            synchronized (mLockServer) {
                mServerState = CONNECTION_STATE.DISCONNECTING;
            }
        } else {
            Log.d(TAG, String.format("disconnect: server device=%s", getMACAddress()));

            // We cannot disconnect from the server side, but we can reject future GATT operations
            synchronized (mLockServer) {
                if (mServerState == CONNECTION_STATE.CONNECTED) {
                    mServerState = CONNECTION_STATE.DISCONNECTING;
                } else {
                    Log.d(TAG, String.format("disconnect: server device=%s not connected", getMACAddress()));
                    return ;
                }
            }

            closeServer();
        }
    }

    private void closeL2cap() {
        if (mBluetoothSocket != null) {
            Log.d(TAG, String.format("closeL2cap called: device=%s", getMACAddress()));
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
                Log.e(TAG, String.format("disconnect: device=%s: error when closing l2cap channel", getMACAddress()));
            }
        }
    }

    public void closeClient() {
        Log.d(TAG, String.format("closeClient called: device=%s", getMACAddress()));

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

        PeerManager.unregisterDevices(mRemotePID);
        setPeer(null);
    }

    public void closeServer() {
        Log.d(TAG, String.format("closeServer called: device=%s", getMACAddress()));

        closeL2cap();

        mBleQueue.clear();
        mWriteQueue.clear();
        mReadQueue.clear();

        mInDataBuffer = null;

        if (mPeer != null) {
            PeerManager.unregisterDevices(mRemotePID);
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
            Log.v(TAG, String.format("setClientState called: device=%s state=%s", getMACAddress(), state));
            mClientState = state;
        }
    }

    private boolean checkAndSetClientState(CONNECTION_STATE state, CONNECTION_STATE newState) {
        Log.v(TAG, String.format("checkAndSetClientState called for device %s, state=%s newState=%s", getMACAddress(), state, newState));
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
            Log.v(TAG, String.format("setServerState called: device=%s state=%s", getMACAddress(), state));
            mServerState = state;
        }
    }

    public boolean checkAndSetServerState(CONNECTION_STATE state, CONNECTION_STATE newState) {
        Log.v(TAG, String.format("checkAndSetServerState called for device %s, state=%s newState=%s", getMACAddress(), state, newState));
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
        Log.d(TAG, String.format("setRemotePID called: device=%s remotePID=%s", getMACAddress(), peerID));
        synchronized (mLockRemotePID) {
            if (mRemotePID != null && !mRemotePID.equals(peerID)) {
                Log.w(TAG, String.format("setRemotePID error: PID already set is different: device=%s oldPID=%s newPID=%s", getMACAddress(), mRemotePID, peerID));
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
                    Log.w(TAG, "l2capRead: socket not connected");
                    return;
                }
                if (mInputStream == null || ((size = mInputStream.read(buffer, 0, L2CAP_BUFFER)) == -1)) {
                    Log.e(TAG, String.format("l2capRead stream error: device=%s ", getMACAddress()));
                    return;
                }
            } catch (IOException e) {
                Log.e(TAG, String.format("l2capRead catch error: device=%s ", getMACAddress()), e);
                return;
            }
            byte[] payload = Arrays.copyOfRange(buffer, 0, size);
            Log.v(TAG, String.format("l2capRead: read from l2cap: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));

            // L2CAP handshake
            if (mL2capClientHandshakeStarted) {
                try {
                    mL2capHandshakeRcvData.write(payload);
                } catch (IOException e) {
                    Log.e(TAG, String.format("l2capRead: L2cap client handshake OutputStream error: error=%s device=%s payload=%s remotePID=%s", e, getMACAddress(), BleDriver.bytesToHex(payload), BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8))));
                    cancelTimer();
                    mL2capHandshakeLatch.countDown();
                }

                if (mL2capHandshakeRcvData.size() < L2CAP_HANDSHAKE_DATA_LEN) {
                    Log.d(TAG, String.format("l2capRead: L2cap client handshake received incomplete payload: device=%s", getMACAddress()));
                } else if (mL2capHandshakeRcvData.size() == L2CAP_HANDSHAKE_DATA_LEN) {
                    if (Arrays.equals(mL2capHandshakeRcvData.toByteArray(), mL2capHandshakeData)) {
                        Log.d(TAG, String.format("l2capRead: L2cap client handshake received payload: device=%s", getMACAddress()));
                        mL2capHandshakeStepStatus = true;
                        cancelTimer();
                        mL2capHandshakeLatch.countDown();
                    } else {
                        Log.e(TAG, String.format("l2capRead: L2cap client handshake received wrong payload: device=%s payload=%s remotePID=%s", getMACAddress(), BleDriver.bytesToHex(payload), BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8))));
                        cancelTimer();
                        mL2capHandshakeLatch.countDown();
                        disconnect();
                    }
                } else {
                    Log.e(TAG, String.format("l2capRead: L2cap client handshake received bigger payload than expected: device=%s payload=%s remotePID=%s", getMACAddress(), BleDriver.bytesToHex(payload), BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8))));
                }
            } else if (mL2capServerHandshakeStarted) {
                if (!mL2capHandshakeStepStatus) {
                    // Server step 1
                    Log.d(TAG, String.format("l2capRead: L2cap server handshake received payload, going to write it back: device=%s", getMACAddress()));

                    mL2capHandshakeRcvDataLen += payload.length;
                    if (mL2capHandshakeRcvDataLen == L2CAP_HANDSHAKE_DATA_LEN) {
                        mL2capHandshakeStepStatus = true;
                        mL2capHandshakeRcvDataLen = 0;
                    }

                    if (!l2capWrite(payload)) {
                        Log.e(TAG, String.format("l2cap server handshake: write failed: device=%s", getMACAddress()));
                        mL2capHandshakeStepStatus = false;
                        mL2capServerHandshakeStarted = false;
                    }
                } else if (mL2capHandshakeStepStatus && Arrays.equals(payload, mLocalPID.getBytes(StandardCharsets.UTF_8))) { // server step 2
                    Log.d(TAG, String.format("l2capRead: L2cap server handshake received second payload: device=%s", getMACAddress()));
                    mL2capServerHandshakeStarted = false;
                    mUseL2cap = true;
                } else {
                    Log.e(TAG, String.format("l2capRead: L2cap server handshake received wrong payload: device=%s payload=%s remotePID=%s", getMACAddress(), BleDriver.bytesToHex(payload), BleDriver.bytesToHex(mRemotePID.getBytes(StandardCharsets.UTF_8))));
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
        Log.v(TAG, String.format("handleDataReceived: device=%s", getMACAddress()));

        Peer peer;
        if ((peer = getPeer()) == null) {
            Log.e(TAG, String.format("handleDataReceived error: Peer not found: peer=%s device=%s", getRemotePID(), getMACAddress()));
            return false;
        }

        if (peer.isHandshakeSuccessful()) {
            return mReadQueue.add(() -> {
                BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
                mReadQueue.completedCommand(STATUS_SUCCESS);
            }, null, 0, this::disconnect);
        } else {
            Log.d(TAG, String.format("handleDataReceived: device=%s not ready, putting in cache", getMACAddress()));
            return mDataCache.offer(payload);

        }
    }

    public synchronized boolean handleServerPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleServerPIDReceived called: device=%s", getMACAddress()));

        if (getPeer() != null) {
            Log.e(TAG, String.format("handleServerPIDReceived error: device=%s: handshake already completed", getMACAddress()));
            disconnect();
            return false;
        }

        if (new String(payload).equals(EOD)) {
            Log.d(TAG, String.format("handleServerPIDReceived: device=%s EOD received", getMACAddress()));

            if (mInDataBuffer == null) {
                return false;
            }

            String remotePID = new String(mInDataBuffer);
            mInDataBuffer = null;

            setRemotePID(remotePID);
            setId(BleDriver.idFromPid(remotePID));
        } else {
            Log.d(TAG, String.format("handleServerPIDReceived: device=%s add data to buffer", getMACAddress()));
            putInDataBuffer(payload);
        }
        return true;
    }

    private boolean setNotify(BluetoothGattCharacteristic characteristic, final boolean enable) {
        Log.d(TAG, String.format("setNotify called: device=%s", getMACAddress()));

        if (!isClientConnected()) {
            Log.e(TAG, "setNotify error: device not connected");
            return false;
        }

        // Get the CCC Descriptor for the characteristic
        final BluetoothGattDescriptor descriptor = characteristic.getDescriptor(CCC_DESCRIPTOR_UUID);
        if(descriptor == null) {
            Log.e(TAG, String.format("setNotify error: device=%s: cannot get CCC descriptor for characteristic=%s", getMACAddress(), characteristic.getUuid()));
            return false;
        }

        // Check if characteristic has NOTIFY or INDICATE properties and set the correct byte value to be written
        byte[] value;
        int properties = characteristic.getProperties();
        if ((properties & PROPERTY_NOTIFY) > 0) {
            value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE;
        } else {
            Log.e(TAG, String.format("setNotify error: device=%s: characteristic=%s does not have notify property", getMACAddress() , characteristic.getUuid()));
            return false;
        }
        final byte[] finalValue = enable ? value : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;

        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            Log.d(TAG, "setNotify: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        // turn on/off the notification in queue
        success[0] = mBleQueue.add(() -> {
            if (!isClientConnected()) {
                Log.e(TAG, "setNotify error: device not connected");
                mBleQueue.completedCommand(STATUS_ERROR);
                return;
            }

            // set notification for Gatt object
            if(!mBluetoothGatt.setCharacteristicNotification(characteristic, enable)) {
                Log.e(TAG, String.format("setNotify error: device=%s: setCharacteristicNotification failed for characteristic=%s", getMACAddress(), characteristic.getUuid()));
                mBleQueue.completedCommand(STATUS_ERROR);
                return ;
            }

            // write to descriptor to complete process
            descriptor.setValue(finalValue);
            if(!mBluetoothGatt.writeDescriptor(descriptor)) {
                Log.e(TAG, String.format("setNotify error: device=%s: writeDescriptor failed for descriptor=%s", descriptor.getUuid()));
                mBleQueue.completedCommand(STATUS_ERROR);
            }
        }, callback, 0, this::disconnect);

        if (success[0] == false) {
            Log.e(TAG, String.format("setNotify error: device=%s: unable to put code in queue", getMACAddress()));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "setNotify: interrupted exception:", e);
        }

        return success[0];
}

    public synchronized boolean handleClientPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleClientPIDReceived for device=%s base64=%s payload=%s", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload)));

        Peer peer;
        String remotePID;

        ByteArrayInputStream bis = new ByteArrayInputStream(Arrays.copyOfRange(payload, 0, 4));
        DataInputStream dis = new DataInputStream(bis);
        try {
            mPSM = dis.readInt();
        } catch (IOException e) {
            Log.e(TAG, String.format("handleClientPIDReceived error: ByteArrayInputStream failed for device=%s", getMACAddress()));
            return false;
        } finally {
            try {
                bis.close();
            } catch (IOException e) {
                // ignore
            }
        }
        remotePID = new String(Arrays.copyOfRange(payload, 4, payload.length));
        Log.d(TAG, String.format("handleClientPIDReceived: got PSM=%d remotePID=%s for device=%s", mPSM, remotePID, getMACAddress()));
        setRemotePID(remotePID);

        // TODO: not necessary?
        peer = PeerManager.getPeer(remotePID);
        setPeer(peer);

        return true;
    }

    // takeBertyService get the Berty service in the list of services
    private boolean takeBertyService() {
        Log.v(TAG, String.format("takeBertyService: called for device %s", getMACAddress()));

        setBertyService(getBluetoothGatt().getService(GattServer.SERVICE_UUID));

        if (getBertyService() == null) {
            Log.i(TAG, String.format("Berty service not found for device=%s", getMACAddress()));
            return false;
        }

        Log.d(TAG, String.format("Berty service found for device=%s", getMACAddress()));
        return true;
    }

    // checkCharacteristicProperties checks if the characteristics have correct permissions (read/write).
//    private boolean checkCharacteristicProperties(BluetoothGattCharacteristic characteristic,
//                                                  int properties) {
//        Log.d(TAG, "checkCharacteristicProperties: device: " + getMACAddress());
//
//        if (characteristic.getProperties() == properties) {
//            Log.d(TAG, "checkCharacteristicProperties() match, device: " + getMACAddress());
//            return true;
//        }
//        Log.e(TAG, "checkCharacteristicProperties() doesn't match: " + characteristic.getProperties() + " / " + properties + ", device: " + getMACAddress());
//        return false;
//    }

    // takeBertyCharacteristics checks if the service has the two characteristics expected.
    private boolean takeBertyCharacteristics() {
        Log.v(TAG, String.format("takeBertyCharacteristic called for device=%s", getMACAddress()));

        List<BluetoothGattCharacteristic> characteristics = getBertyService().getCharacteristics();
        for (BluetoothGattCharacteristic characteristic : characteristics) {
            if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                Log.d(TAG, String.format("PID characteristic found for device %s", getMACAddress()));
                setPIDCharacteristic(characteristic);
            } else if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                Log.d(TAG, String.format("writer characteristic found for device=%s", getMACAddress()));
                setWriterCharacteristic(characteristic);
            }
        }

        if (getPIDCharacteristic() != null && getWriterCharacteristic() != null) {
            return true;
        }

        Log.e(TAG, String.format("reader/writer characteristics not found for device %s", getMACAddress()));
        return false;
    }

    public boolean read(BluetoothGattCharacteristic characteristic) {
        Log.v(TAG, String.format("read() called for device %s characteristicUUID=%s", getMACAddress(), characteristic.getUuid()));

        final boolean[] success = {false};

        if (!isClientConnected()) {
            Log.e(TAG, String.format("read error: not connected: device=%s", getMACAddress()));
            return false;
        }

        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            Log.d(TAG, "read: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        success[0] = mBleQueue.add(() -> {
            Log.v(TAG, String.format("BleQueue: read: device=%s characteristicUUID=%s", getMACAddress(), characteristic.getUuid()));
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!getBluetoothGatt().readCharacteristic(characteristic)) {
                        Log.e(TAG, String.format("BleQueue: read error: characteristic=%s", characteristic.getUuid()));
                        mBleQueue.completedCommand(1);
                        disconnect();
                    } else {
                        Log.d(TAG, String.format("BleQueue: read successful: characteristic=%s", characteristic.getUuid()));
                        //mNrTries++;
                    }
                } else {
                    Log.e(TAG, String.format("BleQueue: read error: client not connected: device=%s", getMACAddress()));
                    mBleQueue.completedCommand(1);
                }
            }
        }, callback, 0, this::disconnect);

        if (success[0] == false) {
            Log.e(TAG, String.format("read error: device=%s: unable to put code in queue", getMACAddress()));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "read: interrupted exception:", e);
        }

        return success[0];
    }

    public boolean l2capWrite(byte[] payload) {
        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            Log.d(TAG, "l2capWrite: callback called");
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

                    Log.v(TAG, String.format("l2capWrite: device=%s payload length=%d", getMACAddress(), payload.length));
                    // Send data to fit with MTU value
                    while (minOffset != payload.length) {
                        if ((isClientConnected() || isServerConnected()) && mBluetoothSocket != null && mBluetoothSocket.isConnected() && mOutputStream != null && mInputStream != null) {
                            maxOffset = (minOffset + L2CAP_MPS) > payload.length ? payload.length : (minOffset + L2CAP_MPS);
                            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
                            Log.v(TAG, String.format("l2capWrite: device=%s chunk=%d/%d minOffset=%d maxOffset=%d length=%d base64=%s", getMACAddress(), ++i, nbOfChunk, minOffset, maxOffset, toWrite.length, Base64.encodeToString(toWrite, Base64.DEFAULT)));
                            minOffset = maxOffset;
                            printLongLog(BleDriver.bytesToHex(toWrite));
                            mOutputStream.write(toWrite);
                        }
                    }
                    mWriteQueue.completedCommand(STATUS_SUCCESS);
                } catch (IOException e) {
                    Log.e(TAG, String.format("l2capWrite error: device=%s", getMACAddress()), e);
                    try {
                        mOutputStream.close();
                        mInputStream.close();
                        mBluetoothSocket.close();
                    } catch (IOException ioException) {
                        Log.e(TAG, String.format("l2capWrite error: failed to close l2cap socket: device=%s", getMACAddress()), e);
                    }
                    mBluetoothSocket = null;
                    mOutputStream = null;
                    mInputStream = null;
                    mWriteQueue.completedCommand(STATUS_ERROR);
                }
            }, callback, 0, this::disconnect);

            if (success[0] == false) {
                Log.e(TAG, String.format("l2capWrite error: device=%s: unable to put code in queue", getMACAddress()));
                return false;
            }

            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                Log.e(TAG, "l2capWrite: interrupted exception:", e);
            }
        }

        return success[0];
    }

    public boolean internalWrite(BluetoothGattCharacteristic characteristic, byte[] payload) {
        final boolean[] success = {false};
        CountDownLatch countDownLatch = new CountDownLatch(1);
        BleQueue.Callback callback = new BleQueue.Callback();
        callback.setTask(() -> {
            Log.d(TAG, "internalWrite: callback called");
            success[0] = callback.getStatus() == GATT_SUCCESS;
            countDownLatch.countDown();
        });

        success[0] = mBleQueue.add(() -> {
            Log.v(TAG, String.format("BleQueue: internalWrite: device %s length=%d base64=%s", getMACAddress(), payload.length, Base64.encodeToString(payload, Base64.DEFAULT)));
            printLongLog(BleDriver.bytesToHex(payload));
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!characteristic.setValue(payload) || !getBluetoothGatt().writeCharacteristic(characteristic)) {
                        Log.e(TAG, String.format("BleQueue: internalWrite failed: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                        mBleQueue.completedCommand(1);
                        disconnect();
                    } else {
                        Log.d(TAG, String.format("BleQueue: internalWrite successful: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                        //mNrTries++;
                    }
                } else {
                    Log.e(TAG, String.format("BleQueue: internalWrite failed: client not connected: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                    mBleQueue.completedCommand(1);
                }
            }
        }, callback,0, this::disconnect);

        if (success[0] == false) {
            Log.e(TAG, String.format("internalWrite error: device=%s: unable to put code in queue", getMACAddress()));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "internalWrite: interrupted exception:", e);
        }

        return success[0];
    }

    // write sends payload over the GATT connection.
    // EOD identifies the end of the transfer, useful for the handshake.
    public boolean write(BluetoothGattCharacteristic characteristic, byte[] payload, boolean withEOD) {
        Log.v(TAG, String.format("write called: device=%s length=%d characteristicUUID=%s", getMACAddress(), payload.length, characteristic.getUuid()));

        if (!isClientConnected()) {
            Log.e(TAG, "write error: device not connected");
            return false;
        }

        int minOffset = 0;
        int maxOffset;

        // Send data to fit with MTU value
        while (minOffset != payload.length) {
            maxOffset = (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE) > payload.length ? payload.length : (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE);
            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
            minOffset = maxOffset;
//            Log.v(TAG, String.format("write: data chunk: device=%s chunk=%d/%d length=%d base64=%s", getMACAddress(), i++, nbOfChunk, toWrite.length, Base64.encodeToString(toWrite, Base64.DEFAULT)));
//            printLongLog(BleDriver.bytesToHex(toWrite));
            if (!internalWrite(characteristic, toWrite)) {
                Log.e(TAG, String.format("write payload failed: device=%s", getMACAddress()));
                return false;
            }
        }

        if (withEOD && !internalWrite(characteristic, EOD.getBytes())) {
            Log.e(TAG, String.format("write EOD failed: device=%s", getMACAddress()));
            return false;
        }
        return true;
    }

    public byte[] createRandomBytes(int len) {
        Random rd = new Random();
        byte[] arr = new byte[len];

        rd.nextBytes(arr);
//        Log.d(TAG, String.format("getRandomBytes: device=%s bytes=%s", getMACAddress(), BleDriver.bytesToHex(arr)));
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
            Log.i(TAG, "testL2capConnection: timer fired, L2CAP will be not used");
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
            Log.e(TAG, "testL2capConnection: interrupted exception:", e);
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

            Log.d(TAG, String.format("testL2capConnection: client handshake completed: device=%s", getMACAddress()));
            return true;
        }

        return false;
    }

    private boolean createL2capSocket() {
        Log.d(TAG, String.format("createL2capSocket called: device=%s", getMACAddress()));
        boolean success = false;
        mUseL2cap = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (mPSM != 0) {
                try {
                    Log.d(TAG, String.format("createL2capSocket: createInsecureL2capChannel: device=%s", getMACAddress()));
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
                        Log.e(TAG, String.format("createL2capSocket error: createInsecureL2capChannel cannot get stream device=%s", getMACAddress()), e);
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
                        Log.e(TAG, String.format("createL2capSocket error: device=%s: sleep error:", getMACAddress()), e);
                    }
                } catch (IOException e) {
                    Log.e(TAG, String.format("handleClientPIDReceived error: createInsecureL2capChannel cannot connect device=%s", getMACAddress()), e);
                }
            }
        }

        return success;
    }

    private boolean discoverServices() {
        Log.v(TAG, String.format("discoverServices called: device=%s", getMACAddress()));

        boolean result = false;

        if (!isClientConnected()) {
            Log.e(TAG, String.format("discoverServices error: device not connected: device=%s", getMACAddress()));
            return false;
        }

        synchronized (mLockClient) {
            if (isClientConnected()) {
                result = BleDriver.mainHandler.postDelayed(() -> {
                    Log.d(TAG, String.format("mainQueue: discovering services: device=%s", getMACAddress()));
                    synchronized (mLockClient) {
                        if (!isClientConnected()) {
                            Log.e(TAG, String.format("mainQueue: discoverServices error: device not connected: device=%s", getMACAddress()));
                        } else if (!getBluetoothGatt().discoverServices()) {
                            Log.d(TAG, String.format("mainQueue: discoverServices error: failed to start for device %s", getMACAddress()));
                        }
                    }
                }, 2500);
                if (!result) {
                    Log.e(TAG, String.format("discoverServices error: can't add job in queue: device=%s", getMACAddress()));
                }
            } else {
                Log.e(TAG, String.format("discoverServices error: client not connected: device=%s", getMACAddress()));
            }
        }
        return result;
    }

    private boolean requestMtu(final int mtu) {
        Log.v(TAG, "requestMtu called");

        if (mtu < DEFAULT_MTU || mtu > MAX_MTU) {
            Log.e(TAG, "mtu must be between 23 and 517");
            return false;
        }

        if (!isClientConnected()) {
            Log.e(TAG, "request mtu failed: device not connected");
            return false;
        }

        return mBleQueue.add(() -> {
            Log.v(TAG, String.format("BleQueue: requestMtu: device %s", getMACAddress()));
            synchronized (mLockClient) {
                if (isClientConnected()) {
                    if (!getBluetoothGatt().requestMtu(mtu)) {
                        Log.e(TAG, "requestMtu failed");
                        mBleQueue.completedCommand(1);
                    }
                } else {
                    Log.e(TAG, "request MTU failed: device not connected");
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
        Log.v(TAG, String.format("flushServerDataCache called: device=%s", getMACAddress()));

        byte[] payload;
        while ((payload = mDataCache.poll()) != null) {
            Log.d(TAG, String.format("flushServerDataCache: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));
            BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
        }
    }

    // handshake identifies the berty service and their characteristic, and exchange the peerID each other.
    private void handshake() {
        Log.d(TAG, "handshake: called");

        if (takeBertyService()) {
            if (takeBertyCharacteristics()) {

                // send local PID
                if (!write(getPIDCharacteristic(), mLocalPID.getBytes(), true)) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to send local PID", getMACAddress()));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                // get remote PID
                if (!read(getPIDCharacteristic())) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to read remote PID", getMACAddress()));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                // try to enable L2CAP
                if (!(mUseL2cap = createL2capSocket())) {
                    Log.w(TAG, String.format("handshake error: device=%s: failed to negotiate L2CAP", getMACAddress()));
                }

                if (!setNotify(mWriterCharacteristic, true)) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to enable notifications", getMACAddress()));
                    disconnect();
                    mConnectionLatch.countDown();
                    return;
                }

                if (!isClientConnected() || PeerManager.registerDevice(getRemotePID(), this, true) == null) {
                    Log.e(TAG, String.format("handshake error: device=%s: registerDevice failed", getMACAddress()));
                    closeClient();
                }

                // Complete this connection and allow to proceed an another pending connection
                mConnectionLatch.countDown();
                return;
            }
        }
        Log.e(TAG, String.format("handshake error: failed to find berty service: device=%s", getMACAddress()));
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
            Log.v(TAG, "message.length = " + message.length());
            int chunkCount = message.length() / 4000;     // integer division
            for (int i = 0; i <= chunkCount; i++) {
                int max = 4000 * (i + 1);
                if (max >= message.length()) {
                    Log.v(TAG, "chunk " + i + " of " + chunkCount + ":" + message.substring(4000 * i));
                } else {
                    Log.v(TAG, "chunk " + i + " of " + chunkCount + ":" + message.substring(4000 * i, max));
                }
            }
        } else {
            Log.v(TAG, message);
        }
    }

    public enum CONNECTION_STATE {
        DISCONNECTED,
        CONNECTED,
        CONNECTING,
        DISCONNECTING
    }
}
