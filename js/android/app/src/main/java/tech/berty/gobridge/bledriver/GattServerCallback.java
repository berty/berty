package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.CountDownLatch;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

public class GattServerCallback extends BluetoothGattServerCallback {
    private static final String TAG = "bty.ble.GattSrvCallback";
    private final Logger mLogger;
    private final BleDriver mBleDriver;

    // Size in bytes of the ATT MTU headers
    // see Bluetooth Core Specification 5.1: 4.8 Characteristic Value Read (p.2380)
    private static final int ATT_HEADER_READ_SIZE = 1;

    private final Context mContext;
    private final GattServer mGattServer;
    private final CountDownLatch mDoneSignal;
    private String mLocalPID;

    public GattServerCallback(Context context, BleDriver bleDriver, Logger logger, GattServer gattServer, CountDownLatch doneSignal) {
        mContext = context;
        mBleDriver = bleDriver;
        mLogger = logger;
        mGattServer = gattServer;
        mDoneSignal = doneSignal;
    }

    private String getLocalPID() {
        return mLocalPID;
    }

    // setLocalPID is called by GattServer for initialization
    public void setLocalPID(String peerID) {
        mLocalPID = peerID;
    }

    // When this callback is called, we assume that the GATT server is ready up.
    // We can enable scanner and advertiser.
    @Override
    public void onServiceAdded(int status, BluetoothGattService service) {
        mLogger.d(TAG, "onServiceAdded() called");
        super.onServiceAdded(status, service);
        if (status != BluetoothGatt.GATT_SUCCESS) {
            mLogger.e(TAG, "onServiceAdded error: failed to add service " + service);
        } else {
            mGattServer.setStarted(true);
        }
        mDoneSignal.countDown();
    }

    @Override
    public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
        super.onConnectionStateChange(device, status, newState);

        mLogger.v(TAG, String.format("onConnectionStateChange: device=%s status=%d newState=%d", mLogger.sensitiveObject(device), status, newState));
        PeerDevice peerDevice = mBleDriver.deviceManager().get(device.getAddress());

        if (status == GATT_SUCCESS) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                mLogger.i(TAG, String.format("onConnectionStateChange: device=%s connected", mLogger.sensitiveObject(device.getAddress())));

                if (peerDevice == null) {
                    mLogger.d(TAG, String.format("onConnectionStateChange(): new device=%s", mLogger.sensitiveObject(device.getAddress())));
                    peerDevice = new PeerDevice(mContext, mBleDriver, mLogger, device, getLocalPID(), false);
                    mBleDriver.deviceManager().put(peerDevice.getMACAddress(), peerDevice);
                }

                peerDevice.setGattServer(mGattServer);

                synchronized (peerDevice.mLockServer) {
                    if (!peerDevice.checkAndSetServerState(PeerDevice.CONNECTION_STATE.DISCONNECTED, PeerDevice.CONNECTION_STATE.CONNECTED)) {
                        mLogger.d(TAG, String.format("onConnectionStateChange: a server connection already exists: device=%s", mLogger.sensitiveObject(device.getAddress())));
                    }
                }
            } else {
                mLogger.i(TAG, String.format("onConnectionStateChange: disconnected: device=%s", mLogger.sensitiveObject(device.getAddress())));
                if (peerDevice != null) {
                    synchronized (peerDevice.mLockServer) {
                        peerDevice.setServerState(PeerDevice.CONNECTION_STATE.DISCONNECTED);
                    }
                    peerDevice.closeServer();
                }
            }
        } else {
            mLogger.e(TAG, String.format("onConnectionStateChange error=%d", status));
        }
    }

    @Override
    public void onDescriptorReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattDescriptor descriptor) {
        super.onDescriptorReadRequest(device, requestId, offset, descriptor);

        mLogger.d(TAG, String.format("onDescriptorReadRequest: device=%s", mLogger.sensitiveObject(device.getAddress())));

        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null);
    }

    @Override
    public void onDescriptorWriteRequest(BluetoothDevice device, int requestId, BluetoothGattDescriptor descriptor, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
        super.onDescriptorWriteRequest(device, requestId, descriptor, preparedWrite, responseNeeded, offset, value);

        mLogger.d(TAG, String.format("onDescriptorWriteRequest: device=%s", mLogger.sensitiveObject(device.getAddress())));

        if (!BleDriver.mCallbacksHandler.post(() -> {
            boolean status = false;
            PeerDevice peerDevice;

            if ((peerDevice = mBleDriver.deviceManager().get(device.getAddress())) == null) {
                mLogger.e(TAG, String.format("onDescriptorWriteRequest: device=%s not found", mLogger.sensitiveObject(device.getAddress())));
            } else if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                mLogger.w(TAG, String.format("onDescriptorWriteRequest: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
            } else {
                status = true;
            }

            // onDescriptorWriteRequest is called after the L2CAP handshake.
            // Server doesn't know if the L2CAP handshake failed on the client side
            // so we have to set it manually at this step.
            if (peerDevice != null) {
                peerDevice.setL2capServerHandshakeStarted(false);
            }

            if (status) {
                Peer peer = mBleDriver.peerManager().registerDevice(peerDevice.getRemotePID(), peerDevice, false);
                peerDevice.setPeer(peer);
                if (peer == null) {
                    mLogger.e(TAG, String.format("onDescriptorWriteRequest error: device=%s: registerDevice failed", mLogger.sensitiveObject(peerDevice.getMACAddress())));
                    status = false;
                }
            }

            if (responseNeeded) {
                if (status) {
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null);
                } else {
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_WRITE_NOT_PERMITTED, offset, null);
                }
            }
        })) {
            mLogger.e(TAG, String.format("onDescriptorWriteRequest error: failed to enqueue: device=%s ", mLogger.sensitiveObject(device.getAddress())));
        }
    }

    // onCharacteristicReadRequest is called when client wants the server device peer id
    @Override
    public void onCharacteristicReadRequest(BluetoothDevice device,
                                            int requestId,
                                            int offset,
                                            BluetoothGattCharacteristic characteristic) {
        super.onCharacteristicReadRequest(device, requestId, offset, characteristic);
        mLogger.v(TAG, String.format("onCharacteristicReadRequest called: device=%s requestId=%d offset=%d", mLogger.sensitiveObject(device.getAddress()), requestId, offset));

        if (!BleDriver.mCallbacksHandler.post(() -> {
            PeerDevice peerDevice;

            if ((peerDevice = mBleDriver.deviceManager().get(device.getAddress())) == null) {
                mLogger.e(TAG, String.format("onCharacteristicReadRequest(): device=%s not found", mLogger.sensitiveObject(device.getAddress())));
                mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                    offset, null);
                return;
            }

            if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                mLogger.e(TAG, String.format("onCharacteristicReadRequest() error: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
                mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                    offset, null);
                return;
            }

            if (peerDevice.getPeer() != null) {
                mLogger.e(TAG, String.format("onCharacteristicReadRequest() error: device=%s handshake already completed", mLogger.sensitiveObject(device.getAddress())));
                mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                        offset, null);
                return;
            }

            synchronized (peerDevice.mLockServer) {
                if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                    mLogger.e(TAG, String.format("onCharacteristicReadRequest: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                        offset, null);
                    return;
                }

                if (peerDevice.getRemotePID() == null) {
                    mLogger.e(TAG, String.format("onCharacteristicReadRequest error: device=%s: remotePID not received", mLogger.sensitiveObject(peerDevice.getMACAddress())));
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                            offset, null);
                    return;
                }

                if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                    // send PSM l2cap + local PID
                    byte[] payload;
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    DataOutputStream dos = new DataOutputStream(bos);
                    try {
                        mLogger.v(TAG, String.format("onCharacteristicReadRequest: PSM=%d pid=%s", mGattServer.getL2capPSM(), mLogger.sensitiveObject(getLocalPID())));
                        dos.writeInt(mGattServer.getL2capPSM());
                        dos.write(getLocalPID().getBytes());
                        dos.flush();
                        payload = bos.toByteArray();
                    } catch (IOException e) {
                        mLogger.e(TAG, String.format("onCharacteristicReadRequest error: ByteArrayOutputStream failed for device=%s", mLogger.sensitiveObject(device.getAddress())));
                        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                            offset, null);
                        return;
                    } finally {
                        try {
                            bos.close();
                        } catch (IOException e) {
                            // ignore
                        }
                    }

                    if ((payload.length - offset) <= (peerDevice.getMtu() - ATT_HEADER_READ_SIZE)) {
                        mLogger.d(TAG, String.format("onCharacteristicReadRequest: MTU is big enough: MTU=%d dataLength=%d", peerDevice.getMtu(), payload.length - offset));
                    } else {
                        mLogger.d(TAG, String.format("onCharacteristicReadRequest: MTU is too small: MTU=%d dataLength=%d", peerDevice.getMtu(), payload.length - offset));
                    }

                    final byte[] toWrite = Arrays.copyOfRange(payload, offset, payload.length);

                    if (mLogger.showSensitiveData()) {
                        mLogger.v(TAG, String.format("onCharacteristicReadRequest: writing data: device=%s base64=%s value=%s length=%d offset=%d", peerDevice.getMACAddress(), Base64.encodeToString(toWrite, Base64.DEFAULT), BleDriver.bytesToHex(toWrite), toWrite.length, offset));
                    }
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, toWrite);
                } else {
                    mLogger.e(TAG, String.format("onCharacteristicReadRequest error: try to read to a wrong characteristic with device=%s ", mLogger.sensitiveObject(device.getAddress())));
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                        offset, null);
                }
            }
        })) {
            mLogger.e(TAG, String.format("onCharacteristicReadRequest error: failed to enqueue: device=%s ", mLogger.sensitiveObject(device.getAddress())));
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
        mLogger.v(TAG, String.format("onCharacteristicWriteRequest called: device=%s characteristic=%s requestId=%d preparedWrite=%b needResponse=%b", mLogger.sensitiveObject(device.getAddress()), characteristic.getUuid(), requestId, prepareWrite, responseNeeded));

        PeerDevice peerDevice;
        boolean status = false;

        if ((peerDevice = mBleDriver.deviceManager().get(device.getAddress())) == null) {
            mLogger.e(TAG, String.format("onCharacteristicWriteRequest: device %s not found", mLogger.sensitiveObject(device.getAddress())));
        } else if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
            mLogger.w(TAG, String.format("onCharacteristicWriteRequest: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
        } else {
            if (mLogger.showSensitiveData()) {
                mLogger.d(TAG, String.format("onCharacteristicWriteRequest: device=%s base64=%s value=%s length=%d offset=%d", device.getAddress(), Base64.encodeToString(value, Base64.DEFAULT), BleDriver.bytesToHex(value), value.length, offset));
            }

            if (prepareWrite) {
                mLogger.d(TAG, "onCharacteristicWriteRequest: chunk data length is bigger than MTU");
                peerDevice.putInDataBuffer(value);
                status = true;
            } else {
                if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                    status = peerDevice.handleDataReceived(value);
                } else if (characteristic.getUuid().equals(GattServer.PID_UUID)) {
                    status = peerDevice.handleServerPIDReceived(value);
                } else {
                    mLogger.e(TAG, String.format("onCharacteristicWriteRequest: try to write to a wrong characteristic: device=%s", mLogger.sensitiveObject(device.getAddress())));
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

    // This callback is called when this GATT server has received all incoming data packets of one
    // transmission.
    // If packets fit with MTU size, onExecuteWrite is not called.
    @Override
    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
        super.onExecuteWrite(device, requestId, execute);
        mLogger.v(TAG, String.format("onExecuteWrite called: device=%s requestId=%d execute=%s", mLogger.sensitiveObject(device.getAddress()), requestId, execute));

        boolean status = false;

        if (execute) {
            PeerDevice peerDevice;
            if ((peerDevice = mBleDriver.deviceManager().get(device.getAddress())) == null) {
                mLogger.e(TAG, String.format("onExecuteWrite() error: device=%s not found", mLogger.sensitiveObject(device.getAddress())));
            } else {
                if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
                    mLogger.e(TAG, String.format("onCharacteristicWriteRequest: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
                } else {
                    if (peerDevice.getInDataBuffer() == null) {
                        mLogger.e(TAG, String.format("onExecuteWrite() error: device=%s: buffer is null", mLogger.sensitiveObject(device.getAddress())));
                    } else {
                        if (mLogger.showSensitiveData()) {
                            mLogger.d(TAG, String.format("onExecuteWrite: device=%s base64=%s value=%s length=%d", device.getAddress(), Base64.encodeToString(peerDevice.getInDataBuffer(), Base64.DEFAULT), BleDriver.bytesToHex(peerDevice.getInDataBuffer()), peerDevice.getInDataBuffer().length));
                        }
                        status = peerDevice.handleDataReceived(peerDevice.flushInDataBuffer());
                    }
                }
            }
        }

        if (status) {
            mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS,
                    0, null);
        } else {
            mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                    0, null);
        }
    }

    @Override
    public void onMtuChanged(BluetoothDevice device, int mtu) {
        super.onMtuChanged(device, mtu);
        mLogger.v(TAG, String.format("onMtuChanged called for device %s and mtu=%d", mLogger.sensitiveObject(device.getAddress()), mtu));
        PeerDevice peerDevice;

        if ((peerDevice = mBleDriver.deviceManager().get(device.getAddress())) == null) {
            mLogger.e(TAG, String.format("onMtuChanged() error: device=%s not found", mLogger.sensitiveObject(device.getAddress())));
            return;
        }

        if (peerDevice.getServerState() != PeerDevice.CONNECTION_STATE.CONNECTED) {
            mLogger.e(TAG, String.format("onMtuChanged() error: device=%s not connected", mLogger.sensitiveObject(device.getAddress())));
            return;
        }

        peerDevice.setMtu(mtu);
    }

    @Override
    public void onNotificationSent(BluetoothDevice device, int status) {
        super.onNotificationSent(device, status);
        mLogger.v(TAG, String.format("onNotificationSent called: device=%s", mLogger.sensitiveObject(device.getAddress())));

        if (status != GATT_SUCCESS) {
            mLogger.e(TAG, String.format("onNotificationSent status error=%d device=%s", status, mLogger.sensitiveObject(device)));
        }

        PeerDevice peerDevice = mBleDriver.deviceManager().get(device.getAddress());
        if (peerDevice == null) {
            mLogger.e(TAG, String.format("onNotificationSent error: device=%s is unknown", mLogger.sensitiveObject(device.getAddress())));
            return;
        }

        peerDevice.getBleQueue().completedCommand(status);
    }
}
