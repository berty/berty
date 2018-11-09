package chat.berty.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.os.Build;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Semaphore;

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

    public Semaphore isWaiting;

    public List<byte[]> toSend;

    public BertyDevice(BluetoothDevice device, BluetoothGatt gatt, String address) {
        this.gatt = gatt;
        this.addr = address;
        this.device = device;
        this.isWaiting = new Semaphore(1);
        waitReady = new CountDownLatch(2);
        this.toSend = new ArrayList<>();
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
                while (!gatt.writeCharacteristic(isRdyCharacteristic)) {
                    /** intentionally empty */
                }
            } catch (Exception e) {
                Log.e(TAG, "Error waiting/writing " + e.getMessage());
            }
        }
    }

    public void write(byte[] p) throws InterruptedException {
        waitReady.await();
        synchronized (toSend) {

             int length = p.length;
             int offset = 0;
             do {
                 int chunckSize = length - offset > mtu ? mtu : length - offset;
                 byte[] chunck = Arrays.copyOfRange(p, offset, chunckSize);
                 offset += chunckSize;
                 toSend.add(chunck);
             } while (offset < length);


            while (!toSend.isEmpty()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                    writerCharacteristic.setValue(toSend.get(0));
                    while (!gatt.writeCharacteristic(writerCharacteristic)) {
                        /** intentionally empty */
                    }
                    isWaiting.acquire();
                }
                toSend.remove(0);
            }
        }
    }
}
