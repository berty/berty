package chat.berty.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;

public class BertyDevice {

    public String addr;
    public String peerID;
    public String ma;
    public long mtu;

    protected BluetoothGattCharacteristic acceptCharacteristic;
    protected BluetoothGattCharacteristic maCharacteristic;
    protected BluetoothGattCharacteristic peerIDCharacteristic;
    protected BluetoothGattCharacteristic writerCharacteristic;
    protected BluetoothGattCharacteristic isRdyCharacteristic;
    protected BluetoothGattCharacteristic closerCharacteristic;

    public BluetoothGatt gatt;

    public BluetoothDevice device;

    public BertyDevice(BluetoothDevice rDevice, BluetoothGatt rGatt, String address) {
        gatt = rGatt;
        addr = address;
        device = rDevice;
    }

}
