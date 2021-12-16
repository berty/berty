package tech.berty.gobridge.bledriver;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;

import java.nio.charset.StandardCharsets;

// Make the BleDriver class a Singleton
// see https://medium.com/@kevalpatel2106/how-to-make-the-perfect-singleton-de6b951dfdb0
public class BleDriver {
    private static final String TAG = "bty.ble.BleDriver";
    private final Logger mLogger;
    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);
    public static Handler mainHandler = new Handler(Looper.getMainLooper());
    public static Handler mHandshakeHandler;
    private Looper mHandshakeLooper;
    public static Handler mCallbacksHandler;
    private Looper mCallbacksLooper;
    public static Handler mWriteHandler;
    private Looper mWriteLooper;
    public static Handler mReadHandler;
    private Looper mReadLooper;
    private static volatile BleDriver mBleDriver;
    private final Context mAppContext;
    private BluetoothManager mBluetoothManager;
    private BluetoothAdapter mBluetoothAdapter;
    private GattServer mGattServer;
    private DeviceManager mDeviceManager;
    private PeerManager mPeerManager;

    private Advertiser mAdvertiser;
    private Scanner mScanner;

    private boolean mInit = false;
    private boolean mStarted = false;
    private String mLocalPid;
    private int mAdapterState = BluetoothAdapter.STATE_OFF;
    private final BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
                final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                switch (state) {
                    case BluetoothAdapter.STATE_OFF:
                        mLogger.d(TAG, "mBroadcastReceiver: STATE_OFF");
                        mAdapterState = BluetoothAdapter.STATE_OFF;
                        break;
                    case BluetoothAdapter.STATE_TURNING_OFF:
                        mLogger.d(TAG, "mBroadcastReceiver: STATE_TURNING_OFF");
                        mAdapterState = BluetoothAdapter.STATE_TURNING_OFF;
                        new Thread(() -> stopBleDriver()).start();
                        break;
                    case BluetoothAdapter.STATE_ON:
                        mLogger.d(TAG, "mBroadcastReceiver: STATE_ON");
                        mAdapterState = BluetoothAdapter.STATE_ON;
                        new Thread(() -> startBleDriver()).start();
                        break;
                    case BluetoothAdapter.STATE_TURNING_ON:
                        mLogger.d(TAG, "mBroadcastReceiver: STATE_TURNING_ON");
                        mAdapterState = BluetoothAdapter.STATE_TURNING_ON;
                        break;
                    default:
                        mLogger.e(TAG, "mBroadcastReceiver: default case");
                }
            }
        }
    };
    private boolean mBroadcastReceiverRegistered = false;

    private BleDriver(Context context, Logger logger) {
        if (mBleDriver != null) {
            throw new RuntimeException("Use getInstance() method to get the singleton instance of this class");
        }
        mAppContext = context;
        mLogger = logger;
        mDeviceManager = new DeviceManager(logger);
        mPeerManager = new PeerManager(logger);
    }

    // Singleton method
    public static synchronized BleDriver getInstance(Context appContext, Logger logger) {
        if (mBleDriver == null) {
            mBleDriver = new BleDriver(appContext, logger);
        }
        return mBleDriver;
    }

    public static String bytesToHex(byte[] bytes) {
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }

    // Init BluetoothAdapter object and test if bluetooth is enabled.
    private synchronized boolean initSystemBle() {
        mLogger.i(TAG, "initBluetoothAdapter(): init system bluetooth requirements");
        if (!mAppContext.getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            mLogger.e(TAG, "initSystemBle: BLE is not supported by this device");
            return false;
        }

        // Check BLE permissions
        if (mAppContext.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            mLogger.e(TAG, "initSystemBle: BLE permissions not granted");
            return false;
        }

        // Initializes Bluetooth adapter.
        mBluetoothManager = (BluetoothManager) mAppContext.getSystemService(Context.BLUETOOTH_SERVICE);
        if ((mBluetoothAdapter = mBluetoothManager.getAdapter()) == null) {
            mLogger.e(TAG, "initBluetoothAdapter(): bluetooth adapter not available");
            return false;
        }

        mAdapterState = mBluetoothAdapter.getState();
        if (!mBluetoothAdapter.isEnabled()) {
            mLogger.e(TAG, "initBluetoothAdapter(): bluetooth not enabled");
            return false;
        }

        mLogger.i(TAG, "initBluetoothAdapter(): bluetooth is supported on this hardware platform and enabled");
        return true;
    }

    // main initialization method
    private synchronized boolean initDriver() {
        if (!initSystemBle()) {
            mLogger.e(TAG, "initDriver: initSystemBle failed");
            return false;
        }

        mAdvertiser = new Advertiser(mLogger, mBluetoothAdapter);
        if (!mAdvertiser.isInit()) {
            mLogger.e(TAG, "initDriver: Advertiser init failed");
            mScanner = null;
            return false;
        }

        mScanner = new Scanner(mAppContext, mBleDriver, mLogger, mBluetoothAdapter);
        if (!mScanner.isInit()) {
            mLogger.e(TAG, "initDriver: Scanner init failed");
            mScanner = null;
            mAdvertiser = null;
            return false;
        }

        // Setup context dependant objects
        mGattServer = new GattServer(mAppContext, mBleDriver, mLogger, mBluetoothManager);
        setInit(true);
        return true;
    }

    public synchronized boolean isInit() {
        return mInit;
    }

    public synchronized void setInit(boolean status) {
        mInit = status;
    }

    public synchronized boolean isStarted() {
        return mStarted;
    }

    public synchronized void setStarted(boolean status) {
        mStarted = status;
    }

    private synchronized void startBleDriver() {
        if (!isInit() && !initDriver()) {
            mLogger.e(TAG, "startBleDriver: driver not init");
            return;
        }

        if (isStarted()) {
            mLogger.i(TAG, "startBleDriver(): BLE driver is already on, one instance is allow");
            return;
        }

        if (mAdapterState != BluetoothAdapter.STATE_ON) {
            mLogger.w(TAG, "startBleDriver: Bluetooth adapter is not started");
            return;
        }

        if (mLocalPid == null) {
            mLogger.e(TAG, "startBleDriver: internal error: mLocalPid is not set");
            return;
        }
        // Start the BLE thread
        Thread mThread = new Thread(() -> {
            Looper.prepare();
            mHandshakeLooper = Looper.myLooper();
            mHandshakeHandler = new Handler(mHandshakeLooper);
            Looper.loop();
        });
        mThread.start();

        Thread mThread2 = new Thread(() -> {
            Looper.prepare();
            mCallbacksLooper = Looper.myLooper();
            mCallbacksHandler = new Handler(mCallbacksLooper);
            Looper.loop();
        });
        mThread2.start();

        Thread mThread3 = new Thread(() -> {
            Looper.prepare();
            mWriteLooper = Looper.myLooper();
            mWriteHandler = new Handler(mWriteLooper);
            Looper.loop();
        });
        mThread3.start();

        Thread mThread4 = new Thread(() -> {
            Looper.prepare();
            mReadLooper = Looper.myLooper();
            mReadHandler = new Handler(mReadLooper);
            Looper.loop();
        });
        mThread4.start();

        mLogger.d(TAG, "startBleDriver: mThread started");

        if (!mGattServer.start(mLocalPid)) {
            mLogger.e(TAG, "startBleDriver: mGattServer failed to start");
            return;
        }

        if (!mAdvertiser.start(idFromPid(mLocalPid))) {
            mLogger.e(TAG, "startBleDriver: failed to start advertising");
            stopBleDriver();
            return;
        }

        if (!mScanner.start(mLocalPid)) {
            mLogger.e(TAG, "startBleDriver: failed to start scanning");
            stopBleDriver();
            return;
        }

        setStarted(true);
        mLogger.i(TAG, "startBleDriver: initDriver completed");
    }

    public synchronized void StartBleDriver(String localPeerID) {
        mLogger.d(TAG, "StartBleDriver() called");

        mLocalPid = localPeerID;

        // Enable broadcast receiver
        if (!mBroadcastReceiverRegistered) {
            IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
            mAppContext.registerReceiver(mBroadcastReceiver, filter);
            mBroadcastReceiverRegistered = true;
        }

        startBleDriver();
    }

    private synchronized void stopBleDriver() {
        if (!isInit()) {
            mLogger.e(TAG, "StopBleDriver: driver not init");
            return;
        }

        if (!isStarted()) {
            mLogger.d(TAG, "driver is not started");
            return;
        }

        mAdvertiser.stop();
        mScanner.stop();
        mDeviceManager.closeAllDeviceConnections();
        mGattServer.stop();
        setStarted(false);
        mHandshakeLooper.quit();
        mCallbacksLooper.quit();
        mWriteLooper.quit();
        mReadLooper.quit();
    }

    public synchronized void StopBleDriver() {
        stopBleDriver();
        if (mBroadcastReceiverRegistered) {
            mAppContext.unregisterReceiver(mBroadcastReceiver);
			mBroadcastReceiverRegistered = false;
        }
    }

    public boolean SendToPeer(String remotePID, byte[] payload) {
        Peer peer;
        PeerDevice peerDevice;
        BluetoothGattCharacteristic writer;

        if ((peer = mPeerManager.get(remotePID)) == null) {
            mLogger.e(TAG, "SendToPeer error: remote peer not found");
            return false;
        }

        if ((peerDevice = peer.getDevice()) == null) {
            mLogger.e(TAG, "SendToPeer error: peerDevice not found");
            return false;
        }

        if (peerDevice.canUseL2cap() && peerDevice.getBluetoothSocket() != null && peerDevice.getBluetoothSocket().isConnected()) {
            if (!peerDevice.l2capWrite(payload)) {
                mLogger.e(TAG, String.format("SendToPeer error: l2capWrite failed: device=%s", mLogger.sensitiveObject(peerDevice.getMACAddress())));
                return false;
            }

            return true;
        } else {
            if (peerDevice.isClientConnected()) {
                if ((writer = peerDevice.getWriterCharacteristic()) == null) {
                    mLogger.e(TAG, "SendToPeer error: WriterCharacteristic is null");
                    return false;
                }

                return peerDevice.write(writer, payload, false);
            } else if (peerDevice.isServerConnected()) {
                return mGattServer.writeAndNotify(peerDevice, payload);
            } else {
                mLogger.e(TAG, "SendToPeer error: remote device is disconnected");
                return false;
            }
        }
    }

    public static String idFromPid(String pid) {
        int pidLen = pid.length();
        return pid.substring(pidLen - 4, pidLen);
    }

    public PeerManager peerManager() {
        return mPeerManager;
    }

    public DeviceManager deviceManager() {
        return mDeviceManager;
    }
}
