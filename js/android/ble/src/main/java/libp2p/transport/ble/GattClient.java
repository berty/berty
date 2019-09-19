package libp2p.transport.ble;

import android.os.Build;
import android.annotation.TargetApi;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
class GattClient extends BluetoothGattCallback {
    private static final String TAG = "gatt_client";

    /**
     * Callback indicating when GATT client has connected/disconnected to/from a remote
     * GATT server.
     *
     * @param gatt     GATT client
     * @param status   Status of the connect or disconnect operation.
     *                 {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     * @param newState Returns the new connection state. Can be one of
     *                 {@link BluetoothProfile#STATE_DISCONNECTED} or
     *                 {@link BluetoothProfile#STATE_CONNECTED}
     */
    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
        Log.d(TAG, "onConnectionStateChange() client called with gatt: " + gatt + ", status: " + status + ", newState: " + Log.connectionStateToString(newState));

        if (BleManager.isDriverEnabled()) {
            BluetoothDevice device = gatt.getDevice();
            PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

            if (peerDevice == null) {
                Log.i(TAG, "onConnectionStateChange() client: incoming connection from device: " + device.getAddress());
                peerDevice = new PeerDevice(device);
                DeviceManager.addDeviceToIndex(peerDevice);
            }

            // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
            peerDevice.asyncConnectionToDevice("onConnectionStateChange() client state: " + Log.connectionStateToString(newState));
        }

        super.onConnectionStateChange(gatt, status, newState);
    }

    /**
     * Callback invoked when the list of remote services, characteristics and descriptors
     * for the remote device have been updated, ie new services have been discovered.
     *
     * @param gatt   GATT client invoked {@link BluetoothGatt#discoverServices}
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the remote device
     */
    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        Log.d(TAG, "onServicesDiscovered() called with gatt: " + gatt + ", status: " + status);

        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (peerDevice != null) {
            for (BluetoothGattService service : gatt.getServices()) {
                if (service.getUuid().equals(BleManager.SERVICE_UUID)) {
                    Log.d(TAG, "onServicesDiscovered() Libp2p service found on device: " + peerDevice.getAddr());
                    peerDevice.setLibp2pService(service);
                    break;
                }
            }
            peerDevice.waitServiceCheck.release();
        }

        super.onServicesDiscovered(gatt, status);
    }

    /**
     * Callback reporting the result of a characteristic read operation.
     *
     * @param gatt           GATT client invoked {@link BluetoothGatt#readCharacteristic}
     * @param characteristic Characteristic that was read from the associated
     *                       remote device.
     * @param status         {@link BluetoothGatt#GATT_SUCCESS} if the read operation
     */
    @Override
    public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        Log.d(TAG, "onCharacteristicRead() called with gatt: " + gatt + ", characteristic: " + characteristic + ", status: " + status);

        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (peerDevice != null) {
            peerDevice.readFailed = (status != GATT_SUCCESS);
            if (peerDevice.readFailed) {
                Log.e(TAG, "GATT client reading failed: " + Log.gattStatusToString(status));
            }
            peerDevice.waitReadDone.release();
        }

        super.onCharacteristicRead(gatt, characteristic, status);
    }

    /**
     * Callback indicating the result of a characteristic write operation.
     *
     * <p>If this callback is invoked while a reliable write transaction is
     * in progress, the value of the characteristic represents the value
     * reported by the remote device. An application should compare this
     * value to the desired value to be written. If the values don't match,
     * the application must abort the reliable write transaction.
     *
     * @param gatt           GATT client invoked {@link BluetoothGatt#writeCharacteristic}
     * @param characteristic Characteristic that was written to the associated
     *                       remote device.
     * @param status         The result of the write operation
     *                       {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        Log.d(TAG, "onCharacteristicWrite() called with gatt: " + gatt + ", characteristic: " + characteristic + ", status: " + status);

        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (peerDevice != null) {
            peerDevice.writeFailed = (status != GATT_SUCCESS);
            if (peerDevice.writeFailed) {
                Log.e(TAG, "GATT client writing failed: " + Log.gattStatusToString(status));
            }
            peerDevice.waitWriteDone.release();
        }

        super.onCharacteristicWrite(gatt, characteristic, status);
    }

    /**
     * Callback indicating the MTU for a given device connection has changed.
     * <p>
     * This callback is triggered in response to the
     * {@link BluetoothGatt#requestMtu} function, or in response to a connection
     * event.
     *
     * @param gatt   GATT client invoked {@link BluetoothGatt#requestMtu}
     * @param mtu    The new MTU size
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the MTU has been changed successfully
     */
    @Override
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
        Log.d(TAG, "onMtuChanged() called with gatt: " + gatt + ", mtu: " + mtu + ", status: " + status);

        PeerDevice peerDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (peerDevice != null) {
            peerDevice.setMtu(mtu);
        }

        super.onMtuChanged(gatt, mtu, status);
    }

    /**
     * Callback triggered as result of {@link BluetoothGatt#setPreferredPhy}, or as a result of
     * remote device changing the PHY.
     *
     * @param gatt   GATT client
     * @param txPhy  the transmitter PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}.
     * @param rxPhy  the receiver PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}.
     * @param status Status of the PHY update operation.
     *               {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onPhyUpdate(BluetoothGatt gatt, int txPhy, int rxPhy, int status) {
        Log.v(TAG, "onPhyUpdate() called with gatt: " + gatt + ", txPhy: " + txPhy + ", rxPhy: " + rxPhy + ", status: " + status);

        super.onPhyUpdate(gatt, txPhy, rxPhy, status);
    }

    /**
     * Callback triggered as result of {@link BluetoothGatt#readPhy}
     *
     * @param gatt   GATT client
     * @param txPhy  the transmitter PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}.
     * @param rxPhy  the receiver PHY in use. One of {@link BluetoothDevice#PHY_LE_1M},
     *               {@link BluetoothDevice#PHY_LE_2M}, and {@link BluetoothDevice#PHY_LE_CODED}.
     * @param status Status of the PHY read operation.
     *               {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onPhyRead(BluetoothGatt gatt, int txPhy, int rxPhy, int status) {
        Log.v(TAG, "onPhyRead() called with gatt: " + gatt + ", txPhy: " + txPhy + ", rxPhy: " + rxPhy + ", status: " + status);

        super.onPhyRead(gatt, txPhy, rxPhy, status);
    }

    /**
     * Callback triggered as a result of a remote characteristic notification.
     *
     * @param gatt           GATT client the characteristic is associated with
     * @param characteristic Characteristic that has been updated as a result
     */
    @Override
    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        Log.v(TAG, "onCharacteristicChanged() called with gatt: " + gatt + ", characteristic: " + characteristic);

        super.onCharacteristicChanged(gatt, characteristic);
    }

    /**
     * Callback reporting the result of a descriptor read operation.
     *
     * @param gatt       GATT client invoked {@link BluetoothGatt#readDescriptor}
     * @param descriptor Descriptor that was read from the associated
     *                   remote device.
     * @param status     {@link BluetoothGatt#GATT_SUCCESS} if the read operation
     */
    @Override
    public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
        Log.v(TAG, "onDescriptorRead() called with gatt: " + gatt + ", descriptor: " + descriptor + ", status: " + status);

        super.onDescriptorRead(gatt, descriptor, status);
    }

    /**
     * Callback indicating the result of a descriptor write operation.
     *
     * @param gatt       GATT client invoked {@link BluetoothGatt#writeDescriptor}
     * @param descriptor Descriptor that was write to the associated
     *                   remote device.
     * @param status     The result of the write operation
     *                   {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
        Log.v(TAG, "onDescriptorWrite() called with gatt: " + gatt + ", descriptor: " + descriptor + ", status: " + status);

        super.onDescriptorWrite(gatt, descriptor, status);
    }

    /**
     * Callback invoked when a reliable write transaction has been completed.
     *
     * @param gatt   GATT client invoked {@link BluetoothGatt#executeReliableWrite}
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the reliable write
     */
    @Override
    public void onReliableWriteCompleted(BluetoothGatt gatt, int status) {
        Log.v(TAG, "onReliableWriteCompleted() called with gatt: " + gatt + ", status: " + status);

        super.onReliableWriteCompleted(gatt, status);
    }

    /**
     * Callback reporting the RSSI for a remote device connection.
     * <p>
     * This callback is triggered in response to the
     * {@link BluetoothGatt#readRemoteRssi} function.
     *
     * @param gatt   GATT client invoked {@link BluetoothGatt#readRemoteRssi}
     * @param rssi   The RSSI value for the remote device
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the RSSI was read successfully
     */
    @Override
    public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
        Log.v(TAG, "onReadRemoteRssi() called with gatt: " + gatt + ", rssi: " + rssi + ", status: " + status);

        super.onReadRemoteRssi(gatt, rssi, status);
    }
}
