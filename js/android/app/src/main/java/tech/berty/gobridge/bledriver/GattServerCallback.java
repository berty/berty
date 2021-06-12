package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.util.Log;
import android.util.Base64;

import java.util.Arrays;
import java.util.concurrent.CountDownLatch;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

public class GattServerCallback extends BluetoothGattServerCallback {
    private static final String TAG = "bty.ble.GattSrvCallback";

    // Size in bytes of the ATT MTU headers
    // see Bluetooth Core Specification 5.1: 4.8 Characteristic Value Read (p.2380)
    private static final int ATT_HEADER_READ_SIZE = 1;

    private final Context mContext;
    private final GattServer mGattServer;
    private final CountDownLatch mDoneSignal;
    private String mLocalPID;

    public GattServerCallback(Context context, GattServer gattServer, CountDownLatch doneSignal) {
        mContext = context;
        mGattServer = gattServer;
        mDoneSignal = doneSignal;
    }

    // setLocalPID is called by GattServer for initialization
    public void setLocalPID(String peerID) {
        mLocalPID = peerID;
    }

    private String getLocalPID() { return mLocalPID; }

    // When this callback is called, we assume that the GATT server is ready up.
    // We can enable scanner and advertiser.
    @Override
    public void onServiceAdded(int status, BluetoothGattService service) {
        Log.i(TAG, "onServiceAdded() called");
        super.onServiceAdded(status, service);
        if (status != BluetoothGatt.GATT_SUCCESS) {
            Log.e(TAG, "onServiceAdded error: failed to add service " + service);
        } else {
            mGattServer.setStarted(true);
        }
        mDoneSignal.countDown();
    }

    @Override
    public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
        super.onConnectionStateChange(device, status, newState);

        Log.v(TAG, String.format("onConnectionStateChange: device=%s status=%d newState=%d", device, status, newState));
        PeerDevice peerDevice = DeviceManager.get(device.getAddress());

        if (status == GATT_SUCCESS) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Log.i(TAG, String.format("onConnectionStateChange: device=%s connected", device.getAddress()));

                if (peerDevice == null) {
                    Log.d(TAG, String.format("onConnectionStateChange(): new device=%s", device.getAddress()));
                    peerDevice = new PeerDevice(mContext, device, getLocalPID());
                    DeviceManager.addDevice(peerDevice);
                }

                synchronized (peerDevice.mLockServer) {
                    if (!peerDevice.checkAndSetServerState(PeerDevice.CONNECTION_STATE.DISCONNECTED, PeerDevice.CONNECTION_STATE.CONNECTED)) {
                        Log.d(TAG, String.format("onConnectionStateChange: a server connection already exists: device=%s", device.getAddress()));
                    }/* else {
                        peerDevice.connectToDevice(true);
                    }*/
                }
            } else {
                Log.i(TAG, String.format("onConnectionStateChange: disconnected: device=%s", device.getAddress()));
                if (peerDevice != null) {
                    synchronized (peerDevice.mLockServer) {
                        PeerDevice.CONNECTION_STATE prevState = peerDevice.getServerState();
                        peerDevice.setServerState(PeerDevice.CONNECTION_STATE.DISCONNECTED);

                        if (prevState == PeerDevice.CONNECTION_STATE.CONNECTED) {
                            peerDevice.closeServer();
                        }
                    }
                }
            }
        } else {
            Log.e(TAG, String.format("onConnectionStateChange error=%d", status));
        }
    }

    // onCharacteristicReadRequest is called when client wants the server device peer id
    @Override
    public void onCharacteristicReadRequest(BluetoothDevice device,
                                            int requestId,
                                            int offset,
                                            BluetoothGattCharacteristic characteristic) {
        super.onCharacteristicReadRequest(device, requestId, offset, characteristic);
        Log.v(TAG, String.format("onCharacteristicReadRequest called: device=%s requestId=%d offset=%d", device.getAddress(), requestId, offset));

        if (!BleDriver.mainHandler.post(new Runnable() {
            @Override
            public void run() {
                boolean full = false;
                PeerDevice peerDevice;

                if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
                    Log.e(TAG, String.format("onCharacteristicReadRequest(): device=%s not found", device.getAddress()));
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                        offset, null);
                    return ;
                }

                synchronized (peerDevice.mLockServer) {
                    if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                        Log.e(TAG, String.format("onCharacteristicReadRequest: device=%s not connected", device.getAddress()));
                        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                            offset, null);
                        return;
                    }

                    if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                        final byte[] payload = getLocalPID().getBytes();

                        if ((payload.length - offset) <= (peerDevice.getMtu() - ATT_HEADER_READ_SIZE)) {
                            Log.d(TAG, String.format("onCharacteristicReadRequest: MTU is big enough: MTU=%d dataLength=%d", peerDevice.getMtu(), payload.length - offset));
                            full = true;
                        } else {
                            Log.d(TAG, String.format("onCharacteristicReadRequest: MTU is too small: MTU=%d dataLength=%d", peerDevice.getMtu(), payload.length - offset));
                        }

                        final byte[] toWrite = Arrays.copyOfRange(payload, offset, payload.length);

                        Log.v(TAG, String.format("onCharacteristicReadRequest: writing data: device=%s base64=%s value=%s length=%d offset=%d", peerDevice.getMACAddress(), Base64.encodeToString(toWrite, Base64.DEFAULT), BleDriver.bytesToHex(toWrite), toWrite.length, offset));
                        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, toWrite);

                        if (full) {
                            peerDevice.handleServerDataSent();
                        }
                    } else {
                        Log.e(TAG, String.format("onCharacteristicReadRequest error: try to read to a wrong characteristic with device=%s ", device.getAddress()));
                        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                            offset, null);
                    }
                }
            }
        })) {
            Log.e(TAG, String.format("onCharacteristicReadRequest error: failed to enqueue: device=%s ", device.getAddress()));
        }
    }

    // When receiving data, there are two cases:
    // * MTU is big enough, thus the whole message is transmitted, prepareWrite is false.
    // * Otherwise, we need to wait that all packets are transmitted, prepareWrite is true for
    //   all this transmissions. When all packets are received, onExecuteWrite is called.
    // Due to a bug, if your data is too big, the BLE stack will lost the end of your data, so we
    // have to cut data ourself to fit with MTU.
    @Override
    public void onCharacteristicWriteRequest(BluetoothDevice device,
                                             int requestId,
                                             BluetoothGattCharacteristic characteristic,
                                             boolean prepareWrite,
                                             boolean responseNeeded,
                                             int offset,
                                             byte[] value) {
        super.onCharacteristicWriteRequest(device, requestId, characteristic, prepareWrite,
                responseNeeded, offset, value);
        Log.v(TAG, String.format("onCharacteristicWriteRequest called: device=%s characteristic=%s requestId=%d preparedWrite=%b needResponse=%b", device.getAddress(), characteristic.getUuid(), requestId, prepareWrite, responseNeeded));

        if (!BleDriver.mainHandler.post(new Runnable() {
            @Override
            public void run() {
                PeerDevice peerDevice;
                boolean status = false;

                if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
                    Log.e(TAG, String.format("onCharacteristicWriteRequest: device %s not found", device.getAddress()));
                } else {
                    synchronized (peerDevice.mLockServer) {
                        if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                            Log.e(TAG, String.format("onCharacteristicWriteRequest: device %s not connected", device.getAddress()));
                        } else if (prepareWrite) {
                            Log.e(TAG, "onCharacteristicWriteRequest: chunk data length is bigger than MTU");
                        } else {
                            Log.d(TAG, String.format("onCharacteristicWriteRequest: device=%s base64=%s value=%s length=%d offset=%d", device.getAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length, offset));
                            if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                                status = peerDevice.handleServerDataReceived(value);
                            } else if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                                status = peerDevice.handleServerPIDReceived(value);
                            } else {
                                Log.e(TAG, String.format("onCharacteristicWriteRequest: try to write to a wrong characteristic: device=%s", device.getAddress()));
                            }
                        }
                    }
                }
                if (responseNeeded && status) {
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS,
                        offset, value);
                } else if (responseNeeded) {
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                        0, null);
                }
            }
        })) {
            Log.e(TAG, String.format("onCharacteristicWriteRequest error: failed to enqueue: device=%s ", device.getAddress()));
        }
    }

    // This callback is called when this GATT server has received all incoming data packets of one
    // transmission.
    // If packets fit with MTU size, onExecuteWrite is not called.
    @Override
    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
        super.onExecuteWrite(device, requestId, execute);
        Log.e(TAG, String.format("onExecuteWrite must not be called since data packets were cut for MTU: device=%s", device.getAddress()));
    }

    @Override
    public void onMtuChanged(BluetoothDevice device, int mtu) {
        super.onMtuChanged(device, mtu);
        Log.v(TAG, String.format("onMtuChanged called for device %s and mtu=%d", device.getAddress(), mtu));
        PeerDevice peerDevice;

        if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
            Log.e(TAG, "onMtuChanged() error: device not found");
            return ;
        }
        peerDevice.setMtu(mtu);
    }

    /*@Override
    public void onNotificationSent(BluetoothDevice device, int status) {
        super.onNotificationSent(device, status);
        Log.v(TAG, String.format("onNotificationSent called: device=%s", device.getAddress()));

        if (status != GATT_SUCCESS) {
            Log.e(TAG, String.format("onNotificationSent status error=%d device=%s", status, device));
        }
        BleQueue.completedCommand();
    }*/
}
