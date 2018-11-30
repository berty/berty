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

import java.util.UUID;

import core.Core;

import static android.bluetooth.BluetoothGatt.GATT_FAILURE;
import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;
import static android.bluetooth.BluetoothProfile.STATE_CONNECTED;
import static chat.berty.ble.BertyUtils.MA_UUID;
import static chat.berty.ble.BertyUtils.PEER_ID_UUID;

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
        byte[] resp = new byte[size];
        for (int i = offset; i < value.length; i++) {
            resp[i - offset] = value[i];
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
        if (bDevice == null && newState == STATE_CONNECTED) {
            BluetoothGatt gatt = device.connectGatt(mContext, false, mGattCallback, BluetoothDevice.TRANSPORT_LE);
            BertyUtils.addDevice(device, gatt);
            bDevice = BertyUtils.getDeviceFromAddr(device.getAddress());
            bDevice.latchConn.countDown();
        } else if (bDevice != null && newState == STATE_CONNECTED && bDevice.latchConn.getCount() > 0) {
            bDevice.latchConn.countDown();
        }
//        if (newState == 0) {
//            bDevice.gatt.requestMtu(512);
//
//            List<BluetoothGattService> svcs = bDevice.gatt.getServices();
//            BluetoothManager mb = (BluetoothManager) mContext.getSystemService(BLUETOOTH_SERVICE);
//            List<BluetoothDevice> gbd = mb.getConnectedDevices(GATT);
//            List<BluetoothDevice> gbds = mb.getConnectedDevices(GATT_SERVER);
//
//
//            BertyUtils.logger("debug", TAG, "SVC " + svcs);
//            for (BluetoothGattService svc: svcs) {
//                BertyUtils.logger("debug", TAG, "SVC " + svc.toString());
//            }
//            BertyUtils.logger("debug", TAG, "gdb " + gbd);
//            for (BluetoothDevice g : gbd) {
//                BertyUtils.logger("debug", TAG, "SVC " + g.getAddress());
//            }
//            BertyUtils.logger("debug", TAG, "gdbs " + gbds);
//            for (BluetoothDevice g : gbds) {
//                BertyUtils.logger("debug", TAG, "SVC " + g.getAddress());
//            }
//        }
////                    runDiscoAndMtu(bDevice.gatt);
//        super.onConnectionStateChange(device, status, newState);
//        BertyUtils.logger("debug", TAG, "Server new coon " + device.getAddress());
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
        UUID charID = characteristic.getUuid();
        if (charID.equals(MA_UUID)) {
            byte[] value = BertyUtils.maCharacteristic.getValue();
            sendReadResponse(value, device, offset, requestId);
        } else if (charID.equals(PEER_ID_UUID)) {
            byte[] value = BertyUtils.peerIDCharacteristic.getValue();
            sendReadResponse(value, device, offset, requestId);
        } else {
            BertyUtils.logger("error", TAG, "unknown characteristic read");
            mBluetoothGattServer.sendResponse(device, requestId, GATT_FAILURE, offset, null);
        }
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
            Core.bytesToConn(bDevice.ma, value);
            if (responseNeeded) {
                mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, value);
            }
        } else if (charID.equals(BertyUtils.CLOSER_UUID)) {
//            // TODO
        } else if (charID.equals(BertyUtils.IS_READY_UUID)) {
            bDevice.latchRdy.countDown();
            BertyUtils.logger("debug", TAG, "other device is ready");
            mBluetoothGattServer.sendResponse(device, requestId, GATT_SUCCESS, offset, null);
        } else {
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
    @Override
    public void onExecuteWrite(BluetoothDevice device, int requestId, boolean execute) {
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
//        BertyDevice bertyDevice = getDeviceFromAddr(device.getAddress());
//        bertyDevice.mtu = mtu;
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
