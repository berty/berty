package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.ParcelUuid;
import android.util.Log;

import java.util.UUID;

import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PERMISSION_WRITE;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_READ;
import static android.bluetooth.BluetoothGattCharacteristic.PROPERTY_WRITE;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.content.Context.BLUETOOTH_SERVICE;

public class GattServer {
    private final String TAG = "GattServer";

    // GATT service UUID
    static final UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D668D");
    static final UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B5");
    static final UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1B");
    static final ParcelUuid P_SERVICE_UUID = new ParcelUuid(SERVICE_UUID);

    // GATT service objects
    private BluetoothGattService mService;
    private BluetoothGattCharacteristic mPeerIDCharacteristic;
    private BluetoothGattCharacteristic mWriterCharacteristic;

    private Context mContext;
    private BluetoothGattServer mBluetoothGattServer;
    private Thread mGattServerThread;
    private boolean mInit = false;
    enum State {
        STOPPED,
        STARTING,
        STARTED
    }
    private volatile State mState = State.STOPPED;
    private String mPeerID;

    public GattServer(Context context) {
        mContext = context;
        setupGattService();
    }

        // After adding a new service, the success of this operation will be given to the callback
    // BluetoothGattServerCallback#onServiceAdded. It's only after this callback that the server
    // will be ready.
    public synchronized boolean start(final String peerID, final GattServerCallback gattServerCallback) {
        Log.d(TAG, "setupGattServer() called in thread " + Thread.currentThread().getName());
        final BluetoothManager bluetoothManager;

        if (!mInit) {
            Log.e(TAG, "start error: can't start the GATT server");
            return false;
        }
        if (mState != State.STOPPED) {
            Log.i(TAG, "start(): the GATT server is not stopped");
            return true;
        }
        setState(State.STARTING);
        if ((bluetoothManager = (BluetoothManager)mContext.getSystemService(BLUETOOTH_SERVICE)) == null) {
            Log.e(TAG, "setupGattServer(): cannot get the bluetoothManager");
            return false;
        }
        mPeerID = peerID;
        mGattServerThread = new Thread(new Runnable() {
            @Override
            public void run() {
                mBluetoothGattServer = bluetoothManager.openGattServer(mContext, gattServerCallback);
                mPeerIDCharacteristic.setValue(mPeerID);
                mWriterCharacteristic.setValue("");
                if (!mBluetoothGattServer.addService(mService)) {
                    Log.e(TAG, "setupGattServer() error: cannot add a new service");
                    mBluetoothGattServer = null;
                }
            }
        });
        mGattServerThread.start();
        return true;
    }

    public synchronized BluetoothGattServer getGattServer() {
        return mBluetoothGattServer;
    }

    public synchronized void setState(State state) {
        mState = state;
    }

    public synchronized State getState() {
        return mState;
    }

    public synchronized void stop() {
        Log.d(TAG, "stop() called");
        if (mState == State.STARTED) {
            Log.d(TAG, "stop(): stopping server");
            mBluetoothGattServer.close();
            mBluetoothGattServer = null;
            setState(State.STOPPED);
        }
    }

    private void setupGattService() {
        Log.d(TAG, "setupGattService() called");
        mService = new BluetoothGattService(SERVICE_UUID, SERVICE_TYPE_PRIMARY);
        mPeerIDCharacteristic = new BluetoothGattCharacteristic(PEER_ID_UUID, PROPERTY_READ, PERMISSION_READ);
        mWriterCharacteristic = new BluetoothGattCharacteristic(WRITER_UUID, PROPERTY_WRITE, PERMISSION_WRITE);
        if (!mService.addCharacteristic(mPeerIDCharacteristic)
                || !mService.addCharacteristic(mWriterCharacteristic)) {
            Log.e(TAG, "setupService() failed: can't add characteristics to service");
            mInit = false;
        }
        mInit = true;
    }

}
