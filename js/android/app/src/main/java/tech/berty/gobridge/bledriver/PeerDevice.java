package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_NOTIFY;

public class PeerDevice {
    // Mark used to tell all data is transferred
    public static final String EOD = "EOD";
    // Max MTU that Android can handle
    public static final int MAX_MTU = 517;
    // L2cap read/write buffer
    public static final int L2CAP_BUFFER = 1024;
    private static final String TAG = "bty.ble.PeerDevice";
    // Connection timeout
    private static final int CONNECTION_TIMEOUT = 15000;
    // Minimal and default MTU
    private static final int DEFAULT_MTU = 23;
    // Client Characteristic Configuration (CCC) descriptor of the characteristic
    private final UUID CCC_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

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
    private Runnable mTimeoutRunnable;
    private CountDownLatch mConnectionLatch;
    private BluetoothGattService mBertyService;
    private BluetoothGattCharacteristic mPIDCharacteristic;
    private BluetoothGattCharacteristic mWriterCharacteristic;
    private String mId;
    private Peer mPeer;
    private String mRemotePID;
    private final String mLocalPID;
    private byte[] mClientBuffer;
    private byte[] mServerBuffer;
    private CircularBuffer<byte[]> mDataCache = new CircularBuffer<>(10);
    //private int mMtu = 0;
    // default MTU is 23
    private int mMtu = 23;
    private final BluetoothGattCallback mGattCallback =
        new BluetoothGattCallback() {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                super.onConnectionStateChange(gatt, status, newState);
                Log.v(TAG, String.format("onConnectionStateChange(): device=%s status=%d newState=%d", gatt.getDevice().getAddress(), status, newState));
                BluetoothDevice device = gatt.getDevice();

                cancelConnectionTimer();

                if (status == GATT_SUCCESS) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        Log.i(TAG, String.format("onConnectionStateChange(): connected: device=%s", device.getAddress()));

                        if (getClientState() != CONNECTION_STATE.CONNECTING) {
                            Log.w(TAG, String.format("onConnectionStateChange: device status error: device=%s status=%s newState=CONNECTED", getMACAddress(), getClientState()));
                            mConnectionLatch.countDown();
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
                        mBleQueue.completedCommand(1);
                        return;
                    } else {
                        Log.v(TAG, String.format("onCharacteristicRead: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length));
                        boolean success = BleDriver.mCallbacksHandler.post(() -> {
                            Log.v(TAG, String.format("onCharacteristicRead in thread: device=%s", getMACAddress()));
                            handleClientPIDReceived(value);
                            mBleQueue.completedCommand(0);
                        });

                        if (!success) {
                            Log.e(TAG, "onCharacteristicRead error: handler.post() failed");
                            disconnect();
                            mBleQueue.completedCommand(1);
                        }
                    }
                } else {
                    Log.e(TAG, "onCharacteristicRead(): wrong read characteristic");
                    disconnect();
                    mBleQueue.completedCommand(1);
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

                BleDriver.mCallbacksHandler.post(() -> {
                    handleDataReceived(value);
                });
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

    public PeerDevice(@NonNull Context context, @NonNull BluetoothDevice bluetoothDevice, String localPID) {
        mContext = context;
        mBluetoothDevice = bluetoothDevice;
        mLocalPID = localPID;
        mBleQueue = new BleQueue();
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
        mTimeoutRunnable = () -> {
            Log.i(TAG, String.format("mainHandler: startConnectionTimer: cancel connection: device=%s", getMACAddress()));

            // need to disconnect manually as callbacks won't be called
            getBluetoothGatt().disconnect();
            setBluetoothGatt(null);
            mBleQueue.clear();
            setClientState(CONNECTION_STATE.DISCONNECTED);

            mConnectionLatch.countDown();
            mTimeoutRunnable = null;
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
    public void connectToDevice(boolean autoConnect, CountDownLatch countDown) {
        Log.v(TAG, "connectToDevice: " + getMACAddress());

        if (checkAndSetClientState(CONNECTION_STATE.DISCONNECTED, CONNECTION_STATE.CONNECTING)) {
            boolean status = BleDriver.mainHandler.postDelayed(() -> {
                Log.d(TAG, "mainQueue: connectToDevice: " + getMACAddress());
                mConnectionLatch = countDown;
                setBluetoothGatt(mBluetoothDevice.connectGatt(mContext, autoConnect,
                    mGattCallback, BluetoothDevice.TRANSPORT_LE));
                startConnectionTimer();
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
        Log.v(TAG, String.format("disconnect called: device=%s", getMACAddress()));

        synchronized (mLockClient) {
            if (mClientState == CONNECTION_STATE.CONNECTED || mClientState == CONNECTION_STATE.CONNECTING) {
                mClientState = CONNECTION_STATE.DISCONNECTING;
                if (!BleDriver.mainHandler.post(() -> {
                    synchronized (mLockClient) {
                        if (mClientState == CONNECTION_STATE.DISCONNECTING && getBluetoothGatt() != null) {
                            Log.i(TAG, String.format("disconnect: device=%s can be disconnected", getMACAddress()));

                            Peer peer;
                            if ((peer = getPeer()) != null && peer.getBluetoothSocket() != null) {
                                synchronized (peer.SocketLock) {
                                    Log.v(TAG, String.format("disconnect: device=%s: closing l2cap channel", getMACAddress()));
                                    try {
                                        if (peer.getInputStream() != null) {
                                            peer.getInputStream().close();
                                        }
                                        if (peer.getOutputStream() != null) {
                                            peer.getOutputStream().close();
                                        }
                                        peer.getBluetoothSocket().close();
                                    } catch (IOException e) {
                                        // ignore
                                    }
                                    peer.setInputStream(null);
                                    peer.setOutputStream(null);
                                    peer.setBluetoothSocket(null);
                                }
                            }

                            mBleQueue.clear();

                            Log.v(TAG, String.format("disconnect: device=%s: closing GATT connection", getMACAddress()));
                            getBluetoothGatt().disconnect();
                        }
                    }
                })) {
                    Log.e(TAG, String.format("disconnect error: adding to queue failed: device=%s", getMACAddress()));
                }
            }
        }
    }

    public void closeClient() {
        Log.d(TAG, String.format("closeClient called: device=%s", getMACAddress()));

        if (getBluetoothGatt() != null) {
            getBluetoothGatt().close();
            setBluetoothGatt(null);
        }

        mBleQueue.clear();

        PeerManager.unregisterDevices(mRemotePID);
        setPeer(null);

        mClientBuffer = null;
        mServerBuffer = null;
    }

    public void closeServer() {
        Log.v(TAG, String.format("closeServer called: device=%s", getMACAddress()));

        if (mPeer != null) {
            PeerManager.unregisterDevices(getRemotePID());
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

    private void l2capRead(Peer peer) {
        // read loop
        byte[] buffer = new byte[L2CAP_BUFFER];
        int size;

        while (true) {
            try {
                if (peer.getInputStream() == null || ((size = peer.getInputStream().read(buffer, 0, L2CAP_BUFFER)) == -1))
                    break;
            } catch (IOException e) {
                Log.e(TAG, String.format("l2capRead error: device=%s ", getMACAddress()), e);
                return;
            }
            byte[] payload = Arrays.copyOfRange(buffer, 0, size);
            Log.v(TAG, String.format("l2capRead: read from l2cap: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));
            handleDataReceived(payload);
        }
    }

    public synchronized void handleServerDataSent() {
        Log.v(TAG, String.format("handleServerDataSent for device %s", getMACAddress()));

        // TODO: put latch before registerDevice
//        Thread l2capThread = new Thread(() -> {
//            if (mGattServer.getBluetoothServerSocket() != null) {
//                Log.d(TAG, String.format("handleServerDataSent: l2cap trying to accepted incoming socket for device=%s", getMACAddress()));
//                if (peer.getBluetoothSocket() == null) {
//                    synchronized (peer.SocketLock) {
//                        if (peer.getBluetoothSocket() == null) {
//                            Log.d(TAG, String.format("handleServerDataSent: setup l2cap incoming socket for device=%s", getMACAddress()));
//
//                            try {
//                                peer.setBluetoothSocket(mGattServer.getBluetoothServerSocket().accept(5000));
//                                Log.d(TAG, String.format("handleServerDataSent: l2cap accepted for device=%s", getMACAddress()));
//
//                                try {
//                                    peer.setInputStream(peer.getBluetoothSocket().getInputStream());
//                                    peer.setOutputStream(peer.getBluetoothSocket().getOutputStream());
//                                } catch (IOException e) {
//                                    Log.e(TAG, String.format("handleServerDataSent error: l2cap cannot get stream: device=%s", getMACAddress()), e);
//                                    try {
//                                        peer.getBluetoothSocket().close();
//                                    } catch (IOException ioException) {
//                                        // ignore
//                                    } finally {
//                                        peer.setBluetoothSocket(null);
//                                        peer.setInputStream(null);
//                                        peer.setOutputStream(null);
//                                    }
//                                }
//                            } catch (IOException e) {
//                                Log.e(TAG, String.format("handleServerDataSent error: l2cap cannot accept: device=%s", getMACAddress()), e);
//                            }
//                        }
//                    }
//
//                    if (peer.getBluetoothSocket() != null) {
//                        l2capRead(peer);
//                    }
//                }
//            }
//        });
//        l2capThread.start();
    }

    public boolean handleDataReceived(byte[] payload) {
        Log.v(TAG, String.format("handleDataReceived: device=%s base64=%s value=%s length=%d", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length));

        Peer peer;
        if ((peer = getPeer()) == null) {
            Log.e(TAG, String.format("handleDataReceived error: Peer not found: peer=%s device=%s", getRemotePID(), getMACAddress()));
            return false;
        }

        if (peer.isHandshakeSuccessful()) {
            BleInterface.BLEReceiveFromPeer(getRemotePID(), payload);
            return true;
        } else {
            Log.d(TAG, String.format("handleDataReceived: device=%s not ready, putting in cache", getMACAddress()));
            return mDataCache.offer(payload);

        }
    }

    public synchronized boolean handleServerPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleServerPIDReceived called: device=%s", getMACAddress()));

        if (new String(payload).equals(EOD)) {
            Log.d(TAG, String.format("handleServerPIDReceived: device=%s EOD received", getMACAddress()));

            if (mServerBuffer == null) {
                return false;
            }

            String remotePID = new String(mServerBuffer);
            mServerBuffer = null;

            setRemotePID(remotePID);
        } else {
            Log.d(TAG, String.format("handleServerPIDReceived: device=%s add data to buffer", getMACAddress()));
            addToBuffer(payload, false);
        }
        return true;
    }

    private boolean setNotify(BluetoothGattCharacteristic characteristic, final boolean enable) {
        Log.d(TAG, String.format("setNotify called: device=%s", getMACAddress()));

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
            // set notification for Gatt object
            if(!mBluetoothGatt.setCharacteristicNotification(characteristic, enable)) {
                Log.e(TAG, String.format("setNotify error: device=%s: setCharacteristicNotification failed for characteristic=%s", getMACAddress(), characteristic.getUuid()));
                mBleQueue.completedCommand(1);
                return ;
            }

            // write to descriptor to complete process
            descriptor.setValue(finalValue);
            if(!mBluetoothGatt.writeDescriptor(descriptor)) {
                Log.e(TAG, String.format("setNotify error: device=%s: writeDescriptor failed for descriptor=%s", descriptor.getUuid()));
                mBleQueue.completedCommand(1);
            }
        }, callback, 0, this::disconnect);

        if (success[0] == false) {
            Log.e(TAG, String.format("setNotify error: device=%s: unable to put code in queue", getMACAddress()));
            return false;
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "BleQueue: internalWrite: interrupted exception:", e);
        }

        return success[0];
}

    public synchronized void handleClientPIDReceived(byte[] payload) {
        Log.v(TAG, String.format("handleClientPIDReceived for device=%s base64=%s payload=%s", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload)));

        Peer peer;
        int psm;
        String remotePID;

        ByteArrayInputStream bis = new ByteArrayInputStream(Arrays.copyOfRange(payload, 0, 4));
        DataInputStream dis = new DataInputStream(bis);
        try {
            psm = dis.readInt();
        } catch (IOException e) {
            Log.e(TAG, String.format("handleClientPIDReceived error: ByteArrayInputStream failed for device=%s", getMACAddress()));
            return;
        } finally {
            try {
                bis.close();
            } catch (IOException e) {
                // ignore
            }
        }
        remotePID = new String(Arrays.copyOfRange(payload, 4, payload.length));
        Log.d(TAG, String.format("handleClientPIDReceived: got PSM=%d remotePID=%s for device=%s", psm, remotePID, getMACAddress()));
        setRemotePID(remotePID);
        peer = PeerManager.getPeer(remotePID);
        setPeer(peer);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            CountDownLatch localLatch = new CountDownLatch(1);
            Thread l2capThread = new Thread(() -> {
                boolean released = false;
                if (psm != 0 && mGattServer.getBluetoothServerSocket() != null) {
                    Log.d(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel for device=%s PSM=%d", getMACAddress(), psm));
                    if (peer.getBluetoothSocket() == null) {
                        synchronized (peer.SocketLock) {
                            if (peer.getBluetoothSocket() == null) {
                                Log.d(TAG, String.format("handleClientPIDReceived: setup l2cap outgoing socket for device=%s PSM=%d", getMACAddress(), psm));
                                try {
                                    peer.setBluetoothSocket(getBluetoothDevice().createInsecureL2capChannel(psm));
                                    peer.getBluetoothSocket().connect();

                                    try {
                                        peer.setInputStream(peer.getBluetoothSocket().getInputStream());
                                        peer.setOutputStream(peer.getBluetoothSocket().getOutputStream());
                                        Log.d(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel connected for device=%s", getMACAddress()));
                                    } catch (IOException e) {
                                        Log.e(TAG, String.format("handleClientPIDReceived error: createInsecureL2capChannel cannot get stream device=%s", getMACAddress()), e);
                                        try {
                                            peer.getBluetoothSocket().close();
                                        } catch (IOException ioException) {
                                            // ignore
                                        } finally {
                                            peer.setBluetoothSocket(null);
                                            peer.setInputStream(null);
                                            peer.setOutputStream(null);
                                        }
                                    }
                                } catch (IOException e) {
                                    Log.e(TAG, String.format("handleClientPIDReceived error: createInsecureL2capChannel cannot connect device=%s", getMACAddress()), e);
                                }
                            }
                        }

                        if (peer.getBluetoothSocket() != null) {
                            Log.d(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel latch released for device=%s", getMACAddress()));
                            localLatch.countDown();
                            released = true;
                            l2capRead(peer);
                        }
                    } else {
                        Log.d(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel canceled, server channel already created for device=%s", getMACAddress()));
                    }
                }
                if (!released) {
                    Log.d(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel latch released for device=%s", getMACAddress()));
                    localLatch.countDown();
                }
            });
            l2capThread.start();

            try {
                Log.w(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel before wait for device=%s", getMACAddress()));
                localLatch.await();
                Log.w(TAG, String.format("handleClientPIDReceived: createInsecureL2capChannel after wait for device=%s", getMACAddress()));
            } catch (InterruptedException e) {
                Log.e(TAG, String.format("handleClientPIDReceived error: device=%s wait for localLatch error ", getMACAddress()), e);
            }
        }
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

        if (getPIDCharacteristic() != null && getWriterCharacteristic() != null) {
            Log.d(TAG, "Berty characteristics already found");
            return true;
        }

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

        if (!isClientConnected()) {
            Log.e(TAG, String.format("read error: not connected: device=%s", getMACAddress()));
            return false;
        }

        return mBleQueue.add(() -> {
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
        }, null, 0, this::disconnect);
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
            Log.v(TAG, String.format("BleQueue: internalWrite: device %s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length, characteristic.getUuid()));
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
            Log.e(TAG, "BleQueue: internalWrite: interrupted exception:", e);
        }

        return success[0];
    }

    // write sends payload over the GATT connection.
    // EOD identifies the end of the transfer, useful for the handshake.
    public boolean write(BluetoothGattCharacteristic characteristic, byte[] payload, boolean withEOD, boolean tryL2cap) {
        Log.v(TAG, String.format("write called: device=%s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.encodeToString(payload, Base64.DEFAULT), BleDriver.bytesToHex(payload), payload.length, characteristic.getUuid()));

        if (!isClientConnected()) {
            Log.e(TAG, "write error: device not connected");
            return false;
        }

        if (tryL2cap) {
            Peer peer = PeerManager.get(getRemotePID());
            if (peer != null) {
                synchronized (peer.SocketLock) {
                    if (peer.getBluetoothSocket() != null && peer.getBluetoothSocket().isConnected()) {
                        try {
                            Log.v(TAG, String.format("write with L2cap: device=%s", getMACAddress()));
                            peer.getOutputStream().write(payload);
                            return true;
                        } catch (IOException e) {
                            Log.e(TAG, String.format("write error: device=%s", getMACAddress()), e);
                            try {
                                peer.getBluetoothSocket().close();
                            } catch (IOException ioException) {
                                Log.e(TAG, String.format("write error: failed to close l2cap socket: device=%s", getMACAddress()), e);
                            }
                            peer.setBluetoothSocket(null);
                            return false;
                        }
                    }
                }
            }
        }

        int minOffset = 0;
        int maxOffset;

        // Send data to fit with MTU value
        while (minOffset != payload.length) {
            maxOffset = (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE) > payload.length ? payload.length : (minOffset + getMtu() - GattServer.ATT_HEADER_SIZE);
            final byte[] toWrite = Arrays.copyOfRange(payload, minOffset, maxOffset);
            minOffset = maxOffset;
            Log.v(TAG, String.format("write: data chunk: device=%s base64=%s value=%s length=%d characteristicUUID=%s", getMACAddress(), Base64.encodeToString(toWrite, Base64.DEFAULT), BleDriver.bytesToHex(toWrite), toWrite.length, characteristic.getUuid()));
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
                if (!write(getPIDCharacteristic(), mLocalPID.getBytes(), true, false)) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to send local PID", getMACAddress()));
                    disconnect();
                }

                // get remote PID
                if (!read(getPIDCharacteristic())) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to read remote PID", getMACAddress()));
                    disconnect();
                }

                if (!setNotify(mWriterCharacteristic, true)) {
                    Log.e(TAG, String.format("handshake error: device=%s: failed to enable notifications", getMACAddress()));
                    disconnect();
                }

                if (PeerManager.registerDevice(getRemotePID(), this, true) == null) {
                    Log.e(TAG, String.format("handshake error: device=%s: registerDevice failed", getMACAddress()));
                    closeClient();
                }

                mConnectionLatch.countDown();
                return;
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

    public enum CONNECTION_STATE {
        DISCONNECTED,
        CONNECTED,
        CONNECTING,
        DISCONNECTING
    }
}
