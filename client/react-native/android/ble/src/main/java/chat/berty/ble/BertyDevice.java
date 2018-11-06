package chat.berty.ble;

import android.bluetooth.BluetoothDevice;

public class BertyDevice {

    public String addr;
    public String peerID;
    public String ma;
    public BluetoothDevice device;

    public BertyDevice(BluetoothDevice rDevice, String address) {
        addr = address;
        device = rDevice;
    }

}
