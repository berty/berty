package tech.berty.gobridge.bledriver;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.util.Log;

import java.util.Arrays;

public class GattServerCallback extends BluetoothGattServerCallback {
    private static final String TAG = "GattServerCallback";

    // Size in bytes of the ATT MTU headers
    // see Bluetooth Core Specification 5.1: 4.8 Characteristic Value Read (p.2380)
    private static final int ATT_HEADER_READ_SIZE = 1;

    private Context mContext;
    private GattServer mGattServer;

    private byte[] mBuffer;

    public GattServerCallback(Context context, GattServer gattServer) {
        mContext = context;
        mGattServer = gattServer;
    }

    private void addToBuffer(byte[] value) {
        if (mBuffer == null) {
            mBuffer = new byte[0];
        }
        byte[] tmp = new byte[mBuffer.length + value.length];
        System.arraycopy(mBuffer, 0, tmp, 0, mBuffer.length);
        System.arraycopy(value, 0, tmp, mBuffer.length, value.length);
        mBuffer = tmp;
    }

    // When this callback is called, we assume that the GATT server is ready up.
    // We can enable scanner and advertiser.
    @Override
    public void onServiceAdded(int status, BluetoothGattService service) {
        Log.d(TAG, "onServiceAdded() called in thread " + Thread.currentThread().getName());
        super.onServiceAdded(status, service);
        if (status != BluetoothGatt.GATT_SUCCESS) {
            Log.e(TAG, "onServiceAdded error: failed to add service " + service);
            mGattServer.stop();
        }
        // Set the status server state to true (enabled)
        mGattServer.setState(GattServer.State.STARTED);
        BleDriver.setAdvertising(true);
        BleDriver.setScanning(true);
    }

    @Override
    public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
        Log.v(TAG, "onConnectionStateChange() called with device: " + device + " with newState: " + newState);

        if (newState == BluetoothProfile.STATE_CONNECTED) {
            Log.v(TAG, "connected");
            PeerDevice peerDevice = DeviceManager.get(device.getAddress());

            if (peerDevice == null) {
                Log.i(TAG, "onConnectionStateChange(): a new device is connected: " + device.getAddress());
                peerDevice = new PeerDevice(mContext, device);
                DeviceManager.addDevice(peerDevice);
            }
            if (peerDevice.isDisconnected()) {
                peerDevice.setState(PeerDevice.CONNECTION_STATE.CONNECTING);
                // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
                peerDevice.asyncConnectionToDevice();
            }
        }
    }

    @Override
    public void onCharacteristicReadRequest(BluetoothDevice device,
                                            int requestId,
                                            int offset,
                                            BluetoothGattCharacteristic characteristic) {
        Log.d(TAG, "onCharacteristicReadRequest() called");
        boolean full = false;
        PeerDevice peerDevice;
        byte[] value;

        if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
            Log.e(TAG, "onCharacteristicReadRequest() error: device not found");
            mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                    0, null);
            return ;
        }
        if (characteristic.getUuid().equals(GattServer.PEER_ID_UUID)) {
            String peerID = characteristic.getStringValue(0);
            if ((peerID.length() - offset) <= peerDevice.getMtu() - ATT_HEADER_READ_SIZE) {
                Log.d(TAG, "onCharacteristicReadRequest(): mtu is big enough (" + (peerID.length() - offset) + " bytes to read)");
                full = true;
            } else {
                Log.d(TAG, "onCharacteristicReadRequest(): mtu is too small (" + (peerID.length() - offset) + " bytes to read)");
            }
            value = Arrays.copyOfRange(peerID.getBytes(), offset, peerID.length());
            mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value);
            if (full) {
                peerDevice.setReadServerPeerID(true);
            }
        } else {
            mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                    0, null);
        }
    }

    // When receiving data, there are two cases:
    // * MTU is big enough, thus the whole message is transmitted, prepareWrite is false.
    // * Otherwise, we need to wait that all packets are transmitted, prepareWrite is true for
    //   all this transmissions. Data packets are put in a buffer.
    //   When all packets are sent, onExecuteWrite is called.
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
        PeerDevice peerDevice;
        boolean status = false;

        Log.d(TAG, "onCharacteristicWriteRequest() called");
        if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
            Log.e(TAG, "onCharacteristicWriteRequest() error: device not found");
        } else if (peerDevice.getPeerID() == null) {
            Log.e(TAG, "onCharacteristicWriteRequest() error: device not ready");
        } else {
            if (characteristic.getUuid().equals(GattServer.WRITER_UUID)) {
                Log.d(TAG, "onCharacteristicWriteRequest(): value is \"" + new String(value) + "\", size: " + value.length + ", offset: " + offset + ", preparedWrite: " + prepareWrite + ", needResponse: " + responseNeeded);
                if (prepareWrite) {
                    addToBuffer(value);
                    status = true;
                } else {
                    status = peerDevice.updateWriterValue(new String(value));
                    JavaToGo.ReceiveFromPeer(peerDevice.getPeerID().toString(), value);
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
    // Thus we know we can handle data put in the buffer.
    @Override
    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
        Log.d(TAG, "onExecuteWrite called(): " + execute);
        PeerDevice peerDevice;

        if (execute) {
            if (mBuffer != null) {
                if (((peerDevice = DeviceManager.get(device.getAddress())) == null)
                        || !peerDevice.updateWriterValue(new String(mBuffer))) {
                    mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE,
                            0, null);
                    mBuffer = null;
                    return ;
                }
                JavaToGo.ReceiveFromPeer(peerDevice.getPeerID().toString(), mBuffer);
            }
        }
        mBuffer = null;
        mGattServer.getGattServer().sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS,
                0, null);
    }

    @Override
    public void onMtuChanged(BluetoothDevice device, int mtu) {
        Log.d(TAG, "onMtuChanged() called: " + mtu);
        PeerDevice peerDevice;
        if ((peerDevice = DeviceManager.get(device.getAddress())) == null) {
            Log.e(TAG, "onMtuChanged() error: device not found");
            return ;
        }
        peerDevice.setMtu(mtu);
    }
}
