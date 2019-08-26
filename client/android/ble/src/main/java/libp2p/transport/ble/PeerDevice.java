package libp2p.transport.ble;

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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
final class PeerDevice {
    private static final String TAG = "device";

    // Timeout and maximum attempts for GATT connection
    private static final int gattConnectMaxAttempts = 10;
    private static final int gattWaitConnectAttemptTimeout = 420;
    private static final int gattWaitConnectMaxAttempts = 20;
    private static final int gattConnectingAttemptTimeout = 240;
    private static final int gattConnectingMaxAttempts = 5;
    private static final int waitAfterHandshakeAndGattConnectAttempt = 2000;
    private static final int waitAfterDeviceDisconnect = 10000;
    private static final int waitAfterGattDisconnect = 500;
    private static final int waitAfterGattSetup = 500;

    // Timeout and maximum attempts for service/characteristics discovery and check
    private static final int servDiscoveryAttemptTimeout = 1000;
    private static final int servDiscoveryMaxAttempts = 20;
    private static final int servCheckTimeout = 30000;
    private static final int charDiscoveryTimeout = 1000;

    // Timeout for waiting that remote device has read local PeerID
    private static final int waitInfosResponseTimeout = 60000;

    // Timeout and maximum attempts for read/write operations
    private static final int initReadWriteAttemptTimeout = 40;
    private static final int initReadWriteMaxAttempts = 1000;
    private static final int readWriteDoneTimeout = 60000;

    // GATT connection attributes
    private BluetoothGatt dGatt;
    private final BluetoothDevice dDevice;
    private final String dAddr;
    private int dMtu;

    private static final int DEFAULT_MTU = 23; // See https://chromium.googlesource.com/aosp/platform/system/bt/+/29e794418452c8b35c2d42fe0cda81acd86bbf43/stack/include/gatt_api.h#133
    private static final int MAXIMUM_MTU = 517; // See https://chromium.googlesource.com/aosp/platform/system/bt/+/29e794418452c8b35c2d42fe0cda81acd86bbf43/stack/include/gatt_api.h#123

    private BluetoothGattService libp2pService;
    private BluetoothGattCharacteristic peerIDCharacteristic;
    private BluetoothGattCharacteristic writerCharacteristic;


    // Libp2p identification attributes
    private String peerID;
    private boolean identified;

    // Semaphores / latch / buffer used for async connection / write operation / infos receptions
    final Semaphore waitPeerIDResponded = new Semaphore(0); // Lock for PeerID sending to remote device
    final Semaphore waitServiceCheck = new Semaphore(0); // Lock for callback that check discovered services
    final Semaphore waitReadDone = new Semaphore(0); // Lock for waiting completion of read operation
    final Semaphore waitWriteDone = new Semaphore(0); // Lock for waiting completion of write operation

    boolean readFailed;
    boolean writeFailed;

    private final Semaphore lockConnAttempt = new Semaphore(1); // Lock to prevent more than one GATT connection attempt at once
    private final Semaphore lockHandshakeAttempt = new Semaphore(1); // Lock to prevent more than one handshake attempt at once

    private Thread connectionThread;
    private Thread handshakeThread;


    PeerDevice(BluetoothDevice device) {
        dAddr = device.getAddress();
        dDevice = device;
        dMtu = DEFAULT_MTU;
    }


    // Libp2p identification related
    String getAddr() { return dAddr; }

    String getPeerID() { return peerID; }

    int getMtu() { return dMtu; }

    void setLibp2pService(BluetoothGattService service) {
        Log.d(TAG, "setLibp2pService() called for device: " + dDevice + " with current service: " + libp2pService + ", new service: " + service);

        libp2pService = service;
    }

    boolean isIdentified() {
        Log.v(TAG, "isIdentified() called for device: " + dDevice + ", state: " + (identified ? "identified" : "unidentified"));

        return identified;
    }

    void interruptConnectionThread() {
        if (connectionThread != null) {
            Log.d(TAG, "interruptConnectionThread() called for device: " + dDevice + " for thread: " + connectionThread.getId());
            connectionThread.interrupt();
        } else {
            Log.d(TAG, "interruptConnectionThread() skipped: no running connection thread for device: " + dDevice);
        }
    }

    void interruptHandshakeThread() {
        if (handshakeThread != null) {
            Log.d(TAG, "interruptHandshakeThread() called for device: " + dDevice + " for thread: " + handshakeThread.getId());
            handshakeThread.interrupt();
        } else {
            Log.d(TAG, "interruptHandshakeThread() skipped: no running handshake thread for device: " + dDevice);
        }
    }

    // Attempt to (re)connect GATT then, if device isn't already identified, init Libp2p handshake
    void asyncConnectionToDevice(final String caller) {
        Log.d(TAG, "asyncConnectionToDevice() called for device: " + dDevice + ", caller: " + caller);

        if (lockConnAttempt.tryAcquire() && connectionThread == null) {
            connectionThread = new Thread(new Runnable() {
                @Override
                public void run() {
                    Thread.currentThread().setName("asyncConnectionToDevice() " + dDevice + ", caller: " + caller);

                    String callerAndThread = caller + ", thread: " + Thread.currentThread().getId();
                    Log.i(TAG, "asyncConnectionToDevice() try to connect GATT with device: " + dDevice + ", caller: " + callerAndThread);

                    try {
                        if (PeerDevice.this.connectGatt(callerAndThread)) {
                            Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);

                            if (identified) {
                                Log.i(TAG, "asyncConnectionToDevice() GATT reconnection succeeded for device: " + dDevice + ", caller: " + callerAndThread);
                            } else {
                                PeerDevice.this.asyncHandshakeWithDevice(caller);
                            }
                        } else {
                            if (identified) {
                                Log.e(TAG, "asyncConnectionToDevice() reconnection failed: connection lost with previously connected device: " + dDevice + ", PeerID: " + peerID + ", caller: " + callerAndThread);
                            } else {
                                Log.e(TAG, "asyncConnectionToDevice() failed: can't connect GATT with device: " + dDevice + ", caller: " + callerAndThread);
                            }

                            Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);
                            lockConnAttempt.release();
                            PeerDevice.this.disconnectFromDevice("GATT failed, caller: " + callerAndThread);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "asyncConnectionToDevice() failed: " + e.getMessage() + " for device: " + dDevice + ", caller: " + callerAndThread);
                    }

                    if (lockConnAttempt.availablePermits() == 0) {
                        lockConnAttempt.release();
                    }
                    connectionThread = null;
                }
            });
            connectionThread.start();
        } else {
            Log.w(TAG, "asyncConnectionToDevice() skipped GATT connection attempt: already running for device: " + dDevice + ", caller: " + caller);
        }
    }

    // Attempt to Libp2p handshake with remote device: read each other PeerID characteristics then create a new libp2p conn
    private void asyncHandshakeWithDevice(final String caller) {
        Log.d(TAG, "asyncHandshakeWithDevice() called for device: " + dDevice + ", caller: " + caller);

        if (lockHandshakeAttempt.tryAcquire() && handshakeThread == null) {
            handshakeThread = new Thread(new Runnable() {
                @Override
                public void run() {
                    Thread.currentThread().setName("asyncHandshakeWithDevice() " + dDevice + ", caller: " + caller);

                    String callerAndThread = caller + ", thread: " + Thread.currentThread().getId();
                    Log.i(TAG, "asyncHandshakeWithDevice() try to Libp2p handshake with device: " + dDevice + ", caller: " + callerAndThread);

                    try {
                        if (PeerDevice.this.libp2pHandshake(callerAndThread)) {
                            Log.i(TAG, "asyncHandshakeWithDevice() succeeded with device: " + dDevice + ", PeerID: " + peerID + ", caller: " + callerAndThread);
                            identified = true;

                            if (dMtu == DEFAULT_MTU) {
                                Log.i(TAG, "asyncHandshakeWithDevice() try to agree on a new MTU with device: " + dDevice + ", caller: " + callerAndThread);
                                dGatt.requestMtu(MAXIMUM_MTU);
                                dGatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
                                Thread.sleep(300); // Wait for new MTU before starting the libp2p connect
                            }

                            if (JavaToGo.handleFoundPeer(peerID)) {
                                Log.i(TAG, "asyncHandshakeWithDevice() peer handled successfully by golang with device: " + dDevice + ", caller: " + callerAndThread);
                            } else {
                                Log.e(TAG, "asyncHandshakeWithDevice() failed: golang can't handle new peer for device: " + dDevice + ", caller: " + callerAndThread);
                                PeerDevice.this.disconnectFromDevice("Libp2p handshake failed, caller: " + callerAndThread);
                            }
                        } else {
                            Log.d(TAG, "asyncHandshakeWithDevice() Libp2p handshake failed with device: " + dDevice + ", caller: " + callerAndThread);
                            PeerDevice.this.disconnectFromDevice("Libp2p handshake failed, caller: " + callerAndThread);
                        }

                        Thread.sleep(waitAfterHandshakeAndGattConnectAttempt);
                    } catch (Exception e) {
                        Log.e(TAG, "asyncHandshakeWithDevice() failed: " + e.getMessage() + " for device: " + dDevice + ", caller: " + callerAndThread);
                    }

                    lockHandshakeAttempt.release();
                    handshakeThread = null;
                }
            });
            handshakeThread.start();
        } else {
            Log.w(TAG, "asyncHandshakeWithDevice() skipped Libp2p handshake attempt: already running for device: " + dDevice + ", caller: " + caller);
        }
    }

    // Disconnect device and remove it from index
    void disconnectFromDevice(String cause) {
        Log.w(TAG, "disconnectFromDevice() called for device: " + dDevice + " caused by: " + cause);

        try {
            lockConnAttempt.acquire();
            disconnectGatt();
            Thread.sleep(waitAfterDeviceDisconnect);
            DeviceManager.removeDeviceFromIndex(this);
        } catch (Exception e) {
            Log.d(TAG, "disconnectFromDevice() failed: " + e.getMessage() + " for device: " + dDevice);
        }
        lockConnAttempt.release();
    }


    // GATT related
    private void setGatt() {
        Log.d(TAG, "setGatt() called for device: " + dDevice);

        if (dGatt == null) {
            dGatt = dDevice.connectGatt(GoToJava.getContext(), false, BleDriver.getGattCallback());
        }
    }

    private boolean connectGatt(String caller) throws InterruptedException {
        Log.i(TAG, "connectGatt() called for device: " + dDevice + ", caller: " + caller);

        for (int attempt = 0; attempt < gattConnectMaxAttempts; attempt++) {
            Log.d(TAG, "connectGatt() attempt: " + (attempt + 1) + "/" + gattConnectMaxAttempts + ", device: " + dDevice + ", client state: " + Log.connectionStateToString(getGattClientState()) + ", server state: "  + Log.connectionStateToString(getGattServerState()));

            if (Thread.interrupted()) throw new InterruptedException("connectGatt() thread interrupted");

            setGatt();
            Thread.sleep(waitAfterGattSetup);
            dGatt.connect();

            for (int gattWaitConnectAttempt = 0; gattWaitConnectAttempt < gattWaitConnectMaxAttempts; gattWaitConnectAttempt++) {
                Log.d(TAG, "connectGatt() wait " + gattWaitConnectAttemptTimeout + "ms (disconnected state) " + (gattWaitConnectAttempt + 1) + "/" + gattWaitConnectMaxAttempts + " for device: " + dDevice);
                Thread.sleep(gattWaitConnectAttemptTimeout);

                if (Thread.interrupted()) throw new InterruptedException("connectGatt() thread interrupted");

                if (getGattClientState() == STATE_CONNECTING || getGattServerState() == STATE_CONNECTING) {
                    for (int gattConnectingAttempt = 0; gattConnectingAttempt < gattConnectingMaxAttempts && !Thread.currentThread().isInterrupted(); gattConnectingAttempt++) {
                        Log.d(TAG, "connectGatt() wait " + gattConnectingAttemptTimeout + "ms (connecting state) " + (gattConnectingAttempt + 1) + "/" + gattConnectingMaxAttempts + " for device: " + dDevice);
                        Thread.sleep(gattConnectingAttemptTimeout);

                        if (Thread.interrupted()) throw new InterruptedException("connectGatt() thread interrupted");

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
        }

        Log.e(TAG, "connectGatt() failed for device: " + dDevice);

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

    private int getGattState(boolean client) {
        final BluetoothManager manager = (BluetoothManager) GoToJava.getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        if (manager == null) {
            Log.e(TAG, "Can't get Bluetooth Manager");
            return STATE_DISCONNECTED;
        }

        if (client) {
            return manager.getConnectionState(dDevice, GATT);
        }

        return manager.getConnectionState(dDevice, GATT_SERVER);
    }

    private int getGattClientState() {
        Log.v(TAG, "getGattClientState() called for device: " + dDevice);

        return getGattState(true);
    }

    private int getGattServerState() {
        Log.v(TAG, "getGattServerState() called for device: " + dDevice);

        return getGattState(false);
    }

    boolean isGattConnected() {
        Log.v(TAG, "isGattConnected() called for device: " + dDevice);

        return (getGattServerState() == STATE_CONNECTED && getGattClientState() == STATE_CONNECTED);
    }


    // Check if remote device is Libp2p compliant then, if yes, two-way exchange PeerID
    private boolean libp2pHandshake(String caller) throws Exception {
        Log.i(TAG, "libp2pHandshake() called for device: " + dDevice + ", caller: " + caller);

        if (checkPeerDeviceLibp2pCompliance() && readPeerIDFromRemoteDevice() && respondPeerIDToRemoteDevice()) {
            Log.i(TAG, "libp2pHandshake() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "libp2pHandshake() failed for device: " + dDevice);

        return false;
    }


    // Wait for discovery and check if service and characteristics are Libp2p device compliant
    private boolean checkPeerDeviceLibp2pCompliance() throws Exception {
        Log.d(TAG, "checkPeerDeviceLibp2pCompliance() called for device: " + dDevice);

        if (checkLibp2pServiceCompliance() && checkLibp2pCharacteristicsCompliance()) {
            Log.i(TAG, "checkPeerDeviceLibp2pCompliance() succeeded for device: " + dDevice);
            return true;
        }

        Log.e(TAG, "checkPeerDeviceLibp2pCompliance() failed for device: " + dDevice);

        return false;
    }

    private boolean checkLibp2pServiceCompliance() throws InterruptedException {
        Log.d(TAG, "checkLibp2pServiceCompliance() called for device: " + dDevice);

        // Wait for services discovery started
        for (int servDiscoveryAttempt = 0; servDiscoveryAttempt < servDiscoveryMaxAttempts && !dGatt.discoverServices(); servDiscoveryAttempt++) {

            if (Thread.interrupted()) throw new InterruptedException("checkLibp2pServiceCompliance() thread interrupted");

            if (isGattConnected()) {
                Log.d(TAG, "checkLibp2pServiceCompliance() device " + dDevice + " GATT is connected, waiting for service discovery: " + servDiscoveryAttempt + "/" + servDiscoveryMaxAttempts);
                Thread.sleep(servDiscoveryAttemptTimeout);
            } else {
                Log.e(TAG, "checkLibp2pServiceCompliance() failed: device " + dDevice + " GATT is disconnected");
                return false;
            }
        }

        // Wait for service discovery completed and check that Libp2p service is found
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

        return false;
    }

    private boolean checkLibp2pCharacteristicsCompliance() throws Exception {
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

        todo.add(new PopulateCharacteristic(BleDriver.PEER_ID_UUID));
        todo.add(new PopulateCharacteristic(BleDriver.WRITER_UUID));

        List<Future<BluetoothGattCharacteristic>> answers = es.invokeAll(todo);
        for (Future<BluetoothGattCharacteristic> future : answers) {
            BluetoothGattCharacteristic characteristic = future.get(charDiscoveryTimeout, TimeUnit.MILLISECONDS);

            if (Thread.interrupted()) throw new InterruptedException("checkLibp2pCharacteristicsCompliance() thread interrupted");

            if (characteristic != null && characteristic.getUuid().equals(BleDriver.PEER_ID_UUID)) {
                Log.d(TAG, "checkLibp2pCharacteristicsCompliance() PeerID characteristic retrieved: " + characteristic + " on device: " + dDevice);
                peerIDCharacteristic = characteristic;
            } else if (characteristic != null && characteristic.getUuid().equals(BleDriver.WRITER_UUID)) {
                Log.d(TAG, "checkLibp2pCharacteristicsCompliance() Writer characteristic retrieved: " + characteristic + " on device: " + dDevice);
                writerCharacteristic = characteristic;
            } else if (characteristic == null) {
                Log.e(TAG, "checkLibp2pCharacteristicsCompliance() timeouted on device: " + dDevice);
                break;
            } else {
                Log.e(TAG, "checkLibp2pCharacteristicsCompliance() unknown characteristic retrieved: " + characteristic + " on device: " + dDevice);
            }
        }

        if (peerIDCharacteristic != null && writerCharacteristic != null) {
            Log.i(TAG, "checkLibp2pCharacteristicsCompliance() succeeded for device: " + dDevice);
            return true;
        } else {
            Log.e(TAG, "checkLibp2pCharacteristicsCompliance() failed: can't retrieve Libp2p characteristics on device: " + dDevice + ", peerIDCharacteristic: " + peerIDCharacteristic + ", writerCharacteristic: " + writerCharacteristic);
        }

        return false;
    }


    // Wait until remote device has read local PeerID
    private boolean respondPeerIDToRemoteDevice() throws InterruptedException {
        Log.d(TAG, "respondPeerIDToRemoteDevice() called for device: " + dDevice);

        if (waitPeerIDResponded.tryAcquire(waitInfosResponseTimeout, TimeUnit.MILLISECONDS)) {
            Log.i(TAG, "respondPeerIDToRemoteDevice() succeeded for device: " + dDevice);
            return true;
        }
        Log.e(TAG, "respondPeerIDToRemoteDevice() timeouted for device: " + dDevice);

        return false;
    }

    // Read a value on remote device's PeerID characteristic
    private boolean readPeerIDFromRemoteDevice() throws InterruptedException {
        Log.d(TAG, "readPeerIDFromRemoteDevice() called for device: " + dDevice);

        for (int attempt = 0; dGatt != null && !dGatt.readCharacteristic(peerIDCharacteristic); attempt++) {
            if (Thread.interrupted()) throw new InterruptedException("readPeerIDFromRemoteDevice() thread interrupted");

            if (attempt == initReadWriteAttemptTimeout) {
                Log.e(TAG, "readPeerIDFromRemoteDevice() wait for read init timeouted for device: " + dDevice);
                return false;
            }

            Log.v(TAG, "readPeerIDFromRemoteDevice() wait for read init: " + (attempt + 1) + "/" + initReadWriteMaxAttempts + ", device: " + dDevice);
            Thread.sleep(initReadWriteAttemptTimeout);
        }

        if (dGatt == null) {
            Log.e(TAG, "readPeerIDFromRemoteDevice() device disconnected during write operation: " + dDevice);
            return false;
        }

        if (!waitReadDone.tryAcquire(readWriteDoneTimeout, TimeUnit.MILLISECONDS)) {
            Log.e(TAG, "readPeerIDFromRemoteDevice() timeouted for device: " + dDevice);
            return false;
        }

        if (readFailed) {
            Log.e(TAG, "readPeerIDFromRemoteDevice() GATT read failed for device: " + dDevice);
            return false;
        }

        peerID = peerIDCharacteristic.getStringValue(0);
        if (peerID == null || peerID.length() == 0) {
            Log.e(TAG, "readPeerIDFromRemoteDevice() GATT read " + (peerID == null ? "a null" : "an empty") + " value for device: " + dDevice);
            return false;
        }

        Log.d(TAG, "readPeerIDFromRemoteDevice() succeeded for device: " + dDevice +" and value: " + peerID);
        return true;
    }

    // Write a blob on remote device's writer characteristic
    boolean writeToRemoteWriterCharacteristic(byte[] payload) throws InterruptedException {
        Log.d(TAG, "writeOnRemoteWriterCharacteristic() called for device: " + dDevice);

        List<byte[]> toSend = new ArrayList<>();
        int length = payload.length;
        int offset = 0;
        int writeAttempt = 0;

        do {
            // BLE protocol reserves 3 bytes out of MTU_SIZE for metadata
            // https://www.oreilly.com/library/view/getting-started-with/9781491900550/ch04.html#gatt_writes
            int chunkSize = (length - offset > dMtu - 3) ? dMtu - 3 : length - offset;
            byte[] chunk = Arrays.copyOfRange(payload, offset, offset + chunkSize);
            offset += chunkSize;
            toSend.add(chunk);
        } while (offset < length);

        while (!toSend.isEmpty()) {
            writerCharacteristic.setValue(toSend.get(0));
            toSend.remove(0);

            while (writeAttempt++ < 3) {
                Log.d(TAG, "writeToRemoteWriterCharacteristic() write attempt: " + writeAttempt + " with chunk: " +  writerCharacteristic.getStringValue(0) + " for device: " + dDevice);

                for (int attempt = 0; dGatt != null && !dGatt.writeCharacteristic(writerCharacteristic); attempt++) {
                    if (Thread.interrupted()) throw new InterruptedException("writeToRemoteWriterCharacteristic() thread interrupted");

                    if (attempt == initReadWriteMaxAttempts) {
                        Log.e(TAG, "writeToRemoteWriterCharacteristic() wait for write init timeouted for device: " + dDevice);
                        continue;
                    }

                    Log.v(TAG, "writeToRemoteWriterCharacteristic() wait for write init: " + (attempt + 1) + "/" + initReadWriteMaxAttempts + ", device: " + dDevice);
                    Thread.sleep(initReadWriteAttemptTimeout);
                }

                if (dGatt == null) {
                    Log.e(TAG, "writeToRemoteWriterCharacteristic() device disconnected during write operation: " + dDevice);
                    continue;
                }

                if (!waitWriteDone.tryAcquire(readWriteDoneTimeout, TimeUnit.MILLISECONDS)) {
                    Log.e(TAG, "writeToRemoteWriterCharacteristic() timeouted for device: " + dDevice);
                    continue;
                }

                if (writeFailed) {
                    Log.e(TAG, "writeToRemoteWriterCharacteristic() GATT write failed for device: " + dDevice);
                }
            }

            if (writeAttempt > 3) {
                return false;
            }
        }

        Log.d(TAG, "writeToRemoteWriterCharacteristic() succeeded for device: " + dDevice + " with payload: " + new String(payload));
        return true;
    }
}
