package chat.berty.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;

public class BertyDevice {

    public String addr;
    public String peerID;
    public String ma;
    public long mtu;

    public BluetoothGatt gatt;

    public BluetoothDevice device;

    public BertyDevice(BluetoothDevice rDevice, BluetoothGatt rGatt, String address) {
        gatt = rGatt;
        addr = address;
        device = rDevice;
    }

}
