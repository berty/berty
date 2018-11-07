package chat.berty.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.os.Build;
import android.util.Log;

import java.util.concurrent.CountDownLatch;

public class BertyDevice {

    public static String TAG = "chat.berty.ble.BertyDevice";

    public String addr;
    public String peerID;
    public String ma;
    public int mtu;

    protected BluetoothGattCharacteristic acceptCharacteristic;
    protected BluetoothGattCharacteristic maCharacteristic;
    protected BluetoothGattCharacteristic peerIDCharacteristic;
    protected BluetoothGattCharacteristic writerCharacteristic;
    protected BluetoothGattCharacteristic isRdyCharacteristic;
    protected BluetoothGattCharacteristic closerCharacteristic;

    public BluetoothGatt gatt;

    public BluetoothDevice device;

    public CountDownLatch waitReady;

    public BertyDevice(BluetoothDevice device, BluetoothGatt gatt, String address) {
        this.gatt = gatt;
        this.addr = address;
        this.device = device;
        waitReady = new CountDownLatch(2);
        new Thread(new Runnable() {
            @Override
            public void run() {
                isRdy();
            }
        }).start();
    }

    public void isRdy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            try {
                waitReady.await();
                isRdyCharacteristic.setValue("");
                while (!gatt.writeCharacteristic(isRdyCharacteristic));
            } catch (Exception e) {
                Log.e(TAG, "Error waiting/writing " + e.getMessage());
            }
        }
    }
}
