package chat.berty.ble;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.util.Log;

import java.nio.charset.Charset;
import java.util.UUID;

////import core.Core;

import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static android.bluetooth.BluetoothProfile.STATE_DISCONNECTED;

@SuppressLint("LongLogTag")
@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
public class BertyGattServer extends BluetoothGattServerCallback {
    private static final String TAG = "gatt_server";

    public BluetoothGattServer mBluetoothGattServer;

    public Context mContext;

    public BertyGatt mGattCallback;

    public BertyGattServer() {
        super();
        Thread.currentThread().setName("BertyGattServer");
    }

    public void sendReadResponse(byte[] value, BluetoothDevice device, int offset, int requestId) {
        BertyUtils.logger("debug", TAG, "sendReadResponse() called");
        if (offset > value.length) {
            mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, 0, new byte[]{0} );
            return;
        }
        int size = value.length - offset;
        byte[] resp = new byte[size + 1];
        for (int i = offset; i < value.length; i++) {
            resp[i - offset] = value[i];
            resp[i - offset + 1] = 0;
        }
        mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, resp);
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
        BertyUtils.logger("debug", TAG, "onConnectionStateChange() called: device=" + device.getAddress() + " status=" + status + " newState=" + newState);

        BertyDevice bDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
        if (status == GATT_SUCCESS && newState == STATE_CONNECTED && bDevice == null) {
//            bDevice.latchConn.countDown();
            BertyUtils.addDevice(device, mContext, mGattCallback);
        } else if (newState == STATE_DISCONNECTED) {
            if (bDevice != null) {
                BertyUtils.removeDevice(bDevice);
            }
        }
        super.onConnectionStateChange(device, status, newState);
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
        BertyUtils.logger("debug", TAG, "sendServiceAdded() called");
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
        BertyUtils.logger("debug", TAG, "onCharacteristicReadRequest() called: device=" + device.getAddress() + " requestId=" + requestId + " offset=" + offset + " characteristic=" + characteristic.getUuid());
//        UUID charID = characteristic.getUuid();
//        BertyDevice bDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
//        if (bDevice == null) {
//            BluetoothGatt gatt = device.connectGatt(mContext, false, mGattCallback, BluetoothDevice.TRANSPORT_LE);
//            BertyUtils.addDevice(device, gatt);
//            bDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
//
////            Log.e(TAG, "onCharacteristicReadRequest() device unknown");
////            mBluetoothGattServer.sendResponse(device, requestId, GATT_REQUEST_NOT_SUPPORTED, offset, null);
////            return;
//        }
//        if (charID.equals(MA_UUID)) {
//            byte[] value = BertyUtils.maCharacteristic.getValue();
//            Log.e(TAG, "Offset " + offset + " length " + value.length + " MTU " + bDevice.mtu);
//            if (offset > value.length || (offset + bDevice.mtu - 3) > value.length) {
//                Log.e(TAG, "OTHE DOWN1");
//                bDevice.latchOtherRead.countDown();
//            }
//            sendReadResponse(value, device, offset, requestId);
//        } else if (charID.equals(PEER_ID_UUID)) {
//            byte[] value = BertyUtils.peerIDCharacteristic.getValue();
//            Log.e(TAG, "Offset " + offset + " length " + value.length + " MTU " + bDevice.mtu);
//            if (offset > value.length || (offset + bDevice.mtu - 3) > value.length) {
//                Log.e(TAG, "OTHE DOWN");
//                bDevice.latchOtherRead.countDown();
//            }
//            sendReadResponse(value, device, offset, requestId);
//        } else {
//            Log.e(TAG, "READ UNKNOW");
//            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
//        }
        super.onCharacteristicReadRequest(device, requestId, offset, characteristic);
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
        super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value);
        BertyUtils.logger("debug", TAG, "onCharacteristicWriteRequest() called");
        UUID charID = characteristic.getUuid();
        BertyDevice bDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
        if (charID.equals(BertyUtils.WRITER_UUID)) {
            BertyUtils.logger("debug", TAG, "rep needed: " + responseNeeded + "prepared: " + preparedWrite + " transid: " + requestId  + " offset: " + offset + " len: " + value.length);
////            Core.bytesToConn(bDevice.ma, value);
            if (responseNeeded) {
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value);
            }
        } else if (charID.equals(BertyUtils.CLOSER_UUID)) {
//            // TODO
        } else if (charID.equals(BertyUtils.PEER_ID_UUID)) {
            if (responseNeeded) {
                Log.e(TAG, "GATT RESP " +mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value));
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value);
            }
            Log.e(TAG, "recv " + new String(value, Charset.forName("UTF-8")));
            if (bDevice.peerID != null) {
                bDevice.peerID += new String(value, Charset.forName("UTF-8"));
            } else {
                bDevice.peerID = new String(value, Charset.forName("UTF-8"));
            }

            Log.e(TAG, "rep needed" + responseNeeded+ "prepared " + preparedWrite + " transid " + requestId  + " offset " + offset + " len: " + value.length);

            if (bDevice.peerID.length() == 46) {
                Log.e(TAG, "COUNTDONW");
                bDevice.latchRdy.countDown();
            }
        } else if(charID.equals(BertyUtils.MA_UUID)) {
            if (responseNeeded) {

                Log.e(TAG, "GATT RESP " +mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value));
            }
            Log.e(TAG, "recv " + new String(value, Charset.forName("UTF-8")));
            Log.e(TAG, "rep needed" + responseNeeded+ "prepared " + preparedWrite + " transid " + requestId  + " offset " + offset + " len: " + value.length);
            if (bDevice.ma != null) {
                bDevice.ma += new String(value, Charset.forName("UTF-8"));
            } else {
                bDevice.ma = new String(value, Charset.forName("UTF-8"));
            }
        }
        else {
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
        }
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
//    @Override
//    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
//        super.onExecuteWrite(device, requestId, execute);
//    }

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
        super.onNotificationSent(device, status);
        BertyUtils.logger("debug", TAG, "onNotificationSent() called");
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
        BertyUtils.logger("debug", TAG, "onMtuChanged() called");
        super.onMtuChanged(device, mtu);
        BertyDevice bertyDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
        bertyDevice.mtu = mtu;
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
        BertyUtils.logger("debug", TAG, "onPhyUpdate() called");
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
        BertyUtils.logger("debug", TAG, "onPhyRead() called");
        super.onPhyRead(device, txPhy, rxPhy, status);
    }
}
