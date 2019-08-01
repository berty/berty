package libp2p.transport.ble;

import core.Core;

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

import java.util.ArrayList;
import java.util.Arrays;
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
class PeerDevice {
    private static final String TAG = "device";

    // Timeout and maximum attempts for GATT connection
    private static final int gattConnectMaxAttempts = 20;
    private static final int gattWaitConnectAttemptTimeout = 420;
    private static final int gattWaitConnectMaxAttempts = 10;
    private static final int gattConnectingAttemptTimeout = 240;
    private static final int gattConnectingMaxAttempts = 5;
    private static final int waitAfterHandshakeAndGattConnectAttempt = 2000;
    private static final int waitAfterDeviceDisconnect = 3000;
    private static final int waitAfterGattDisconnect = 500;
    private static final int waitAfterGattSetup = 500;

    // Timeout and maximum attempts for service/characteristics discovery and check
    private static final int servDiscoveryAttemptTimeout = 1000;
    private static final int servDiscoveryMaxAttempts = 20;
    private static final int servCheckTimeout = 30000;
    private static final int charDiscoveryTimeout = 1000;

    // Timeout for remote device response
    private static final int waitInfosReceptionTimeout = 60000;

    // Timeout and maximum attempts for write operation
    private static final int initWriteAttemptTimeout = 40;
    private static final int initWriteMaxAttempts = 1000;
    private static final int writeDoneTimeout = 60000;

    // GATT connection attributes
    private BluetoothGatt dGatt;
    private final BluetoothDevice dDevice;
    private final String dAddr;
    private int dMtu;

    private static final int DEFAULT_MTU = 23; // See https://chromium.googlesource.com/aosp/platform/system/bt/+/29e794418452c8b35c2d42fe0cda81acd86bbf43/stack/include/gatt_api.h#133
    private static final int MAXIMUM_MTU = 517; // See https://chromium.googlesource.com/aosp/platform/system/bt/+/29e794418452c8b35c2d42fe0cda81acd86bbf43/stack/include/gatt_api.h#123

    private BluetoothGattService libp2pService;
    private BluetoothGattCharacteristic maCharacteristic;
    private BluetoothGattCharacteristic peerIDCharacteristic;
    BluetoothGattCharacteristic writerCharacteristic;


    // Libp2p identification attributes
    private String dPeerID;
    private String dMultiAddr;
    private boolean identified;

    // Semaphores / latch / buffer used for async connection / write operation / infos receptions
    final CountDownLatch infosReceived = new CountDownLatch(2); // Latch for MultiAddr and PeerID reception from remote device
    final Semaphore waitServiceCheck = new Semaphore(0); // Lock for callback that check discovered services
    final Semaphore waitWriteDone = new Semaphore(1); // Lock for waiting completion of write operation

    private final Semaphore lockConnAttempt = new Semaphore(1); // Lock to prevent more than one GATT connection attempt at once
    private final Semaphore lockHandshakeAttempt = new Semaphore(1); // Lock to prevent more than one handshake attempt at once

    private final List<byte[]> toSend = new ArrayList<>();


    PeerDevice(BluetoothDevice device) {
        dAddr = device.getAddress();
        dDevice = device;
        dMtu = DEFAULT_MTU;
    }


    // Libp2p identification related
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

    void setLibp2pService(BluetoothGattService service) {
        Log.d(TAG, "setLibp2pService() called for device: " + dDevice + " with current service: " + libp2pService + ", new service: " + service);

        libp2pService = service;
    }

    boolean isIdentified() {
        Log.v(TAG, "isIdentified() called for device: " + dDevice + ", state: " + (identified ? "identified" : "unidentified"));

        return identified;
    }

    // Attempt to (re)connect GATT then, if device isn't already identified, init Libp2p handshake
    void asyncConnectionToDevice(final String caller) {
        Log.d(TAG, "asyncConnectionToDevice() called for device: " + dDevice + ", caller: " + caller);

        if (lockConnAttempt.tryAcquire()) {
            new Thread(() -> {
                Thread.currentThread().setName("asyncConnectionToDevice() " + dDevice + ", caller: " + caller);

                String callerAndThread = caller + ", thread: " + Thread.currentThread().getId();
                Log.i(TAG, "asyncConnectionToDevice() try to connect GATT with device: " + dDevice + ", caller: " + callerAndThread);

                try {
                    if (connectGatt(callerAndThread)) {
                        Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);
                        lockConnAttempt.release(); // Released now because it could be useful to reconnect during handshake

                        if (!identified) {
                            if (lockHandshakeAttempt.tryAcquire()) {
                                Log.i(TAG, "asyncConnectionToDevice() try to Libp2p handshake with device: " + dDevice + ", caller: " + callerAndThread);

                                if (libp2pHandshake(callerAndThread)) {
                                    Log.i(TAG, "asyncConnectionToDevice() succeeded with device: " + dDevice + ", MultiAddr: " + dMultiAddr + ", PeerID: " + dPeerID + ", caller: " + callerAndThread);
                                    identified = true;

                                    if (dMtu == DEFAULT_MTU) {
                                        Log.i(TAG, "asyncConnectionToDevice() try to agree on a new MTU with device: " + dDevice + ", caller: " + callerAndThread);
                                        dGatt.requestMtu(MAXIMUM_MTU);
                                        Thread.sleep(300); // Wait for new MTU before starting the libp2p connect
                                    }

                                    if (Core.handlePeerFound(dPeerID, dMultiAddr)) {
                                        Log.i(TAG, "asyncConnectionToDevice() peer handled successfully by golang with device: " + dDevice + ", caller: " + callerAndThread);
                                    } else {
                                        Log.e(TAG, "asyncConnectionToDevice() failed: golang can't handle new peer for device: " + dDevice + ", caller: " + callerAndThread);
                                        disconnectFromDevice("Libp2p handshake failed, caller: " + callerAndThread);
                                    }
                                } else {
                                    Log.d(TAG, "asyncConnectionToDevice() Libp2p handshake failed with device: " + dDevice + ", caller: " + callerAndThread);
                                    disconnectFromDevice("Libp2p handshake failed, caller: " + callerAndThread);
                                }
                                Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);
                                lockHandshakeAttempt.release();
                            } else {
                                Log.d(TAG, "asyncConnectionToDevice() skipped Libp2p handshake: already running for device: " + dDevice);
                            }
                        } else {
                            Log.i(TAG, "asyncConnectionToDevice() GATT reconnection succeeded for device: " + dDevice + ", caller: " + callerAndThread);
                        }
                    } else {
                        if (identified) {
                            Log.e(TAG, "asyncConnectionToDevice() reconnection failed: connection lost with previously connected device: " + dDevice + ", MultiAddr: " + dMultiAddr + ", PeerID: " + dPeerID + ", caller: " + callerAndThread);
                        } else {
                            Log.e(TAG, "asyncConnectionToDevice() failed: can't connect GATT with device: " + dDevice + ", caller: " + callerAndThread);
                        }
                        Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);
                        lockConnAttempt.release();
                        disconnectFromDevice("GATT failed" + ", caller: " + callerAndThread);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "asyncConnectionToDevice() failed: " + e.getMessage() + " for device: " + dDevice + ", caller: " + callerAndThread);

                    if (lockConnAttempt.availablePermits() == 0) {
                        lockConnAttempt.release();
                    }

                    if (lockHandshakeAttempt.availablePermits() == 0) {
                        lockHandshakeAttempt.release();
                    }
                }
            }).start();
        } else {
            Log.w(TAG, "asyncConnectionToDevice() skipped GATT connection attempt: already running for device: " + dDevice + ", caller: " + caller);
        }
    }

    // Disconnect device and remove it from index
    private void disconnectFromDevice(String cause) {
        Log.w(TAG, "disconnectFromDevice() called for device: " + dDevice + " caused by: " + cause);

        try {
            lockConnAttempt.acquire();
            disconnectGatt();
            Thread.sleep(waitAfterDeviceDisconnect);
            DeviceManager.removeDeviceFromIndex(this);
            lockConnAttempt.release();
        } catch (Exception e) {
            Log.d(TAG, "disconnectFromDevice() failed: " + e.getMessage() + " for device: " + dDevice);
        }
    }

    void asyncDisconnectFromDevice(String cause) {
        Log.w(TAG, "asyncDisconnectFromDevice() called for device: " + dDevice + " caused by: " + cause);

        new Thread(() -> disconnectFromDevice(cause)).start();
    }


    // GATT related
    private void setGatt() {
        Log.d(TAG, "setGatt() called for device: " + dDevice);

        if (dGatt == null) {
            dGatt = dDevice.connectGatt(BleManager.getContext(), false, BleManager.getGattCallback());
        }
    }

    private boolean connectGatt(String caller) {
        Log.i(TAG, "connectGatt() called for device: " + dDevice + ", caller: " + caller);

        try {
            setGatt();
            for (int attempt = 0; attempt < gattConnectMaxAttempts; attempt++) {
                Log.d(TAG, "connectGatt() attempt: " + (attempt + 1) + "/" + gattConnectMaxAttempts + ", device:" + dDevice + ", client state: " + Log.connectionStateToString(getGattClientState()) + ", server state: "  + Log.connectionStateToString(getGattServerState()));

                dGatt.connect();

                for (int gattWaitConnectAttempt = 0; gattWaitConnectAttempt < gattWaitConnectMaxAttempts; gattWaitConnectAttempt++) {
                    Log.d(TAG, "connectGatt() wait " + gattWaitConnectAttemptTimeout + "ms (disconnected state) " + (gattWaitConnectAttempt + 1) + "/" + gattWaitConnectMaxAttempts + " for device: " + dDevice);
                    Thread.sleep(gattWaitConnectAttemptTimeout);

                    if (getGattClientState() == STATE_CONNECTING || getGattServerState() == STATE_CONNECTING) {
                        for (int gattConnectingAttempt = 0; gattConnectingAttempt < gattConnectingMaxAttempts; gattConnectingAttempt++) {
                            Log.d(TAG, "connectGatt() wait " + gattConnectingAttemptTimeout + "ms (connecting state) " + (gattConnectingAttempt + 1) + "/" + gattConnectingMaxAttempts + " for device: " + dDevice);
                            Thread.sleep(gattConnectingAttemptTimeout);

                            if (isGattConnected()) {
                                break;
                            }
                        }
                    }

                    if (isGattConnected()) {
                        Log.i(TAG, "connectGatt() succeeded for device: " + dDevice + " caller: " + caller);
                        return true;
                    }
                }
                disconnectGatt();
                Thread.sleep(waitAfterGattDisconnect);
                setGatt();
                Thread.sleep(waitAfterGattSetup);
            }

            Log.e(TAG, "connectGatt() failed for device: " + dDevice);
        } catch (Exception e) {
            Log.e(TAG, "connectGatt() failed: " + e.getMessage() + " for device: " + dDevice);
        }

        return false;
    }

    private void disconnectGatt() {
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

    private int getGattClientState() {
        Log.v(TAG, "getGattClientState() called for device: " + dDevice);

        final Context context = BleManager.getContext();
        final BluetoothManager manager = (BluetoothManager)context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager == null) {
            Log.e(TAG, "Can't get BLE Manager");
            return STATE_DISCONNECTED;
        }

        return manager.getConnectionState(dDevice, GATT);
    }

    private int getGattServerState() {
        Log.v(TAG, "getGattServerState() called for device: " + dDevice);

        final Context context = BleManager.getContext();
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


    // Check if remote device is Libp2p compliant then, if yes, two-way exchange MultiAddr and PeerID
    private boolean libp2pHandshake(String caller) {
        Log.i(TAG, "libp2pHandshake() called for device: " + dDevice + ", caller: " + caller);

        if (checkPeerDeviceLibp2pCompliance() && sendInfosToRemoteDevice() && receiveInfosFromRemoteDevice()) {
            Log.i(TAG, "libp2pHandshake() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "libp2pHandshake() failed for device: " + dDevice);

        return false;
    }


    // Wait for discovery and check if service and characteristics are Libp2p device compliant
    private boolean checkPeerDeviceLibp2pCompliance() {
        Log.d(TAG, "checkPeerDeviceLibp2pCompliance() called for device: " + dDevice);

        if (checkLibp2pServiceCompliance() && checkLibp2pCharacteristicsCompliance()) {
            Log.i(TAG, "checkPeerDeviceLibp2pCompliance() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "checkPeerDeviceLibp2pCompliance() failed for device: " + dDevice);

        return false;
    }

    private boolean checkLibp2pServiceCompliance() {
        Log.d(TAG, "checkLibp2pServiceCompliance() called for device: " + dDevice);

        try {
            // Wait for services discovery started
            for (int servDiscoveryAttempt = 0; servDiscoveryAttempt < servDiscoveryMaxAttempts && !dGatt.discoverServices(); servDiscoveryAttempt++) {
                if (isGattConnected()) {
                    Log.d(TAG, "checkLibp2pServiceCompliance() device " + dDevice + " GATT is connected, waiting for service discovery: " + servDiscoveryAttempt + "/" + servDiscoveryMaxAttempts);
                    Thread.sleep(servDiscoveryAttemptTimeout);
                } else {
                    Log.e(TAG, "checkLibp2pServiceCompliance() failed: device " + dDevice + " GATT is disconnected");
                    return false;
                }
            }

            // Wait for services discovery completed and check that Libp2p service is found
            if (waitServiceCheck.tryAcquire(servCheckTimeout, TimeUnit.MILLISECONDS)) {
                if (libp2pService != null) {
                    Log.i(TAG, "checkLibp2pServiceCompliance() succeeded for device: " + dDevice);
                    return true;
                } else {
                    Log.e(TAG, "checkLibp2pServiceCompliance() failed: Libp2p service not found on device: " + dDevice);
                }
            } else {
                Log.e(TAG, "checkLibp2pServiceCompliance() timeouted for device: " + dDevice);
            }
        } catch (Exception e) {
            Log.e(TAG, "checkLibp2pServiceCompliance() failed: " + e.getMessage() + ", for device: " + dDevice);
        }

        return false;
    }

    private boolean checkLibp2pCharacteristicsCompliance() {
        Log.d(TAG, "checkLibp2pCharacteristicsCompliance() called for device: " + dDevice);

        class PopulateCharacteristic implements Callable<BluetoothGattCharacteristic> {
            private UUID uuid;

            private PopulateCharacteristic(UUID charaUUID) {
                Log.d(TAG, "PopulateCharacteristic with UUID: " + charaUUID + " for device: " + dDevice);

                uuid = charaUUID;
            }

            public BluetoothGattCharacteristic call() {
                return libp2pService.getCharacteristic(uuid);
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
                BluetoothGattCharacteristic characteristic = future.get(charDiscoveryTimeout, TimeUnit.MILLISECONDS);

                if (characteristic != null && characteristic.getUuid().equals(BleManager.MA_UUID)) {
                    Log.d(TAG, "checkLibp2pCharacteristicsCompliance() MultiAddr characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    maCharacteristic = characteristic;
                } else if (characteristic != null && characteristic.getUuid().equals(BleManager.PEER_ID_UUID)) {
                    Log.d(TAG, "checkLibp2pCharacteristicsCompliance() PeerID characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    peerIDCharacteristic = characteristic;
                } else if (characteristic != null && characteristic.getUuid().equals(BleManager.WRITER_UUID)) {
                    Log.d(TAG, "checkLibp2pCharacteristicsCompliance() Writer characteristic retrieved: " + characteristic + " on device: " + dDevice);
                    writerCharacteristic = characteristic;
                } else if (characteristic == null) {
                    Log.e(TAG, "checkLibp2pCharacteristicsCompliance() timeouted on device: " + dDevice);
                    break;
                } else {
                    Log.e(TAG, "checkLibp2pCharacteristicsCompliance() unknown characteristic retrieved: " + characteristic + " on device: " + dDevice);
                }
            }

            if (maCharacteristic != null && peerIDCharacteristic != null && writerCharacteristic != null) {
                Log.i(TAG, "checkLibp2pCharacteristicsCompliance() succeeded for device: " + dDevice);
                return true;
            } else {
                Log.e(TAG, "checkLibp2pCharacteristicsCompliance() failed: can't retrieve Libp2p characteristics on device: " + dDevice + ", maCharacteristic: " + maCharacteristic + ", peerIDCharacteristic: " + peerIDCharacteristic + ", writerCharacteristic: " + writerCharacteristic);
            }
        } catch (Exception e) {
            Log.e(TAG, "checkLibp2pCharacteristicsCompliance() failed: " + e.getMessage() + " for device: " + dDevice);
        }

        return false;
    }


    // Send own MultiAddress and PeerID to remote device
    private boolean sendInfosToRemoteDevice() {
        Log.d(TAG, "sendInfosToRemoteDevice() called for device: " + dDevice);

        if (writeOnCharacteristic(BleManager.getMultiAddr().getBytes(), maCharacteristic)) {
            if (writeOnCharacteristic(BleManager.getPeerID().getBytes(), peerIDCharacteristic)) {
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
                int length = payload.length;
                int offset = 0;

                do {
                    // BLE protocol reserves 3 bytes out of MTU_SIZE for metadata
                    // https://www.oreilly.com/library/view/getting-started-with/9781491900550/ch04.html#gatt_writes
                    int chunkSize = (length - offset > dMtu - 3) ? dMtu - 3 : length - offset;
                    byte[] chunk = Arrays.copyOfRange(payload, offset, offset + chunkSize);
                    offset += chunkSize;
                    toSend.add(chunk);
                } while (offset < length);

                while (!toSend.isEmpty()) {
                    characteristic.setValue(toSend.get(0));
                    for (int attempt = 0; dGatt != null && !dGatt.writeCharacteristic(characteristic); attempt++) {
                        if (attempt == initWriteMaxAttempts) {
                            Log.e(TAG, "writeOnCharacteristic() wait for write init timeouted for device:" + dDevice);
                            return false;
                        }

                        Log.v(TAG, "writeOnCharacteristic() wait for write init: " + (attempt + 1) + "/" + initWriteMaxAttempts + ", device:" + dDevice);
                        Thread.sleep(initWriteAttemptTimeout);
                    }

                    if (dGatt == null) {
                        Log.e(TAG, "writeOnCharacteristic() device disconnected during write operation:" + dDevice);
                        return false;
                    }

                    if (!waitWriteDone.tryAcquire(writeDoneTimeout, TimeUnit.MILLISECONDS)) {
                        Log.e(TAG, "writeOnCharacteristic() timeouted for device:" + dDevice);
                        return false;
                    }

                    toSend.remove(0);
                }
                Log.d(TAG, "writeOnCharacteristic() succeeded for device:" + dDevice + " with payload: " + new String(payload));
                return true;
            }
        } catch (Exception e) {
            Log.e(TAG, "writeOnCharacteristic() failed: " + e.getMessage() + " for device: " + dDevice);
            return false;
        }
    }
}
