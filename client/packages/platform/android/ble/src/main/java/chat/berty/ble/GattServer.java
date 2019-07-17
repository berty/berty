package chat.berty.ble;

//import core.Core;

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
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class GattServer extends BluetoothGattServerCallback {
    private static final String TAG = "gatt_server";

    private BluetoothGattServer mBluetoothGattServer;

    GattServer() { super(); }

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

        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (bertyDevice == null) {
            Log.i(TAG, "onConnectionStateChange() server: incoming connection from device: " + device.getAddress());
            bertyDevice = new BertyDevice(device);
            DeviceManager.addDeviceToIndex(bertyDevice);
        }

        // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
        bertyDevice.asyncConnectionToDevice("onConnectionStateChange() server state: " + Log.connectionStateToString(newState));

        super.onConnectionStateChange(device, status, newState);
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

        UUID charID = characteristic.getUuid();
        final BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (bertyDevice == null) {
            Log.e(TAG, "onCharacteristicWriteRequest() failed: unknown device");
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
            return;
        }

        if (charID.equals(BleManager.WRITER_UUID)) {
            Log.i(TAG, "onCharacteristicWriteRequest() Writer called with payload: " + Arrays.toString(value) + ", hashCode: " + Arrays.toString(value).hashCode() + ", string: " + new String(value).replaceAll("\\p{C}", "?") + ", length: " + value.length + ", from MultiAddr: " + bertyDevice.getMultiAddr());

            if (!bertyDevice.isIdentified()) {
                Log.e(TAG, "onCharacteristicWriteRequest() Writer failed: unidentified device tried to write on writer characteristic");
                mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
                return;
            }

//            Core.receiveFromDevice(bertyDevice.getMultiAddr(), value);

            if (responseNeeded) {
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value);
            }
        } else if (charID.equals(BleManager.PEER_ID_UUID) || charID.equals(BleManager.MA_UUID)) {
            if (bertyDevice.isIdentified()) {
                Log.e(TAG, "onCharacteristicWriteRequest() PeerID/MultiAddr failed: identified device tried to write on PeerID characteristic");
                bertyDevice.asyncDisconnectFromDevice("onCharacteristicWriteRequest() PeerID");
                mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
                return;
            }

            if (charID.equals(BleManager.PEER_ID_UUID)) {
                if (bertyDevice.getPeerID() != null) {
                    bertyDevice.setPeerID(bertyDevice.getPeerID() + new String(value));
                } else {
                    bertyDevice.setPeerID(new String(value));
                }

                if (bertyDevice.getPeerID().length() == 46) {
                    Log.i(TAG, "onCharacteristicWriteRequest() PeerID: " + bertyDevice.getPeerID() + " received from device: " + device);
                    bertyDevice.infosReceived.countDown();
                }
            } else if (charID.equals(BleManager.MA_UUID)) {
                if (bertyDevice.getMultiAddr() != null) {
                    bertyDevice.setMultiAddr(bertyDevice.getMultiAddr() + new String(value));
                } else {
                    bertyDevice.setMultiAddr(new String(value));
                }

                if (bertyDevice.getMultiAddr().length() == 36) {
                    Log.i(TAG, "onCharacteristicWriteRequest() MultiAddr: " + bertyDevice.getMultiAddr() + " received from device: " + device);
                    bertyDevice.infosReceived.countDown();
                }
            }

            if (responseNeeded) {
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value);
            }
        }
        else {
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
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

        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (bertyDevice != null) {
            bertyDevice.setMtu(mtu);
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
        Log.d(TAG, "sendServiceAdded() called with status: " + status + ", service: " + service);

        super.onServiceAdded(status, service);
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
        Log.v(TAG, "onCharacteristicReadRequest() called with device: " + device + ", requestId: " + requestId + ", offset: " + offset + ", characteristic: " + characteristic);

        super.onCharacteristicReadRequest(device, requestId, offset, characteristic);
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
