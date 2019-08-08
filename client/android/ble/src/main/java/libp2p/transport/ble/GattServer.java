package libp2p.transport.ble;

import core.Core;

import java.util.UUID;
import android.os.Build;
import android.annotation.TargetApi;
import java.util.Arrays;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;

import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_INVALID_OFFSET;
import static android.bluetooth.BluetoothGatt.GATT_REQUEST_NOT_SUPPORTED;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
class GattServer extends BluetoothGattServerCallback {
    private static final String TAG = "gatt_server";

    private BluetoothGattServer mBluetoothGattServer;

    void setBluetoothGattServer(BluetoothGattServer bluetoothGattServer) {
        Log.d(TAG, "Bluetooth GATT server set: " + bluetoothGattServer);

        mBluetoothGattServer = bluetoothGattServer;
    }

    void closeGattServer() {
        Log.d(TAG, "closeGattServer() called");

        if (mBluetoothGattServer != null) {
            mBluetoothGattServer.close();
            mBluetoothGattServer = null;
        } else {
            Log.w(TAG, "Bluetooth GATT server not set");
        }
    }

    /**
     * Callback indicating when a remote device has been connected or disconnected.
     *
     * @param device   Remote device that has been connected or disconnected.
     * @param status   Status of the connect or disconnect operation.
     * @param newState Returns the new connection state. Can be one of
     *                 {@link BluetoothProfile#STATE_DISCONNECTED} or
     *                 {@link BluetoothProfile#STATE_CONNECTED}
     */
    @Override
    public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
        Log.d(TAG, "onConnectionStateChange() server called with device: " + device + ", status: " + status + ", newState: " + Log.connectionStateToString(newState));

        if (BleManager.isDriverEnabled()) {
            PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

            if (peerDevice == null) {
                Log.i(TAG, "onConnectionStateChange() server: incoming connection from device: " + device.getAddress());
                peerDevice = new PeerDevice(device);
                DeviceManager.addDeviceToIndex(peerDevice);
            }

            // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
            peerDevice.asyncConnectionToDevice("onConnectionStateChange() server state: " + Log.connectionStateToString(newState));
        }

        super.onConnectionStateChange(device, status, newState);
    }

    /**
     * A remote client has requested to read a local characteristic.
     *
     * <p>An application must call {@link BluetoothGattServer#sendResponse}
     * to complete the request.
     *
     * @param device         The remote device that has requested the read operation
     * @param requestId      The Id of the request
     * @param offset         Offset into the value of the characteristic
     * @param characteristic Characteristic to be read
     */
    @Override
    public void onCharacteristicReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattCharacteristic characteristic) {
        Log.d(TAG, "onCharacteristicReadRequest() called with device: " + device + ", requestId: " + requestId + ", offset: " + offset + ", characteristic: " + characteristic);

        super.onCharacteristicReadRequest(device, requestId, offset, characteristic);

        final UUID charID = characteristic.getUuid();
        final PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (peerDevice == null) {
            Log.e(TAG, "onCharacteristicReadRequest() failed: unknown device");
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, 0, null);
            return;
        }

        if (charID.equals(BleManager.PEER_ID_UUID) || charID.equals(BleManager.MA_UUID)) {
            if (peerDevice.isIdentified()) {
                Log.e(TAG, "onCharacteristicReadRequest() failed: identified device tried to read on PeerID or MultiAddr characteristic");
                peerDevice.disconnectFromDevice("onCharacteristicReadRequest() device already identified");
                mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, 0, null);
                return;
            }

            byte[] value = charID.equals(BleManager.PEER_ID_UUID) ? BleManager.getPeerID().getBytes() : BleManager.getMultiAddr().getBytes();

            if (offset < 0) {
                Log.d(TAG, "onCharacteristicReadRequest() remote device: " + device + " tried to read on a negative offset");
                mBluetoothGattServer.sendResponse(device, requestId, GATT_INVALID_OFFSET, 0, null);
                return;
            } else {
                byte[] chunk;
                int mtu = peerDevice.getMtu();

                if (value.length - offset > mtu) {
                    chunk = Arrays.copyOfRange(value, offset, offset + mtu);
                } else { // Last chunk
                    chunk = Arrays.copyOfRange(value, offset, value.length);
                    peerDevice.infosResponse.countDown(); // Countdown for PeerID / MultiAddr
                }

                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, chunk);
                Log.d(TAG, "onCharacteristicReadRequest() remote device: " + device + " sent response with value (offset " + offset + "): " + new String(chunk));
            }
        } else {
            Log.e(TAG, "onCharacteristicReadRequest() remote device: " + device + " tried to read on wrong characteristic: " + charID);
            mBluetoothGattServer.sendResponse(device, requestId, GATT_REQUEST_NOT_SUPPORTED, 0, null);
        }
    }

    /**
     * A remote client has requested to write to a local characteristic.
     *
     * <p>An application must call {@link BluetoothGattServer#sendResponse}
     * to complete the request.
     *
     * @param device         The remote device that has requested the write operation
     * @param requestId      The Id of the request
     * @param characteristic Characteristic to be written to.
     * @param preparedWrite  true, if this write operation should be queued for
     *                       later execution.
     * @param responseNeeded true, if the remote device requires a response
     * @param offset         The offset given for the value
     * @param value          The value the client wants to assign to the characteristic
     */
    @Override
    public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId, BluetoothGattCharacteristic characteristic, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
        Log.d(TAG, "onCharacteristicWriteRequest() called with device: " + device + ", requestId: " + requestId + ", characteristic: " + characteristic + ", preparedWrite: " + preparedWrite + ", responseNeeded: " + responseNeeded + ", offset: " + offset + ", value: " + new String(value) + ", len: " + value.length);

        super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value);

        final UUID charID = characteristic.getUuid();
        final PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (peerDevice == null) {
            Log.e(TAG, "onCharacteristicWriteRequest() failed: unknown device");
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, 0, null);
            return;
        }

        if (charID.equals(BleManager.WRITER_UUID)) {
            Log.i(TAG, "onCharacteristicWriteRequest() called with payload: " + Arrays.toString(value) + ", hashCode: " + Arrays.toString(value).hashCode() + ", string: " + new String(value).replaceAll("\\p{C}", "?") + ", length: " + value.length + ", from MultiAddr: " + peerDevice.getMultiAddr());

            if (!peerDevice.isIdentified()) {
                Log.e(TAG, "onCharacteristicWriteRequest() failed: unidentified device tried to write on writer characteristic");
                mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, 0, null);
                return;
            }

            Core.receiveFromDevice(peerDevice.getMultiAddr(), value);

            if (responseNeeded) {
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, 0, value);
            }
        } else {
            Log.e(TAG, "onCharacteristicWriteRequest() remote device: " + device + " tried to write on wrong characteristic: " + charID);
            mBluetoothGattServer.sendResponse(device, requestId, GATT_REQUEST_NOT_SUPPORTED, 0, null);
        }
    }

    /**
     * Callback indicating the MTU for a given device connection has changed.
     *
     * <p>This callback will be invoked if a remote client has requested to change
     * the MTU for a given connection.
     *
     * @param device The remote device that requested the MTU change
     * @param mtu    The new MTU size
     */
    @Override
    public void onMtuChanged(BluetoothDevice device, int mtu) {
        Log.d(TAG, "onMtuChanged() called with device: " + device + ", mtu: " + mtu);

        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (peerDevice != null) {
            peerDevice.setMtu(mtu);
        }

        super.onMtuChanged(device, mtu);
    }

    /**
     * Indicates whether a local service has been added successfully.
     *
     * @param status  Returns {@link BluetoothGatt#GATT_SUCCESS} if the service
     *                was added successfully.
     * @param service The service that has been added
     */
    @Override
    public void onServiceAdded(int status, BluetoothGattService service) {
        Log.d(TAG, "onServiceAdded() called with status: " + status + ", service: " + service);

        super.onServiceAdded(status, service);
    }

    /**
     * A remote client has requested to read a local descriptor.
     *
     * <p>An application must call {@link BluetoothGattServer#sendResponse}
     * to complete the request.
     *
     * @param device     The remote device that has requested the read operation
     * @param requestId  The Id of the request
     * @param offset     Offset into the value of the characteristic
     * @param descriptor Descriptor to be read
     */
    @Override
    public void onDescriptorReadRequest(BluetoothDevice device, int requestId, int offset, BluetoothGattDescriptor descriptor) {
        Log.v(TAG, "onDescriptorReadRequest() called with device: " + device + ", requestId: " + requestId + ", offset: " + offset + ", descriptor: " + descriptor);

        super.onDescriptorReadRequest(device, requestId, offset, descriptor);
    }

    /**
     * A remote client has requested to write to a local descriptor.
     *
     * <p>An application must call {@link BluetoothGattServer#sendResponse}
     * to complete the request.
     *
     * @param device         The remote device that has requested the write operation
     * @param requestId      The Id of the request
     * @param descriptor     Descriptor to be written to.
     * @param preparedWrite  true, if this write operation should be queued for
     *                       later execution.
     * @param responseNeeded true, if the remote device requires a response
     * @param offset         The offset given for the value
     * @param value          The value the client wants to assign to the descriptor
     */
    @Override
    public void onDescriptorWriteRequest(BluetoothDevice device, int requestId, BluetoothGattDescriptor descriptor, boolean preparedWrite, boolean responseNeeded, int offset, byte[] value) {
        Log.v(TAG, "onNotificationSent() called with device: " + device + ", requestId: " + requestId + ", descriptor: " + descriptor + ", preparedWrite: " + preparedWrite + ", responseNeeded: " + responseNeeded + ", offset: " + offset + ", len: " + value.length);

        super.onDescriptorWriteRequest(device, requestId, descriptor, preparedWrite, responseNeeded, offset, value);
    }

    /**
     * Execute all pending write operations for this device.
     *
     * <p>An application must call {@link BluetoothGattServer#sendResponse}
     * to complete the request.
     *
     * @param device    The remote device that has requested the write operations
     * @param requestId The Id of the request
     * @param execute   Whether the pending writes should be executed (true) or
     */
    @Override
    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
        Log.v(TAG, "onNotificationSent() called with device: " + device + ", requestId: " + requestId + ", execute: " + execute);

        super.onExecuteWrite(device, requestId, execute);
    }

    /**
     * Callback invoked when a notification or indication has been sent to
     * a remote device.
     *
     * <p>When multiple notifications are to be sent, an application must
     * wait for this callback to be received before sending additional
     * notifications.
     *
     * @param device The remote device the notification has been sent to
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the operation was successful
     */
    @Override
    public void onNotificationSent(BluetoothDevice device, int status) {
        Log.v(TAG, "onNotificationSent() called with device: " + device + ", status: " + status);

        super.onNotificationSent(device, status);
    }

    /**
     * Callback triggered as result of {@link BluetoothGattServer#setPreferredPhy}, or as a result
     * of remote device changing the PHY.
     *
     * @param device The remote device
     * @param txPhy  the transmitter PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}
     * @param rxPhy  the receiver PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}
     * @param status Status of the PHY update operation.
     *               {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onPhyUpdate(BluetoothDevice device, int txPhy, int rxPhy, int status) {
        Log.v(TAG, "onPhyUpdate() called with device: " + device + ", txPhy: " + txPhy + ", rxPhy: " + rxPhy + ", status: " + status);

        super.onPhyUpdate(device, txPhy, rxPhy, status);
    }

    /**
     * Callback triggered as result of {@link BluetoothGattServer#readPhy}
     *
     * @param device The remote device that requested the PHY read
     * @param txPhy  the transmitter PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}
     * @param rxPhy  the receiver PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}
     * @param status Status of the PHY read operation.
     *               {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onPhyRead(BluetoothDevice device, int txPhy, int rxPhy, int status) {
        Log.v(TAG, "onPhyRead() called with device: " + device + ", txPhy: " + txPhy + ", rxPhy: " + rxPhy + ", status: " + status);

        super.onPhyRead(device, txPhy, rxPhy, status);
    }
}
