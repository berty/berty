package chat.berty.ble;

import android.os.Build;
import android.annotation.TargetApi;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;

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

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class GattClient extends BluetoothGattCallback {
    private static final String TAG = "gatt_client";

    GattClient() { super(); }


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

        BluetoothDevice device = gatt.getDevice();
        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(device.getAddress());

        if (bertyDevice == null) {
            Log.i(TAG, "onConnectionStateChange() client: incoming connection from device: " + device.getAddress());
            bertyDevice = new BertyDevice(device);
            DeviceManager.addDeviceToIndex(bertyDevice);
        }

        // Everything is handled in this method: GATT connection/reconnection and handshake if necessary
        bertyDevice.asyncConnectionToDevice("onConnectionStateChange() client state: " + Log.connectionStateToString(newState));

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

        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (bertyDevice != null) {
            for (BluetoothGattService service : gatt.getServices()) {
                if (service.getUuid().equals(BleManager.SERVICE_UUID)) {
                    Log.d(TAG, "onServicesDiscovered() Berty service found on device: " + bertyDevice.getAddr());
                    bertyDevice.setBertyService(service);
                    break;
                }
            }
            bertyDevice.waitServiceCheck.release();
        }

        super.onServicesDiscovered(gatt, status);
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

        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (bertyDevice != null) {
            if (status == GATT_SUCCESS) {
                bertyDevice.waitWriteDone.release();
            } else {
                String errorString;

                switch (status) {
                    case GATT_READ_NOT_PERMITTED:
                        errorString = "GATT_READ_NOT_PERMITTED";
                        break;
                    case GATT_WRITE_NOT_PERMITTED:
                        errorString = "GATT_WRITE_NOT_PERMITTED";
                        break;
                    case GATT_INSUFFICIENT_AUTHENTICATION:
                        errorString = "GATT_INSUFFICIENT_AUTHENTICATION";
                        break;
                    case GATT_REQUEST_NOT_SUPPORTED:
                        errorString = "GATT_REQUEST_NOT_SUPPORTED";
                        break;
                    case GATT_INSUFFICIENT_ENCRYPTION:
                        errorString = "GATT_INSUFFICIENT_ENCRYPTION";
                        break;
                    case GATT_INVALID_OFFSET:
                        errorString = "GATT_INVALID_OFFSET";
                        break;
                    case GATT_INVALID_ATTRIBUTE_LENGTH:
                        errorString = "GATT_INVALID_ATTRIBUTE_LENGTH";
                        break;
                    case GATT_CONNECTION_CONGESTED:
                        errorString = "GATT_CONNECTION_CONGESTED";
                        break;
                    case GATT_FAILURE:
                        errorString = "GATT_FAILURE";
                        break;
                    default:
                        errorString = "UNKNOWN_FAILURE";
                        break;
                }
                Log.e(TAG, "GATT client writing failed: " + errorString);
            }
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

        BertyDevice bertyDevice = DeviceManager.getDeviceFromAddr(gatt.getDevice().getAddress());

        if (bertyDevice != null) {
            bertyDevice.setMtu(mtu);
        }

        super.onMtuChanged(gatt, mtu, status);
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
        Log.v(TAG, "onCharacteristicRead() called with gatt: " + gatt + ", characteristic: " + characteristic + ", status: " + status);

        super.onCharacteristicRead(gatt, characteristic, status);
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
