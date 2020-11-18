package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.util.Log;

import androidx.annotation.NonNull;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import static android.bluetooth.BluetoothDevice.BOND_BONDED;
import static android.bluetooth.BluetoothDevice.BOND_BONDING;
import static android.bluetooth.BluetoothDevice.BOND_NONE;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

public class PeerDevice {
    private static final String TAG = "bty.ble.PeerDevice";

    // Mark used to tell all data is transferred
    public static final String EOD = "EOD";

    // Connection timeout
    private static final int CONNECTION_TIMEOUT = 35000;

    // Minimal and default MTU
    private static final int DEFAULT_MTU = 23;

    // Max MTU that Android can handle
    public static final int MAX_MTU = 517;

    public enum CONNECTION_STATE {
        DISCONNECTED,
        CONNECTED,
        CONNECTING,
        DISCONNECTING
    }
    private CONNECTION_STATE mClientState = CONNECTION_STATE.DISCONNECTED;
    private CONNECTION_STATE mServerState = CONNECTION_STATE.DISCONNECTED;


    private Context mContext;
    private BluetoothDevice mBluetoothDevice;
    private BluetoothGatt mBluetoothGatt;
    private BleQueue mBleQueue = new BleQueue();
    private Runnable mTimeoutRunnable;

    private final Object mLockRemotePID = new Object();
    private final Object mLockClient = new Object();
    public final Object mLockServer = new Object();
    private final Object mLockPeer = new Object();

    private BluetoothGattService mBertyService;
    private BluetoothGattCharacteristic mPIDCharacteristic;
    private BluetoothGattCharacteristic mWriterCharacteristic;

    private Peer mPeer;
    private String mRemotePID;
    private String mLocalPID;

    private byte[] mClientBuffer;
    private byte[] mServerBuffer;

    //private int mMtu = 0;
    // default MTU is 23
    private int mMtu = 23;

    public PeerDevice(@NonNull Context context, @NonNull BluetoothDevice bluetoothDevice, String localPID) {
        mContext = context;
        mBluetoothDevice = bluetoothDevice;
        mLocalPID = localPID;
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

    private void startConnectionTimer() {
        Log.v(TAG, String.format("startConnectionTimer called: device=%s", getMACAddress()));

        cancelConnectionTimer();
        mTimeoutRunnable = new Runnable() {
            @Override
            public void run() {
                Log.i(TAG, String.format("mainHandler: startConnectionTimer: cancel connection: device=%s", getMACAddress()));
                disconnect();

                mTimeoutRunnable = null;
            }
        };

        BleDriver.mainHandler.postDelayed(mTimeoutRunnable, CONNECTION_TIMEOUT);
    }

    private void cancelConnectionTimer() {
        Log.v(TAG, String.format("cancelConnectionTimer called: device=%s", getMACAddress()));
        if (mTimeoutRunnable != null) {
            BleDriver.mainHandler.removeCallbacks(mTimeoutRunnable);
            mTimeoutRunnable = null;
        }
    }

    // GATT connection is enqueued to not avoid ongoing GATT operation, between this operation and its callback
    // API 23 minimum for connectGatt()
    public void connectToDevice(boolean autoConnect) {
        Log.d(TAG, "connectToDevice: " + getMACAddress());

        if (checkAndSetClientState(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.CONNECTING)) {
            boolean status = BleDriver.mainHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    Log.d(TAG, "mainQueue: connectToDevice: " + getMACAddress());
                    setBluetoothGatt(mBluetoothDevice.connectGatt(mContext, autoConnect,
                        mGattCallback, BluetoothDevice.TRANSPORT_LE));
                    startConnectionTimer();
                }
            }, 500);
            if (!status) {
                Log.e(TAG, String.format("connectToDevice error: can't add in job queue: device=%s", getMACAddress()));
            }
        } else {
            Log.d(TAG, String.format("connectToDevice canceled, device %s is not disconnected", getMACAddress()));
        }
    }

    public boolean isClientConnected() {
        return getClientState() == CONNECTION_STATE.CONNECTED;
    }

    public boolean isClientDisconnected() {
        return getClientState() == CONNECTION_STATE.DISCONNECTED;
    }

    public void disconnect() {
        Log.v(TAG, String.format("disconnect called: device=%s", getMACAddress()));

        synchronized (mLockClient) {
            if (mClientState == CONNECTION_STATE.CONNECTED || mClientState == CONNECTION_STATE.CONNECTING) {
                mClientState = CONNECTION_STATE.DISCONNECTING;
                if (!BleDriver.mainHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        synchronized (mLockClient) {
                            if (mClientState == CONNECTION_STATE.DISCONNECTING && getBluetoothGatt() != null) {
                                Log.i(TAG, String.format("device=%s client disconnecting", getMACAddress()));
                                getBluetoothGatt().disconnect();
                            }
                        }
                    }
                })) {
                    Log.e(TAG, String.format("disconnect error: adding to queue failed: device=%s", getMACAddress()));
                }
            }
        }
    }

    public void closeClient() {
        Log.v(TAG, String.format("closeClient called: device=%s", getMACAddress()));

        if (getBluetoothGatt() != null) {
            getBluetoothGatt().close();
            setBluetoothGatt(null);
        }

        mBleQueue.clear();

        PeerManager.unregisterDevices(mRemotePID);

        if (getServerState() == CONNECTION_STATE.DISCONNECTED) {
            setPeer(null);
        }
    }

    public void closeServer() {
        Log.v(TAG, String.format("closeServer called: device=%s", getMACAddress()));

        PeerManager.unregisterDevices(getRemotePID());

        if (getClientState() == CONNECTION_STATE.DISCONNECTED) {
            setPeer(null);
        }
    }

    private void setClientState(CONNECTION_STATE state) {
        synchronized (mLockClient) {
            Log.v(TAG, String.format("setClientState called: device=%s state=%s", getMACAddress(), state));
            mClientState = state;
        }
    }

    public CONNECTION_STATE getClientState() {
        synchronized (mLockClient) {
            return mClientState;
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

    public void setServerState(CONNECTION_STATE state) {
        synchronized (mLockServer) {
            Log.v(TAG, String.format("setServerState called: device=%s state=%s", getMACAddress(), state));
            mServerState = state;
        }
    }

    public CONNECTION_STATE getServerState() {
        synchronized (mLockServer) {
            return mServerState;
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

    private synchronized void setBluetoothGatt(BluetoothGatt gatt) {
            mBluetoothGatt = gatt;
    }

    private synchronized BluetoothGatt getBluetoothGatt() {
            return mBluetoothGatt;
    }

    private void setPIDCharacteristic(BluetoothGattCharacteristic peerID) {
        mPIDCharacteristic = peerID;
    }

    private BluetoothGattCharacteristic getPIDCharacteristic() {
        return mPIDCharacteristic;
    }

    private void setWriterCharacteristic(BluetoothGattCharacteristic write) {
        mWriterCharacteristic = write;
    }

    // Public access by BleDriver.SendToPeer()
    public BluetoothGattCharacteristic getWriterCharacteristic() {
        return mWriterCharacteristic;
    }

    private BluetoothGattService getBertyService() {
        return mBertyService;
    }

    private void setBertyService(BluetoothGattService service) {
        mBertyService = service;
    }

    private void setRemotePID(String peerID) {
        Log.v(TAG, String.format("setRemotePID called: device=%s remotePID=%s", getMACAddress(), peerID));
        synchronized (mLockRemotePID) {
            if (mRemotePID != null && !mRemotePID.equals(peerID)) {
                Log.w(TAG, String.format("setRemotePID error: PID already set is different: device=%s oldPID=%s newPID=%s", getMACAddress(), mRemotePID, peerID));
            }
            mRemotePID = peerID;
        }
    }

    public String getRemotePID() {
        synchronized (mLockRemotePID) {
            return mRemotePID;
        }
    }

    private void setPeer(Peer peer) {
        synchronized (mLockPeer) {
            mPeer = peer;
        }
    }

    private Peer getPeer() {
        synchronized (mLockPeer) {
            return mPeer;
        }
    }

    public synchronized void handleServerDataSent() {
        Log.v(TAG, String.format("handleServerDataSent for device %s", getMACAddress()));

        Peer peer;

        if (getRemotePID() == null) {
            Log.e(TAG, String.format("handleServerDataSent error: remotePID not received: device=%s", getMACAddress()));
            return ;
        }
        peer = PeerManager.registerDevice(getRemotePID(), this, false);
        setPeer(peer);
    }

    public synchronized boolean handleServerDataReceived(byte[] payload) {
        Log.v(TAG, String.format("handleServerDataReceived for device %s", getMACAddress()));

        boolean status;

        if (getPeer() == null) {
            Log.e(TAG, String.format("handleServerDataReceived error: Peer not found: peer=%s device=%s", getRemotePID(), getMACAddress()));
            return false;
        }

         if (getPeer().isServerReady()) {
            status = BleDriver.mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    Log.v(TAG, String.format("BleDriver Queue: handleServerDataReceived: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.getEncoder().encodeToString(payload), BleDriver.bytesToHex(payload), payload.length));
                    BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
                }
            }, 0);
            if (!status) {
                Log.e(TAG, String.format("handleServerDataReceived error: failed to add runnable to the ble handler: device=%s", getMACAddress()));
            }
            return status;
        }
        Log.e(TAG, String.format("handleServerDataReceived error: server handshake not completed: device=%s", getMACAddress()));
        return false;
    }

    public synchronized boolean handleServerPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleServerPIDReceived called: device=%s", getMACAddress()));

        if (new String(payload).equals(EOD)) {
            Log.v(TAG, String.format("handleServerPIDReceived: device=%s EOD received", getMACAddress()));

            Peer peer;
            String remotePID = new String(mServerBuffer);
            mServerBuffer = null;

            setRemotePID(remotePID);
        } else {
            Log.v(TAG, String.format("handleServerPIDReceived: device=%s add data to buffer", getMACAddress()));
            addToBuffer(payload, false);
        }
        return true;
    }

    public synchronized void handleClientPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleClientPIDReceived for device %s", getMACAddress()));

        Peer peer;
        String remotePID = new String(payload);

        setRemotePID(remotePID);
        peer = PeerManager.registerDevice(remotePID, this, true);
        setPeer(peer);
    }

    // takeBertyService get the Berty service in the list of services
    private boolean takeBertyService() {
        Log.v(TAG, String.format("takeBertyService: called for device %s", getMACAddress()));
        if (getBertyService() != null) {
            Log.d(TAG, String.format("Berty service already found for device %s", getMACAddress()));
            return true;
        }

        setBertyService(getBluetoothGatt().getService(GattServer.SERVICE_UUID));

        if (getBertyService() == null) {
            Log.i(TAG, String.format("Berty service not found for device", getMACAddress()));
            return false;
        }

        Log.d(TAG, String.format("Berty service found for device %s", getMACAddress()));
        return true;
    }

    // checkCharacteristicProperties checks if the characteristics have correct permissions (read/write).
    private boolean checkCharacteristicProperties(BluetoothGattCharacteristic characteristic,
                                                  int properties) {
        Log.d(TAG, "checkCharacteristicProperties: device: " + getMACAddress());

        if (characteristic.getProperties() == properties) {
            Log.d(TAG, "checkCharacteristicProperties() match, device: " + getMACAddress());
            return true;
        }
        Log.e(TAG, "checkCharacteristicProperties() doesn't match: " + characteristic.getProperties() + " / " + properties + ", device: " + getMACAddress());
        return false;
    }

    // takeBertyCharacteristics checks if the service has the two characteristics expected.
    private boolean takeBertyCharacteristics() {
        Log.v(TAG, String.format("takeBertyCharacteristic called for device %s", getMACAddress()));

        if (getPIDCharacteristic() != null && getWriterCharacteristic() != null) {
            Log.d(TAG, "Berty characteristics already found");
            return true;
        }

        List<BluetoothGattCharacteristic> characteristics = getBertyService().getCharacteristics();
        for (BluetoothGattCharacteristic characteristic : characteristics) {
            if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                Log.d(TAG, String.format("PID characteristic found for device %s", getMACAddress()));
                if (checkCharacteristicProperties(characteristic,
                        BluetoothGattCharacteristic.PROPERTY_READ | BluetoothGattCharacteristic.PROPERTY_WRITE)) {
                    setPIDCharacteristic(characteristic);

                    /*if (!getBluetoothGatt().setCharacteristicNotification(characteristic, true)) {
                        Log.e(TAG, String.format("setCharacteristicNotification failed for device %s", getMACAddress()));
                        setPIDCharacteristic(null);
                        return false;
                    }*/
                }
            } else if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                Log.d(TAG, String.format("writer characteristic found for device: ", getMACAddress()));
                if (checkCharacteristicProperties(characteristic,
                        BluetoothGattCharacteristic.PROPERTY_WRITE)) {
                    setWriterCharacteristic(characteristic);
                }
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

        if (!isClientConnected()) {
            Log.e(TAG, String.format("read error: not connected: device=%s", getMACAddress()));
            return false;
        }

        return mBleQueue.add(new Runnable() {
            @Override
            public void run() {
                Log.v(TAG, String.format("BleQueue: read: device=%s characteristicUUID=%s", getMACAddress(), characteristic.getUuid()));
                synchronized(mLockClient) {
                    if (isClientConnected()) {
                        if (!getBluetoothGatt().readCharacteristic(characteristic)) {
                            Log.e(TAG, String.format("BleQueue: read error: characteristic=%s", characteristic.getUuid()));
                            mBleQueue.completedCommand();
                            disconnect();
                        } else {
                            Log.d(TAG, String.format("BleQueue: read successful: characteristic <%s>", characteristic.getUuid()));
                            //mNrTries++;
                        }
                    } else {
                        Log.e(TAG, String.format("BleQueue: read error: client not connected: device=%s", getMACAddress()));
                        mBleQueue.completedCommand();
                    }
                }
            }
        }, 0);
    }

    private boolean internalWrite(BluetoothGattCharacteristic characteristic, byte[] payload) {
        return mBleQueue.add(new Runnable() {
            @Override
            public void run() {
                Log.v(TAG, String.format("BleQueue: internalWrite: device %s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.getEncoder().encodeToString(payload), BleDriver.bytesToHex(payload), payload.length, characteristic.getUuid()));
                synchronized(mLockClient) {
                    if (isClientConnected()) {
                        if (!characteristic.setValue(payload) || !getBluetoothGatt().writeCharacteristic(characteristic)) {
                            Log.e(TAG, String.format("BleQueue: internalWrite failed: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                            mBleQueue.completedCommand();
                            disconnect();
                        } else {
                            Log.d(TAG, String.format("BleQueue: internalWrite successful: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                            //mNrTries++;
                        }
                    } else {
                        Log.e(TAG, String.format("BleQueue: internalWrite failed: client not connected: device=%s characteristic=%s", getMACAddress(), characteristic.getUuid()));
                        mBleQueue.completedCommand();
                    }
                }
            }
        }, 0);
    }

    // write sends payload over the GATT connection.
    // EOD identifies the end of the transfer, useful for the handshake.
    public boolean write(BluetoothGattCharacteristic characteristic, byte[] payload, boolean withEOD) {
        Log.v(TAG, String.format("write called: device=%s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.getEncoder().encodeToString(payload), BleDriver.bytesToHex(payload), payload.length, characteristic.getUuid()));

        if (!isClientConnected()) {
            Log.e(TAG, "write error: device not connected");
            return false;
        }

        int minOffset = 0;
        int maxOffset;

        // Send data to fit with MTU value
        while (minOffset != payload.length) {
            maxOffset = minOffset + getMtu() - GattServer.ATT_HEADER_SIZE > payload.length ? payload.length : minOffset + getMtu() - GattServer.ATT_HEADER_SIZE;
            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
            minOffset = maxOffset;
            Log.v(TAG, String.format("write: data chunk: device=%s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.getEncoder().encodeToString(toWrite), BleDriver.bytesToHex(toWrite), toWrite.length, characteristic.getUuid()));
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

    private boolean discoverServices() {
        Log.v(TAG, String.format("discoverServices called: device=%s", getMACAddress()));

        boolean result = false;

        if (!isClientConnected()) {
            Log.e(TAG, String.format("discoverServices error: device not connected: device=%s", getMACAddress()));
            return false;
        }

        synchronized (mLockClient) {
            if (isClientConnected()) {
                result = BleDriver.mainHandler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        Log.d(TAG, String.format("mainQueue: discovering services: device=%s", getMACAddress()));
                        synchronized (mLockClient) {
                            if (!isClientConnected()) {
                                Log.e(TAG, String.format("mainQueue: discoverServices error: device not connected: device=%s", getMACAddress()));
                            } else if (!getBluetoothGatt().discoverServices()) {
                                Log.d(TAG, String.format("mainQueue: discoverServices error: failed to start for device %s", getMACAddress()));
                            }
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

        return mBleQueue.add(new Runnable() {
            @Override
            public void run() {
                Log.v(TAG, String.format("BleQueue: requestMtu: device %s", getMACAddress()));
                synchronized(mLockClient) {
                    if (isClientConnected()) {
                        if (!getBluetoothGatt().requestMtu(mtu)) {
                            Log.e(TAG, "requestMtu failed");
                            mBleQueue.completedCommand();
                        }
                    } else {
                        Log.e(TAG, "request MTU failed: device not connected");
                        mBleQueue.completedCommand();
                    }
                }
            }
        }, 0);
    }

    public void setMtu(int mtu) {
        mMtu = mtu;
    }

    public int getMtu() {
        return mMtu;
    }

    // handshake identifies the berty service and their characteristic, and exchange the peerID each other.
    private void handshake() {
        Log.d(TAG, "handshake: called");

        if (takeBertyService()) {
            if (takeBertyCharacteristics()) {
                // Speed up connection
                requestMtu(PeerDevice.MAX_MTU);

                // send local PID
                if (!write(getPIDCharacteristic() ,mLocalPID.getBytes(), true)) {
                    Log.e(TAG, String.format("handshake error: failed to send local PID: device=%s", getMACAddress()));
                    disconnect();
                }

                // get remote PID
                if (!read(getPIDCharacteristic())) {
                    Log.e(TAG, String.format("handshake error: failed to read remote PID: device=%s", getMACAddress()));
                    disconnect();
                }

                return ;
            }
        }
        Log.e(TAG, String.format("handshake error: failed to find berty service: device=%s", getMACAddress()));
        disconnect();
    }

    // addToBuffer identifies which buffer to be used and adds payload to it.
    // PeerDevice can be only client or server, not both in the same time.
    public void addToBuffer(byte[] value, boolean isClient) {
        byte[] buffer;

        if (isClient) {
            buffer = mClientBuffer;
        } else {
            buffer = mServerBuffer;
        }

        if (buffer == null) {
            buffer = new byte[0];
        }
        byte[] tmp = new byte[buffer.length + value.length];
        System.arraycopy(buffer, 0, tmp, 0, buffer.length);
        System.arraycopy(value, 0, tmp, buffer.length, value.length);

        if (isClient) {
            mClientBuffer = tmp;
        } else {
            mServerBuffer = tmp;
        }
    }

    private BluetoothGattCallback mGattCallback =
            new BluetoothGattCallback() {
                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    super.onConnectionStateChange(gatt, status, newState);
                    Log.v(TAG, String.format("onConnectionStateChange(): device=%s status=%d newState=%d", gatt.getDevice().getAddress(), status, newState));
                    BluetoothDevice device = gatt.getDevice();

                    cancelConnectionTimer();

                    if (status == GATT_SUCCESS) {
                        if (newState == BluetoothProfile.STATE_CONNECTED) {
                            Log.d(TAG, String.format("onConnectionStateChange(): connected: device=%s", device.getAddress()));

                            if (getClientState() != CONNECTION_STATE.CONNECTING) {
                                Log.w(TAG, String.format("onConnectionStateChange: device status error: device=%s status=%s newState=CONNECTED", getMACAddress(), getClientState()));
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
                                handshake();
                            }
                        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                            Log.d(TAG, String.format("onConnectionStateChange: disconnected: device=%s", device.getAddress()));

                            setClientState(CONNECTION_STATE.DISCONNECTED);
                            closeClient();
                        } else {
                            Log.e(TAG, String.format("onConnectionStateChange: unknown state: device=%s", device.getAddress()));

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
                        handshake();
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
                        mBleQueue.completedCommand();
                        return ;
                    }
                    if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                        byte[] value = characteristic.getValue();
                        if (value.length == 0) {
                            Log.d(TAG, "onCharacteristicRead(): received data length is null");
                            mBleQueue.completedCommand();
                            return ;
                        } else {
                            Log.v(TAG, String.format("onCharacteristicRead: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.getEncoder().encodeToString(value), BleDriver.bytesToHex(value), value.length));
                            handleClientPIDReceived(value);
                        }
                    } else {
                        Log.e(TAG, "onCharacteristicRead(): wrong read characteristic");
                        disconnect();
                    }
                    mBleQueue.completedCommand();
                }

                @Override
                public void onCharacteristicWrite (BluetoothGatt gatt,
                                                   BluetoothGattCharacteristic characteristic,
                                                   int status) {
                    super.onCharacteristicWrite(gatt, characteristic, status);
                    Log.v(TAG, String.format("onCharacteristicWrite for device %s", getMACAddress()));

                    if (status != GATT_SUCCESS) {
                        Log.e(TAG, String.format("onCharacteristicWrite error: device=%s status=%d", getMACAddress(), status));
                        disconnect();
                    }

                    mBleQueue.completedCommand();
                }

                @Override
                public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                    super.onMtuChanged(gatt, mtu, status);
                    Log.v(TAG, String.format("onMtuChanged(): mtu %s for device %s", mtu, getMACAddress()));
                    PeerDevice peerDevice;

                    if (status != GATT_SUCCESS) {
                        Log.e(TAG, "onMtuChanged() error: transmission error");
                        mBleQueue.completedCommand();
                        return ;
                    }

                    setMtu(mtu);
                    mBleQueue.completedCommand();
                }

                /*@Override
                public void onCharacteristicChanged (BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
                    super.onCharacteristicChanged(gatt, characteristic);

                    byte[] copy;
                    byte[] value = characteristic.getValue();

                    Log.v(TAG, String.format("onCharacteristicChanged: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.getEncoder().encodeToString(value), BleDriver.bytesToHex(value), value.length));

                    if (value.length == 0) { // end of transmission
                        copy = new byte[mClientBuffer.length];
                        System.arraycopy(mClientBuffer, 0, copy, 0, mClientBuffer.length);
                        mClientBuffer = null;
                        handleClientDataReceived(copy);
                    } else { // transmission in progress
                        addToBuffer(value, true);
                    }
                }*/
    };
}
