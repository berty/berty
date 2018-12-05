package chat.berty.ble;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.os.Build;
import android.util.Log;

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
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;

@SuppressLint("LongLogTag")
@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
public class BertyGatt extends BluetoothGattCallback {
    private static final String TAG = "gatt_client";
    public BertyGatt() {
        super();
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
        BertyUtils.logger("debug", TAG, "onPhyUpdate() called");
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
        BertyUtils.logger("debug", TAG, "onPhyRead() called");
        super.onPhyRead(gatt, txPhy, rxPhy, status);
    }

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
        BertyUtils.logger("debug", TAG, "onConnectionStateChange() called: gatt=" + gatt.getDevice().getAddress() + " status=" + status + " newState=" + newState);
        if (status == GATT_SUCCESS && newState == STATE_CONNECTED) {
            BertyDevice bDevice = BertyUtils.getDeviceFromAddr(gatt.getDevice().getAddress());
            bDevice.latchConn.countDown();
        }  else if (newState != STATE_DISCONNECTED) {
            BertyDevice bDevice = BertyUtils.getDeviceFromAddr(gatt.getDevice().getAddress());
            if (bDevice != null) {
                BertyUtils.removeDevice(bDevice);
            }
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
        BertyUtils.logger("debug", TAG, "onServicesDiscovered() called status:  " + status + " " + gatt.getService(BertyUtils.SERVICE_UUID));
        BertyDevice bDevice = BertyUtils.getDeviceFromAddr(gatt.getDevice().getAddress());
        for (BluetoothGattService svc : gatt.getServices()) {
            if (svc.getUuid().equals(BertyUtils.SERVICE_UUID)) {
                bDevice.svc = svc;
                bDevice.svcSema.release();

                return;
            }
        }
        Log.e(TAG, "onServicesDiscovered() error service not known");

        BertyUtils.removeDevice(bDevice);
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
        BertyUtils.logger("debug", TAG, "onCharacteristicRead() - gatt: " + gatt.getDevice().getAddress() + " characteristic: " + characteristic.getUuid() + " status: " + status);
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
        BertyUtils.logger("debug", TAG, "onCharacteristicWrite() called");
        BertyDevice bDevice = BertyUtils.getDeviceFromAddr(gatt.getDevice().getAddress());
        if (status == GATT_SUCCESS) {
            bDevice.isWaiting.release();
        } else {
            String errorString;

            switch (status) {
                case GATT_SUCCESS:
                    errorString = "GATT_SUCCESS";
                    break;
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
                    if (bDevice != null) {
                        BertyUtils.removeDevice(bDevice);
                    }
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
                    errorString = "UNKNOW FAIL";
                    break;
            }
            BertyUtils.logger("debug", TAG, "GATT writing failed: " + errorString);
        }
        super.onCharacteristicWrite(gatt, characteristic, status);
    }

    /**
     * Callback triggered as a result of a remote characteristic notification.
     *
     * @param gatt           GATT client the characteristic is associated with
     * @param characteristic Characteristic that has been updated as a result
     */
    @Override
    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        BertyUtils.logger("debug", TAG, "onCharacteristicChanged() called");
//        BertyUtils.logger("debug", TAG, "charact changed " + new String(characteristic.getValue(), Charset.forName("UTF-8")));
//        BertyDevice bDevice = getDeviceFromAddr(gatt.getDevice().getAddress());
//        handleReadCharact(bDevice, characteristic);
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
        BertyUtils.logger("debug", TAG, "onDescriptorRead() called");
        super.onDescriptorRead(gatt, descriptor, status);
    }

    /**
     * Callback indicating the result of a descriptor write operation.
     *
     * @param gatt       GATT client invoked {@link BluetoothGatt#writeDescriptor}
     * @param descriptor Descriptor that was writte to the associated
     *                   remote device.
     * @param status     The result of the write operation
     *                   {@link BluetoothGatt#GATT_SUCCESS} if the operation succeeds.
     */
    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
        BertyUtils.logger("debug", TAG, "onDescriptorWrite() called");
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
        BertyUtils.logger("debug", TAG, "onReliableWriteCompleted() called");
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
        BertyUtils.logger("debug", TAG, "onReadRemoteRssi() called");
        super.onReadRemoteRssi(gatt, rssi, status);
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
        BertyUtils.logger("debug", TAG, "onMtuChanged() called");
        BertyDevice bertyDevice = BertyUtils.getDeviceFromAddr(gatt.getDevice().getAddress());
        bertyDevice.mtu = mtu;
        super.onMtuChanged(gatt, mtu, status);
    }
}
