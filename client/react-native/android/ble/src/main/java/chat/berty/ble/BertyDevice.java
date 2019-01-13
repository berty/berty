package tech.berty.bletesting;

import android.os.Build;
import android.content.Context;
import android.annotation.TargetApi;

import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothGattCharacteristic;

import static android.bluetooth.BluetoothProfile.GATT;
import static android.bluetooth.BluetoothProfile.GATT_SERVER;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTING;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
class BertyDevice {
    private static final String TAG = "device";


    // Timeout and maximum attempts for GATT connection
    private static final int gattConnectMaxAttempts = 10;
    private static final int gattWaitConnectAttemptTimeout = 420;
    private static final int gattWaitConnectMaxAttempts = 10;
    private static final int gattConnectingAttemptTimeout = 240;
    private static final int gattConnectingMaxAttempts = 5;

    // Timeout and maximum attempts for service discovery and check
    private static final int deviceCheckTimeout = 30000;
    private static final int servDiscoveryAttemptTimeout = 1000;
    private static final int servDiscoveryMaxAttempts = 20;
    private static final int servCheckTimeout = 30000;

    // Timeout for remote device response
    private static final int waitInfosReceptionTimeout = 60000;

    // Timeout and maximum attempts for write operation
    private static final int initWriteAttemptTimeout = 40;
    private static final int initWriteMaxAttempts = 1000;
    private static final int writeDoneTimeout = 60000;

    // GATT connection attributes
    private BluetoothGatt dGatt;
    private BluetoothDevice dDevice;
    private String dAddr;
    private int dMtu;

    private static final int DEFAULT_MTU = 23;

    private BluetoothGattService bertyService;
    private BluetoothGattCharacteristic maCharacteristic;
    private BluetoothGattCharacteristic peerIDCharacteristic;
    BluetoothGattCharacteristic writerCharacteristic;


    // Berty identification attributes
    private String dPeerID;
    private String dMultiAddr;
    private boolean identified;

    // Semaphores / latch / buffer used for async connection / write operation / infos receptions
    CountDownLatch infosReceived = new CountDownLatch(2); // Latch for MultiAddr and PeerID reception from remote device
    Semaphore waitServiceCheck = new Semaphore(0); // Lock for callback that check discovered services
    Semaphore waitWriteDone = new Semaphore(1); // Lock for waiting completion of write operation

    private Semaphore lockConnAttempt = new Semaphore(1); // Lock to prevent more than one GATT connection attempt at once
    private Semaphore lockHandshakeAttempt = new Semaphore(1); // Lock to prevent more than one handshake attempt at once

    private final List<byte[]> toSend = new ArrayList<>();


    BertyDevice(BluetoothDevice device) {
        dAddr = device.getAddress();
        dDevice = device;
        dMtu = DEFAULT_MTU;
    }


    // Berty identification related
    String getAddr() { return dAddr; }

    void setMultiAddr(String multiAddr) {
        Log.d(TAG, "setMultiAddr() called for device: " + dDevice + " with current multiAddr: " + dMultiAddr + ", new multiAddr: " + multiAddr);

        dMultiAddr = multiAddr;

        if (dMultiAddr.length() > 36) {
            Log.e(TAG, "setMultiAddr() error: MultiAddr can't be greater than 36 bytes, string will be truncated. Device: " + dDevice);
            dMultiAddr = dMultiAddr.substring(0, 35);
        }
    }

    String getMultiAddr() { return dMultiAddr; }

    void setPeerID(String peerID) {
        Log.d(TAG, "setPeerID() called for device: " + dDevice + " with current peerID: " + dPeerID + ", new peerID: " + peerID);
        dPeerID = peerID;

        if (dPeerID.length() > 46) {
            Log.e(TAG, "setPeerID() error: PeerID can't be greater than 46 bytes, string will be truncated. Device: " + dDevice);
            dPeerID = dPeerID.substring(0, 45);
        }
    }

    String getPeerID() { return dPeerID; }

    void setBertyService(BluetoothGattService service) {
        Log.d(TAG, "setBertyService() called for device: " + dDevice + " with current service: " + bertyService + ", new service: " + service);

        bertyService = service;
    }

    boolean isIdentified() {
        Log.v(TAG, "isIdentified() called for device: " + dDevice + ", state: " + (identified ? "identified" : "unidentified"));

        return identified;
    }


    // Attempt to (re)connect GATT then, if device isn't already identified, init Berty handshake
    void asyncConnectionToDevice() {
        Log.d(TAG, "asyncConnectionToDevice() called for device: " + dDevice);

        new Thread(new Runnable() {
            @Override
            public void run() {
                if (lockConnAttempt.tryAcquire()) {
                    Log.d(TAG, "asyncConnectionToDevice() try to connect GATT with device: " + dDevice);

                    if (connectGatt()) {
                        lockConnAttempt.release(); // Released now because it could be useful to reconnect during handshake

                        if (!identified) {
                            if (lockHandshakeAttempt.tryAcquire()) {
                                Log.d(TAG, "asyncConnectionToDevice() try to Berty handshake with device: " + dDevice);

                                if (bertyHandshake()) {
                                    Log.i(TAG, "asyncConnectionToDevice() succeeded with device: " + dDevice + ", MultiAddr: " + dMultiAddr + ", PeerID: " + dPeerID);
                                    identified = true;
                                    // TODO: core.addToPeerstore
                                } else {
                                    Log.d(TAG, "asyncConnectionToDevice() Berty handshake failed with device: " + dDevice);
                                    disconnectFromDevice();
                                }
                                lockHandshakeAttempt.release();
                            } else {
                                Log.d(TAG, "asyncConnectionToDevice() skipped Berty handshake: already running for device: " + dDevice);
                            }
                        } else {
                            Log.i(TAG, "asyncConnectionToDevice() GATT reconnection succeeded for device: " + dDevice);
                        }
                    } else {
                        if (identified) {
                            Log.e(TAG, "asyncConnectionToDevice() reconnection failed: connection lost with previously connected device: " + dDevice + ", MultiAddr: " + dMultiAddr + ", PeerID: " + dPeerID);
                            // TODO: core.connClosed
                        } else {
                            Log.e(TAG, "asyncConnectionToDevice() failed: can't connect GATT with device: " + dDevice);
                        }
                        lockConnAttempt.release();
                        disconnectFromDevice();
                    }
                } else {
                    Log.d(TAG, "asyncConnectionToDevice() skipped GATT connection attempt: already running for device: " + dDevice);
                }
            }
        }).start();
    }

    // Disconnect device and remove it from index
    private void disconnectFromDevice() {
        Log.d(TAG, "disconnectFromDevice() called for device: " + dDevice);

        try {
            lockConnAttempt.acquire();
            disconnectGatt();
            DeviceManager.removeDeviceFromIndex(this);
            lockConnAttempt.release();
        } catch (Exception e) {
            Log.d(TAG, "disconnectFromDevice() failed: " + e.getMessage() + " for device: " + dDevice);
        }
    }


    // GATT related
    private void setGatt() {
        Log.d(TAG, "setGatt() called for device: " + dDevice);

        if (dGatt == null) {
            dGatt = dDevice.connectGatt(AppData.getCurrContext(), false, BleManager.getGattCallback());
        }
    }

    private boolean connectGatt() {
        Log.d(TAG, "connectGatt() called for device: " + dDevice);

        try {
            setGatt();
            for (int attempt = 0; attempt < gattConnectMaxAttempts; attempt++) {
                Log.d(TAG, "connectGatt() attempt: " + (attempt + 1) + "/" + gattConnectMaxAttempts + ", device:" + dDevice + ", client state: " + Helper.connectionStateToString(getGattClientState()) + ", server state: "  + Helper.connectionStateToString(getGattServerState()));

                dGatt.connect();

                for (int gattWaitConnectAttempt = 0; gattWaitConnectAttempt < gattWaitConnectMaxAttempts; gattWaitConnectAttempt++) {
                    Log.d(TAG, "connectGatt() wait " + gattWaitConnectAttemptTimeout + "ms (disconnected state) " + gattWaitConnectAttempt + "/" + gattWaitConnectMaxAttempts + " for device: " + dDevice);
                    Thread.sleep(gattWaitConnectAttemptTimeout);

                    if (getGattClientState() == STATE_CONNECTING || getGattServerState() == STATE_CONNECTING) {
                        for (int gattConnectingAttempt = 0; gattConnectingAttempt < gattConnectingMaxAttempts; gattConnectingAttempt++) {
                            Log.d(TAG, "connectGatt() wait " + gattConnectingAttemptTimeout + "ms (connecting state) " + gattConnectingAttempt + "/" + gattConnectingMaxAttempts + " for device: " + dDevice);
                            Thread.sleep(gattConnectingAttemptTimeout);

                            if (isGattConnected()) {
                                break;
                            }
                        }
                    }

                    if (isGattConnected()) {
                        Log.i(TAG, "connectGatt() succeeded for device: " + dDevice);
                        return true;
                    }
                }
                disconnectGatt();
                setGatt();
            }

            Log.e(TAG, "connectGatt() failed for device: " + dDevice);
        } catch (Exception e) {
            Log.e(TAG, "connectGatt() failed: " + e.getMessage() + " for device: " + dDevice);
        }

        return false;
    }

    // TODO: set this as private
    void disconnectGatt() {
        Log.d(TAG, "disconnectGatt() called for device: " + dDevice);

        if (dGatt != null) {
            dGatt.disconnect();
            dGatt.close();
            dGatt = null;
        }
    }

    void setMtu(int mtu) {
        Log.i(TAG, "setMtu() called for device: " + dDevice + " with current mtu: " + dMtu + ", new mtu: " + mtu);

        dMtu = mtu;
    }

    int getGattClientState() {
        Log.v(TAG, "getGattClientState() called for device: " + dDevice);

        final Context context = AppData.getCurrContext();
        final BluetoothManager manager = (BluetoothManager)context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager == null) {
            Log.e(TAG, "Can't get BLE Manager");
            return STATE_DISCONNECTED;
        }

        return manager.getConnectionState(dDevice, GATT);
    }

    int getGattServerState() {
        Log.v(TAG, "getGattServerState() called for device: " + dDevice);

        final Context context = AppData.getCurrContext();
        final BluetoothManager manager = (BluetoothManager)context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager == null) {
            Log.e(TAG, "Can't get BLE Manager");
            return STATE_DISCONNECTED;
        }

        return manager.getConnectionState(dDevice, GATT_SERVER);
    }

    boolean isGattConnected() {
        Log.v(TAG, "isGattConnected() called for device: " + dDevice);

        return (getGattServerState() == STATE_CONNECTED && getGattClientState() == STATE_CONNECTED);
    }


    // Check if remote device is Berty compliant then, if yes, two-way exchange MultiAddr and PeerID
    private boolean bertyHandshake() {
        Log.d(TAG, "bertyHandshake() called for device: " + dDevice);

        if (checkBertyDeviceCompliance() && sendInfosToRemoteDevice() && receiveInfosFromRemoteDevice()) {
            Log.i(TAG, "bertyHandshake() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "bertyHandshake() failed for device: " + dDevice);

        return false;
    }


    // Wait for discovery and check if service and characteristics are Berty device compliant
    private boolean checkBertyDeviceCompliance() {
        Log.d(TAG, "checkBertyDeviceCompliance() called for device: " + dDevice);

        if (checkBertyServiceCompliance() && checkBertyCharacteristicsCompliance()) {
            Log.i(TAG, "checkBertyDeviceCompliance() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "checkBertyDeviceCompliance() failed for device: " + dDevice);

        return false;
    }

    private boolean checkBertyServiceCompliance() {
        Log.d(TAG, "checkBertyServiceCompliance() called for device: " + dDevice);

        try {
            // Wait for services discovery started
            for (int servDiscoveryAttempt = 0; servDiscoveryAttempt < servDiscoveryMaxAttempts && !dGatt.discoverServices(); servDiscoveryAttempt++) {
                if (isGattConnected()) {
                    Log.d(TAG, "checkBertyServiceCompliance() device " + dDevice + " GATT is connected, waiting for service discovery: " + servDiscoveryAttempt + "/" + servDiscoveryMaxAttempts);
                    Thread.sleep(servDiscoveryAttemptTimeout);
                } else {
                    Log.e(TAG, "checkBertyServiceCompliance() failed: device " + dDevice + " GATT is disconnected");
                    return false;
                }
            }

            // Wait for services discovery completed and check that Berty service is found
            if (waitServiceCheck.tryAcquire(servCheckTimeout, TimeUnit.MILLISECONDS)) {
                if (bertyService != null) {
                    Log.i(TAG, "checkBertyServiceCompliance() succeeded for device: " + dDevice);
                    return true;
                } else {
                    Log.e(TAG, "checkBertyServiceCompliance() failed: Berty service not found on device: " + dDevice);
                }
            } else {
                Log.e(TAG, "checkBertyServiceCompliance() timeouted for device: " + dDevice);
            }
        } catch (Exception e) {
            Log.e(TAG, "checkBertyServiceCompliance() failed: " + e.getMessage() + ", for device: " + dDevice);
        }

        return false;
    }

    private boolean checkBertyCharacteristicsCompliance() {
        Log.d(TAG, "checkBertyCharacteristicsCompliance() called for device: " + dDevice);

        class PopulateCharacteristic implements Callable<BluetoothGattCharacteristic> {
            private UUID uuid;

            private PopulateCharacteristic(UUID charaUUID) {
                Log.d(TAG, "PopulateCharacteristic with UUID: " + charaUUID + " for device: " + dDevice);

                uuid = charaUUID;
            }

            public BluetoothGattCharacteristic call() {
                return bertyService.getCharacteristic(uuid);
            }
        }

        ExecutorService es = Executors.newFixedThreadPool(3);
        List<PopulateCharacteristic> todo = new ArrayList<>(3);

        todo.add(new PopulateCharacteristic(BleManager.MA_UUID));
        todo.add(new PopulateCharacteristic(BleManager.PEER_ID_UUID));
        todo.add(new PopulateCharacteristic(BleManager.WRITER_UUID));

        try {
            List<Future<BluetoothGattCharacteristic>> answers = es.invokeAll(todo);
            for (Future<BluetoothGattCharacteristic> future : answers) {
                BluetoothGattCharacteristic characteristic = future.get();

                if (characteristic != null && characteristic.getUuid().equals(BleManager.MA_UUID)) {
                    Log.d(TAG, "checkBertyCharacteristicsCompliance() MultiAddr characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    maCharacteristic = characteristic;
                } else if (characteristic != null && characteristic.getUuid().equals(BleManager.PEER_ID_UUID)) {
                    Log.d(TAG, "checkBertyCharacteristicsCompliance() PeerID characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    peerIDCharacteristic = characteristic;
                } else if (characteristic != null && characteristic.getUuid().equals(BleManager.WRITER_UUID)) {
                    Log.d(TAG, "checkBertyCharacteristicsCompliance() Writer characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    writerCharacteristic = characteristic;
                } else {
                    Log.e(TAG, "checkBertyCharacteristicsCompliance() unknown characteristic retrieved: " + characteristic + " on device: " + dDevice);
                }
            }

            if (maCharacteristic != null && peerIDCharacteristic != null && writerCharacteristic != null) {
                Log.i(TAG, "checkBertyCharacteristicsCompliance() succeeded for device: " + dDevice);
                return true;
            } else {
                Log.e(TAG, "checkBertyCharacteristicsCompliance() failed: can't retrieve Berty characteristics on device: " + dDevice + ", maCharacteristic: " + maCharacteristic + ", peerIDCharacteristic: " + peerIDCharacteristic + ", writerCharacteristic: " + writerCharacteristic);
            }
        } catch (Exception e) {
            Log.e(TAG, "checkBertyCharacteristicsCompliance() failed: " + e.getMessage() + " for device: " + dDevice);
        }

        return false;
    }


    // Send own MultiAddress and PeerID to remote device
    private boolean sendInfosToRemoteDevice() {
        Log.d(TAG, "sendInfosToRemoteDevice() called for device: " + dDevice);

        if (writeOnCharacteristic(BleManager.getMultiAddr().getBytes(Charset.forName("UTF-8")), maCharacteristic)) {
            if (writeOnCharacteristic(BleManager.getPeerID().getBytes(Charset.forName("UTF-8")), peerIDCharacteristic)) {
                Log.i(TAG, "sendInfosToRemoteDevice() succeeded for device: " + dDevice);
                return true;
            } else {
                Log.e(TAG, "sendInfosToRemoteDevice() failed: can't send PeerID to device: " + dDevice);
            }
        } else {
            Log.e(TAG, "sendInfosToRemoteDevice() failed: can't send MultiAddr to device: " + dDevice);
        }

        return false;
    }

    // Wait reception of MultiAddress and PeerID from remote device
    private boolean receiveInfosFromRemoteDevice() {
        Log.d(TAG, "receiveInfosFromRemoteDevice() called for device: " + dDevice);

        try {
            if (infosReceived.await(waitInfosReceptionTimeout, TimeUnit.MILLISECONDS)) {
                Log.i(TAG, "receiveInfosFromRemoteDevice() succeeded for device: " + dDevice);
                return true;
            }
            Log.e(TAG, "receiveInfosFromRemoteDevice() timeouted for device: " + dDevice + ", MultiAddr: " + dMultiAddr + ", PeerID: " + dPeerID);
        } catch (Exception e) {
            Log.e(TAG, "receiveInfosFromRemoteDevice() failed: " + e.getMessage() + ", for device: " + dDevice);
        }

        return false;
    }


    // Write a blob on a specific remote device characteristic
    boolean writeOnCharacteristic(byte[] payload, BluetoothGattCharacteristic characteristic) {
        Log.d(TAG, "writeOnCharacteristic() called for device: " + dDevice);

        try {
            synchronized (toSend) {
                String data = new String(payload, Charset.forName("UTF-8"));
                int length = data.length();
                int offset = 0;

                do {
                    // BLE protocol reserves 3 bytes out of MTU_SIZE for metadata
                    // https://www.oreilly.com/library/view/getting-started-with/9781491900550/ch04.html#gatt_writes
                    int chunkSize = (length - offset > dMtu - 3) ? dMtu - 3 : length - offset;
                    byte[] chunk = data.substring(offset, offset + chunkSize).getBytes(Charset.forName("UTF-8"));
                    offset += chunkSize;
                    toSend.add(chunk);
                } while (offset < length);

                while (!toSend.isEmpty()) {
                    characteristic.setValue(toSend.get(0));
                    for (int attempt = 0; !dGatt.writeCharacteristic(characteristic); attempt++) {
                        if (attempt == initWriteMaxAttempts) {
                            Log.e(TAG, "writeOnCharacteristic() wait for write init timeouted for device:" + dDevice);
                            return false;
                        }

                        Log.v(TAG, "writeOnCharacteristic() wait for write init: " + (attempt + 1) + "/" + initWriteMaxAttempts + ", device:" + dDevice);
                        Thread.sleep(initWriteAttemptTimeout);
                    }
                    if (!waitWriteDone.tryAcquire(writeDoneTimeout, TimeUnit.MILLISECONDS)) {
                        Log.e(TAG, "writeOnCharacteristic() timeouted for device:" + dDevice);
                        return false;
                    }
                    toSend.remove(0);
                }
                Log.d(TAG, "writeOnCharacteristic() succeeded for device:" + dDevice + " with payload: " + new String(payload, Charset.forName("UTF-8")));
                return true;
            }
        } catch (Exception e) {
            Log.e(TAG, "writeOnCharacteristic() failed: " + e.getMessage() + "for device: " + dDevice);
            return false;
        }
    }
}