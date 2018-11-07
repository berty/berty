package chat.berty.ble;

import android.app.Activity;
import android.app.ActivityManager;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCallback;
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
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.ParcelUuid;
import android.support.annotation.Nullable;
import android.util.Log;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import android.bluetooth.BluetoothGatt;

import static android.bluetooth.BluetoothGattCharacteristic.*;
import static android.bluetooth.BluetoothGattService.SERVICE_TYPE_PRIMARY;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;
import static android.content.Context.BLUETOOTH_SERVICE;

public class Manager {
    private static Manager instance = null;

    private Context mContext;

    private ActivityGetter mReactContext;

    private Object RmReactContext;

    final static int BLUETOOTH_ENABLE_REQUEST = 1;

    protected UUID SERVICE_UUID = UUID.fromString("A06C6AB8-886F-4D56-82FC-2CF8610D6664");

    protected UUID WRITER_UUID = UUID.fromString("000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C");

    protected UUID CLOSER_UUID = UUID.fromString("AD127A46-D065-4D72-B15A-EB2B3DA20561");

    protected UUID IS_READY_UUID = UUID.fromString("D27DE0B5-2170-4C59-9C0B-750C760C74E6");

    protected UUID MA_UUID = UUID.fromString("9B827770-DC72-4C55-B8AE-0870C7AC15A8");

    protected UUID PEER_ID_UUID = UUID.fromString("0EF50D30-E208-4315-B323-D05E0A23E6B3");

    protected UUID ACCEPT_UUID = UUID.fromString("6F110ECA-9FCC-4BB3-AB45-6F13565E2E34");

    public static String TAG = "chat.berty.ble.Manager";

    protected HashMap<String, BertyDevice> bertyDevices;

    protected BluetoothAdapter mBluetoothAdapter;

    protected BluetoothGattServer mBluetoothGattServer;

    protected BluetoothLeAdvertiser mBluetoothLeAdvertiser;

    protected BluetoothLeScanner mBluetoothLeScanner;

    protected BluetoothGattService mService;

    protected BluetoothGattCharacteristic acceptCharacteristic;
    protected BluetoothGattCharacteristic maCharacteristic;
    protected BluetoothGattCharacteristic peerIDCharacteristic;
    protected BluetoothGattCharacteristic writerCharacteristic;
    protected BluetoothGattCharacteristic isRdyCharacteristic;
    protected BluetoothGattCharacteristic closerCharacteristic;

    public interface ActivityGetter {
        @Nullable Activity getCurrentActivity();
    }

    private Manager() {
        super();
        Log.e(TAG, "BLEManager init");
    }

    public void setmContext(Context ctx) {
        Log.e(TAG, "BLEManager context set");
        mContext = ctx;
    }

    public void setmReactContext(Object rCtx, Object t) {
        Log.e(TAG, "BLEManager ReactContext set");
        RmReactContext = t;
        mReactContext = (ActivityGetter)rCtx;
    }

    public static Manager getInstance() {
        if (instance == null) {
            synchronized (Manager.class) {
                if (instance == null) {
                    instance = new Manager();
                    instance.mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
                    instance.bertyDevices = new HashMap<>();
                }
            }
        }

        Log.e(TAG, "ALL INSTANCES " + instance);
        return instance;
    }
    public boolean isRunning(Context ctx) {
        ActivityManager activityManager = (ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> tasks = activityManager.getRunningTasks(Integer.MAX_VALUE);

        for (ActivityManager.RunningTaskInfo task : tasks) {
            if (ctx.getPackageName().equalsIgnoreCase(task.baseActivity.getPackageName()))
                return true;
        }

        return false;
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
                    BertyDevice bDevice = getDeviceFromAddr(device.getAddress());
                    handleConnectionStateChange(bDevice, status, newState);
                    Log.e(TAG, "new coob " + device.getAddress());
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
                    Log.e( "BLE", "Advertising onStartSuccess: " + settingsInEffect);
                    super.onStartSuccess(settingsInEffect);
                }
                @Override
                public void onStartFailure(int errorCode) {
                    String errorString;
                    switch (errorCode) {
                        case ADVERTISE_FAILED_DATA_TOO_LARGE: errorString = "ADVERTISE_FAILED_DATA_TOO_LARGE";
                        break;

                        case ADVERTISE_FAILED_TOO_MANY_ADVERTISERS: errorString = "ADVERTISE_FAILED_TOO_MANY_ADVERTISERS";
                        break;

                        case ADVERTISE_FAILED_ALREADY_STARTED: errorString = "ADVERTISE_FAILED_ALREADY_STARTED";
                        break;

                        case ADVERTISE_FAILED_INTERNAL_ERROR: errorString = "ADVERTISE_FAILED_INTERNAL_ERROR";
                        break;

                        case ADVERTISE_FAILED_FEATURE_UNSUPPORTED: errorString = "ADVERTISE_FAILED_FEATURE_UNSUPPORTED";
                        break;

                        default: errorString = "UNKNOWN ADVERTISE FAILURE";
                        break;
                    }
                    Log.e(TAG, "Advertising onStartFailure: " + errorString);
                    if (errorCode == AdvertiseCallback.ADVERTISE_FAILED_INTERNAL_ERROR) {
//                        mBluetoothAdapter.getBluetoothLeAdvertiser().stopAdvertising(mAdvertisingCallback);
//                        mBluetoothLeAdvertiser.startAdvertising(createAdvSettings(
//                                true, 300), makeAdvertiseData(), mAdvertisingCallback);
                    }
                    super.onStartFailure(errorCode);
                }
            };
        }
    }

    public static final int MY_PERMISSIONS_REQUEST_LOCATION = 99;

    public @Nullable ScanSettings createScanSetting() {
        ScanSettings settings = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
             settings = new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build();
        }
        return settings;
    }

    public @Nullable ScanFilter makeFilter() {
        ParcelUuid pUuid = new ParcelUuid(SERVICE_UUID);
        ScanFilter filter = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            filter = new ScanFilter.Builder().setServiceUuid(pUuid).build();

        }
        return filter;
    }

    private ScanCallback mScanCallback;

    public void initScanCallBack() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mScanCallback = new ScanCallback() {
                public void parseResult(ScanResult result) {
                    BluetoothDevice device = result.getDevice();
                    String addr = device.getAddress();
                    synchronized (bertyDevices) {
                        if (!bertyDevices.containsKey(addr)) {
                            BluetoothGatt gatt = device.connectGatt(mContext, false, mGattCallback);
                            BertyDevice bDevice = new BertyDevice(device, gatt, addr);
                            bertyDevices.put(addr, bDevice);
                        }
                    }
                }

                @Override
                public void onScanResult(int callbackType, ScanResult result) {
                    parseResult(result);
                    super.onScanResult(callbackType, result);
                }

                @Override
                public void onBatchScanResults(List<ScanResult> results) {
                    for (ScanResult result:results) {
                        parseResult(result);
                    }
                    super.onBatchScanResults(results);
                }

                @Override
                public void onScanFailed(int errorCode) {
                    String errorString;

                    switch(errorCode) {
                        case SCAN_FAILED_ALREADY_STARTED: errorString = "SCAN_FAILED_ALREADY_STARTED";
                            break;

                        case SCAN_FAILED_APPLICATION_REGISTRATION_FAILED: errorString = "SCAN_FAILED_APPLICATION_REGISTRATION_FAILED";
                            break;

                        case SCAN_FAILED_INTERNAL_ERROR: errorString = "SCAN_FAILED_INTERNAL_ERROR";
                            break;

                        case SCAN_FAILED_FEATURE_UNSUPPORTED: errorString = "SCAN_FAILED_FEATURE_UNSUPPORTED";
                        break;

                        default: errorString = "UNKNOW FAIL";
                        break;
                    }
                    Log.e(TAG, "error scanning " + errorString);
                    super.onScanFailed(errorCode);
                }
            };
        }
    }

    public void startAdvertising() {
        AdvertiseSettings settings = createAdvSettings(true, 0);
        AdvertiseData advData = makeAdvertiseData();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mBluetoothLeAdvertiser.startAdvertising(settings, advData, mAdvertisingCallback);
        }
    }

    public void startScanning() {
        ScanSettings settings = createScanSetting();
        ScanFilter filter = makeFilter();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mBluetoothLeScanner.startScan(Arrays.asList(filter), settings, mScanCallback);
        }
    }

    public String realTest() {
        Log.e(TAG, "THIS IS REAL SHIT GUY");
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        Activity curActivity = mReactContext.getCurrentActivity();
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            curActivity.startActivityForResult(enableBtIntent, BLUETOOTH_ENABLE_REQUEST);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            initGattServerCallBack();
            initGattCallback();
            initAdvertiseCallback();
            initScanCallBack();

            BluetoothManager mb = (BluetoothManager) mContext.getSystemService(BLUETOOTH_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mBluetoothLeAdvertiser = mBluetoothAdapter.getBluetoothLeAdvertiser();
                mBluetoothLeScanner = mBluetoothAdapter.getBluetoothLeScanner();

                mBluetoothGattServer = mb.openGattServer(mContext, mGattServerCallback);
                mBluetoothGattServer.addService(createService());

//                startAdvertising();
                startScanning();
            }
        }
        return "COMING FROM THAT MOTHA FUCKING JAVA";
    }

    protected BluetoothGattCallback mGattCallback;

    public @Nullable BertyDevice getDeviceFromAddr(String addr) {
        synchronized (bertyDevices) {
            if (bertyDevices.containsKey(addr)) {
                return bertyDevices.get(addr);
            }
        }

        return null;
    }

    public void initGattCallback() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mGattCallback = new BluetoothGattCallback() {
                @Override
                public void onPhyUpdate(BluetoothGatt gatt, int txPhy, int rxPhy, int status) {
                    super.onPhyUpdate(gatt, txPhy, rxPhy, status);
                }

                @Override
                public void onPhyRead(BluetoothGatt gatt, int txPhy, int rxPhy, int status) {
                    super.onPhyRead(gatt, txPhy, rxPhy, status);
                }

                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
                    handleConnectionStateChange(bDevice, status, newState);
                    super.onConnectionStateChange(gatt, status, newState);
                }

                @Override
                public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    BluetoothGattService svc = gatt.getService(SERVICE_UUID);
                    BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
                    ExecutorService es = Executors.newFixedThreadPool(6);
                    List<PopulateCharacteristic> todo = new ArrayList<PopulateCharacteristic>(6);

                    todo.add(new PopulateCharacteristic(MA_UUID, bDevice));
                    todo.add(new PopulateCharacteristic(PEER_ID_UUID, bDevice));
                    todo.add(new PopulateCharacteristic(CLOSER_UUID, bDevice));
                    todo.add(new PopulateCharacteristic(WRITER_UUID, bDevice));
                    todo.add(new PopulateCharacteristic(IS_READY_UUID, bDevice));
                    todo.add(new PopulateCharacteristic(ACCEPT_UUID, bDevice));

                    try {
                        List<Future<BluetoothGattCharacteristic>> answers = es.invokeAll(todo);
                        for (Future<BluetoothGattCharacteristic> future:answers) {
                            BluetoothGattCharacteristic c = future.get();
                            if (c.getUuid().equals(MA_UUID)) {
                                bDevice.maCharacteristic = c;
                            } else if (c.getUuid().equals(PEER_ID_UUID)) {
                                bDevice.peerIDCharacteristic = c;
                            } else if (c.getUuid().equals(CLOSER_UUID)) {
                                bDevice.closerCharacteristic = c;
                            } else if (c.getUuid().equals(WRITER_UUID)) {
                                bDevice.writerCharacteristic = c;
                            } else if (c.getUuid().equals(IS_READY_UUID)) {
                                bDevice.isRdyCharacteristic = c;
                            } else if (c.getUuid().equals(ACCEPT_UUID)) {
                                bDevice.acceptCharacteristic = c;
                            } else {
                                Log.e(TAG, "UNKNOW CHARACT");
                            }

                            Log.e(TAG, "UUID "+c.getUuid());
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    gatt.readCharacteristic(bDevice.maCharacteristic);
                    gatt.readCharacteristic(bDevice.peerIDCharacteristic);

                    super.onServicesDiscovered(gatt, status);
                }

                @Override
                public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                    Log.e(TAG, "charact discovered " + new String(characteristic.getValue(), Charset.forName("UTF-8")));
                    BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
                    handleReadCharact(bDevice, characteristic);
                    super.onCharacteristicRead(gatt, characteristic, status);
                }

                @Override
                public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                    super.onCharacteristicWrite(gatt, characteristic, status);
                }

                @Override
                public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
                    Log.e(TAG, "charact changed " + new String(characteristic.getValue(), Charset.forName("UTF-8")));
                    BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
                    handleReadCharact(bDevice, characteristic);
                    super.onCharacteristicChanged(gatt, characteristic);
                }

                @Override
                public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                    super.onDescriptorRead(gatt, descriptor, status);
                }

                @Override
                public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
                    super.onDescriptorWrite(gatt, descriptor, status);
                }

                @Override
                public void onReliableWriteCompleted(BluetoothGatt gatt, int status) {
                    super.onReliableWriteCompleted(gatt, status);
                }

                @Override
                public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
                    super.onReadRemoteRssi(gatt, rssi, status);
                }

                @Override
                public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                    super.onMtuChanged(gatt, mtu, status);
                }
            };
        }
    }

    public void handleMaRead(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        String newMa = new String(characteristic.getValue(), Charset.forName("UTF-8"));
        if (device.ma == null || device.ma == "" || !device.ma.equals(newMa)) {
            device.ma = newMa;
            if (device.peerID == null || device.peerID == "" || !device.ma.equals(newMa)) {
                device.gatt.readCharacteristic(device.gatt.getService(SERVICE_UUID).getCharacteristic(PEER_ID_UUID));
            }
        }
    }

    public void handlePeerIDRead(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        String newPeerID = new String(characteristic.getValue(), Charset.forName("UTF-8"));
        if (device.peerID == null || device.peerID == "" || !device.peerID.equals(newPeerID)) {
            device.peerID = newPeerID;
            if (device.ma == null || device.ma == "" || !device.peerID.equals(newPeerID)) {
                device.gatt.readCharacteristic(device.gatt.getService(SERVICE_UUID).getCharacteristic(MA_UUID));
            }
        }
    }

    public void handleReadCharact(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        UUID charID = characteristic.getUuid();
        if (charID.equals(MA_UUID)) {
            handleMaRead(device, characteristic);
        } else if (charID.equals(PEER_ID_UUID)) {
            handlePeerIDRead(device, characteristic);
        }
    }

    public void handleConnectionStateChange(BertyDevice device, int status, int newState) {
        if (newState == STATE_CONNECTED) {
            Log.e(TAG, "new newly connected device " + device.gatt);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                device.gatt.discoverServices();
            }
        } else if (newState == STATE_DISCONNECTED) {
            Log.e(TAG, "disconnected device " + device.addr);
            synchronized (bertyDevices) {
                bertyDevices.remove(device.addr);
            }
        }
    }

    public class PopulateCharacteristic implements Callable<BluetoothGattCharacteristic> {
        private UUID uuid;
        private BertyDevice device;

        public PopulateCharacteristic(UUID charactUUID, BertyDevice bDevice) {
            uuid = charactUUID;
            device = bDevice;
        }

        public @Nullable BluetoothGattCharacteristic call() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                return device.gatt.getService(SERVICE_UUID).getCharacteristic(uuid);
            }

            return null;
        }
    }
}
