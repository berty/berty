package chat.berty.ble;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static android.bluetooth.BluetoothGatt.GATT_CONNECTION_CONGESTED;
import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_INSUFFICIENT_AUTHENTICATION;
import static android.bluetooth.BluetoothGatt.GATT_INSUFFICIENT_ENCRYPTION;
import static android.bluetooth.BluetoothGatt.GATT_INVALID_ATTRIBUTE_LENGTH;
import static android.bluetooth.BluetoothGatt.GATT_INVALID_OFFSET;
import static android.bluetooth.BluetoothGatt.GATT_READ_NOT_PERMITTED;
import static android.bluetooth.BluetoothGatt.GATT_REQUEST_NOT_SUPPORTED;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothGatt.GATT_WRITE_NOT_PERMITTED;
import static android.bluetooth.BluetoothProfile.GATT;
import static android.bluetooth.BluetoothProfile.GATT_SERVER;
import static android.content.Context.BLUETOOTH_SERVICE;
import static chat.berty.ble.BertyConstants.ACCEPT_UUID;
import static chat.berty.ble.BertyConstants.BLUETOOTH_ENABLE_REQUEST;
import static chat.berty.ble.BertyConstants.CLOSER_UUID;
import static chat.berty.ble.BertyConstants.IS_READY_UUID;
import static chat.berty.ble.BertyConstants.MA_UUID;
import static chat.berty.ble.BertyConstants.PEER_ID_UUID;
import static chat.berty.ble.BertyConstants.SERVICE_UUID;
import static chat.berty.ble.BertyConstants.WRITER_UUID;

public class Manager {
    private static Manager instance = null;

    private Context mContext;

    private ActivityGetter mReactContext;

    private Object RmReactContext;

    public String ma;

    public String peerID;

    public static String TAG = "chat.berty.ble.Manager";

    protected HashMap<String, BertyDevice> bertyDevices;

    protected BluetoothAdapter mBluetoothAdapter;

    protected BluetoothGattServer mBluetoothGattServer;

    protected BluetoothLeAdvertiser mBluetoothLeAdvertiser;

    protected BluetoothLeScanner mBluetoothLeScanner;

    protected BluetoothGattService mService;

    public boolean isAdvertising = false;

    public boolean isScanning = false;

    private BertyGattServer mGattServerCallback = new BertyGattServer();

    protected BertyGatt mGattCallback = new BertyGatt();

    private BertyAdvertise mAdvertisingCallback = new BertyAdvertise();

    private BertyScan mScanCallback = new BertyScan();

    public interface ActivityGetter {
        @Nullable Activity getCurrentActivity();
    }

    private Manager() {
        super();
        Thread.currentThread().setName("BleManager");
        Log.e(TAG, "BLEManager init");
    }

    public void setmContext(Context ctx) {
        Log.e(TAG, "BLEManager context set");
        mContext = ctx;
    }

    public void setMa(String ma) {
        this.ma = ma;
        BertyConstants.maCharacteristic.setValue(ma);
        if (this.peerID != "") {
            AdvertiseSettings settings = BertyAdvertise.createAdvSettings(true, 0);
            AdvertiseData advData = BertyAdvertise.makeAdvertiseData();
            mBluetoothLeAdvertiser.startAdvertising(settings, advData, mAdvertisingCallback);
        }
        Log.e(TAG, "BLE MA " + ma);
    }

    public void setPeerID(String peerID) {
        this.peerID = peerID;
        BertyConstants.peerIDCharacteristic.setValue(peerID);
        if (this.ma != "") {
            AdvertiseSettings settings = BertyAdvertise.createAdvSettings(true, 0);
            AdvertiseData advData = BertyAdvertise.makeAdvertiseData();
            mBluetoothLeAdvertiser.startAdvertising(settings, advData, mAdvertisingCallback);
        }
        Log.e(TAG, "BLE PEERID " + peerID);
    }

    public void setmReactContext(Object rCtx, Object t) {
        Log.e(TAG, "BLEManager ReactContext set");
        RmReactContext = t;
        mReactContext = (ActivityGetter)rCtx;
    }

    public void initScannerAndAdvertiser() {
//        BluetoothAdapter.getDefaultAdapter().disable();
        Activity curActivity = mReactContext.getCurrentActivity();
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            curActivity.startActivityForResult(enableBtIntent, BLUETOOTH_ENABLE_REQUEST);
            if (ContextCompat.checkSelfPermission(curActivity,
                    android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            } else {
                ActivityCompat.requestPermissions(curActivity, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION},
                        99);
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            try {
                BluetoothManager mb = (BluetoothManager) mContext.getSystemService(BLUETOOTH_SERVICE);
                Log.e(TAG, "TRY ");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    Log.e(TAG, "TRY 2");
                    mBluetoothLeAdvertiser = BluetoothAdapter.getDefaultAdapter().getBluetoothLeAdvertiser();
                    mBluetoothLeScanner = BluetoothAdapter.getDefaultAdapter().getBluetoothLeScanner();
                    BluetoothGattService svc = BertyConstants.createService();



                    mBluetoothGattServer = mb.openGattServer(mContext, mGattServerCallback);
                    mGattServerCallback.mBluetoothGattServer = mBluetoothGattServer;
                    Log.e(TAG, "TEST " + svc + " " + mBluetoothGattServer);

                    mBluetoothGattServer.addService(svc);
                    ScanSettings settings2 = BertyScan.createScanSetting();
                    ScanFilter filter = BertyScan.makeFilter();
                    Log.e(TAG, "START SCANNING");
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        mBluetoothLeScanner.startScan(Arrays.asList(filter), settings2, mScanCallback);
                    }

                }

            } catch (Exception e) {
                Log.e(TAG, "ECECE " + e);
            }
        }
    }

    public void closeScannerAndAdvertiser() {
        stopScanning();
        stopAdvertising();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mBluetoothGattServer.close();
        }
    }

    public void closeConnFromMa(String rMa) {
        BertyDevice bDevice = getDeviceFromMa(rMa);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            bDevice.gatt.disconnect();
        }
        synchronized (bertyDevices) {
            bertyDevices.remove(bDevice.addr);
        }
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


    public void startAdvertising() {
        AdvertiseSettings settings = BertyAdvertise.createAdvSettings(true, 0);
        AdvertiseData advData = BertyAdvertise.makeAdvertiseData();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Log.e(TAG, "ADV see " + settings + " data " + advData + " cb " + mAdvertisingCallback);
//            mBluetoothLeAdvertiser.startAdvertising(settings, advData, mAdvertisingCallback);
        }
    }

    public void stopAdvertising() {
        isAdvertising = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Log.e(TAG, "STOP ADV");
            mBluetoothLeAdvertiser.stopAdvertising(mAdvertisingCallback);
        }
    }

    public void startScanning() {
        ScanSettings settings = BertyScan.createScanSetting();
        ScanFilter filter = BertyScan.makeFilter();
        Log.e(TAG, "START SCANNING");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
//            mBluetoothLeScanner.startScan(Arrays.asList(filter), settings, mScanCallback);
        }
    }

    public void stopScanning() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mBluetoothLeScanner.stopScan(mScanCallback);
        }
    }

    public @Nullable BertyDevice getDeviceFromAddr(String addr) {
        synchronized (bertyDevices) {
            if (bertyDevices.containsKey(addr)) {
                return bertyDevices.get(addr);
            }
        }

        return null;
    }

    public @Nullable BertyDevice getDeviceFromMa(String ma) {
        synchronized (bertyDevices) {
            BertyDevice bDevice = null;
            for (Map.Entry<String, BertyDevice> entry : bertyDevices.entrySet()) {
                bDevice = entry.getValue();
                if (bDevice.ma.equals(ma)) {
                    return bDevice;
                }
            }
        }
        return null;
    }

    public boolean dialPeer(String ma) {
        BertyDevice bDevice = getDeviceFromMa(ma);
        if (bDevice != null) {
            return true;
        }
        return false;
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
    public void populateCharacteristic(BluetoothGatt gatt) {
        BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
        ExecutorService es = Executors.newFixedThreadPool(6);
        List<PopulateCharacteristic> todo = new ArrayList<>(6);

        todo.add(new PopulateCharacteristic(MA_UUID, bDevice));
        todo.add(new PopulateCharacteristic(PEER_ID_UUID, bDevice));
        todo.add(new PopulateCharacteristic(CLOSER_UUID, bDevice));
        todo.add(new PopulateCharacteristic(WRITER_UUID, bDevice));
        todo.add(new PopulateCharacteristic(IS_READY_UUID, bDevice));
        todo.add(new PopulateCharacteristic(ACCEPT_UUID, bDevice));

        Log.e(TAG, "START DISCO CHAR");

        try {
            List<Future<BluetoothGattCharacteristic>> answers = es.invokeAll(todo);
            for (Future<BluetoothGattCharacteristic> future : answers) {
                BluetoothGattCharacteristic c = future.get();

                if (c != null && c.getUuid().equals(MA_UUID)) {
                    bDevice.maCharacteristic = c;
                    bDevice.waitReady.countDown();
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            Thread.currentThread().setName("ReadMaWaiter");
                            while (!gatt.readCharacteristic(bDevice.maCharacteristic)) {
                                Log.e(TAG, "Gonna wait");
                                try {
                                    Thread.sleep(4000);
                                } catch (InterruptedException e) {
                                    e.printStackTrace();
                                }
                            }
                            Log.e(TAG, "TEST        " + bDevice.maCharacteristic.getValue());
                        }
                    }).start();
                } else if (c != null && c.getUuid().equals(PEER_ID_UUID)) {
                    bDevice.peerIDCharacteristic = c;
                    bDevice.waitReady.countDown();
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            Thread.currentThread().setName("ReadPeerWaiter");
                            while (!gatt.readCharacteristic(bDevice.peerIDCharacteristic)) {
                                Log.e(TAG, "Gonna wait");
                                try {
                                    Thread.sleep(4000);
                                } catch (InterruptedException e) {
                                    e.printStackTrace();
                                }
                            }
                            Log.e(TAG, "TEST        " + bDevice.peerIDCharacteristic.getValue());
                        }
                    }).start();
                } else if (c != null && c.getUuid().equals(CLOSER_UUID)) {
                    bDevice.closerCharacteristic = c;
                    bDevice.waitReady.countDown();
                } else if (c != null && c.getUuid().equals(WRITER_UUID)) {
                    bDevice.writerCharacteristic = c;
                    bDevice.waitReady.countDown();
                } else if (c != null && c.getUuid().equals(IS_READY_UUID)) {
                    bDevice.isRdyCharacteristic = c;
                    bDevice.waitReady.countDown();
                } else if (c != null && c.getUuid().equals(ACCEPT_UUID)) {
                    bDevice.acceptCharacteristic = c;
                    bDevice.waitReady.countDown();
                } else {
                    Log.e(TAG, "UNKNOW CHARACT");
                }

                Log.e(TAG, "UUID " + c.getUuid());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        while (!gatt.requestMtu(512)) {
            /** intentionally empty */
        }
    }

    public void handleMaRead(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        String newMa = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR2) {
            newMa = new String(characteristic.getValue(), Charset.forName("UTF-8"));
        }
        if (device.ma == null || device.ma == "" || !device.ma.equals(newMa)) {
            device.ma = newMa;
            if (device.peerID == null || device.peerID == "" || !device.ma.equals(newMa)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                    device.gatt.readCharacteristic(device.gatt.getService(SERVICE_UUID).getCharacteristic(PEER_ID_UUID));
                }
            }
            device.waitReady.countDown();
        }
    }

    public void handlePeerIDRead(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        String newPeerID = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR2) {
            newPeerID = new String(characteristic.getValue(), Charset.forName("UTF-8"));
        }
        if (device.peerID == null || device.peerID == "" || !device.peerID.equals(newPeerID)) {
            device.peerID = newPeerID;
            if (device.ma == null || device.ma == "" || !device.peerID.equals(newPeerID)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                    device.gatt.readCharacteristic(device.gatt.getService(SERVICE_UUID).getCharacteristic(MA_UUID));
                }
            }
            device.waitReady.countDown();
        }
    }

    public void handleReadCharact(BertyDevice device, BluetoothGattCharacteristic characteristic) {
        Log.e(TAG, "READ CHARACT");
        UUID charID = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR2) {
            charID = characteristic.getUuid();
        }
        if (charID.equals(MA_UUID)) {
            handleMaRead(device, characteristic);
        } else if (charID.equals(PEER_ID_UUID)) {
            handlePeerIDRead(device, characteristic);
        }
    }

    public boolean write(byte[] p, String ma) {
        BertyDevice bDevice = getDeviceFromMa(ma);

        if (bDevice == null) {
            Log.e(TAG, "Unknow device to write");
            return false;
        }

        try {
            bDevice.write(p);
        } catch (Exception e) {
            return false;
        }

        return true;
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

    @Override
    protected void finalize() throws Throwable {
        try {
            mBluetoothGattServer.clearServices();
            stopAdvertising();
            stopScanning();
        } finally {
            super.finalize();
        }
    }
}
