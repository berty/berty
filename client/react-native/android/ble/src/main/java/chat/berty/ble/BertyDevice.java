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
import java.util.concurrent.TimeUnit;

public class BertyDevice {

    public static String TAG = "chat.berty.ble.BertyDevice";

    public String addr;
    public String peerID;
    public String ma;
    public int mtu;
    public BluetoothGatt gatt;
    public BluetoothDevice device;
    public CountDownLatch latchRdy;
    public CountDownLatch latchConn;
    public CountDownLatch latchChar;
    public CountDownLatch latchRead;
    public Semaphore svcSema;
    public Semaphore isWaiting;
    public List<byte[]> toSend;
    protected BluetoothGattCharacteristic acceptCharacteristic;
    protected BluetoothGattCharacteristic maCharacteristic;
    protected BluetoothGattCharacteristic peerIDCharacteristic;
    protected BluetoothGattCharacteristic writerCharacteristic;
    protected BluetoothGattCharacteristic isRdyCharacteristic;
    protected BluetoothGattCharacteristic closerCharacteristic;

    public BertyDevice(BluetoothDevice device, BluetoothGatt gatt, String address) {
        this.gatt = gatt;
        this.addr = address;
        this.device = device;
        this.isWaiting = new Semaphore(1);
        this.svcSema = new Semaphore(1);
        this.latchRdy = new CountDownLatch(2);
        this.latchConn = new CountDownLatch(2);
        this.latchChar = new CountDownLatch(6);
        this.latchRead = new CountDownLatch(2);
        this.toSend = new ArrayList<>();
        waitRdy();
    }

    public void waitRdy() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("LatchIsRdy");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                    try {
                        latchRdy.await();
                        isRdyCharacteristic.setValue("");
                        while (!gatt.writeCharacteristic(isRdyCharacteristic)) {
                            /** intentionally empty */
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error waiting/writing " + e.getMessage());
                    }
                }
            }
        }).start();
    }

    public void waitConn() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("waitConn");
                try {
                    latchConn.await();
                    Log.e(TAG, "BOTH CONN RDY");
                } catch (Exception e) {
                    Log.e(TAG, "Error waiting/writing " + e.getMessage());
                }

            }
        }).start();
    }

    public void writeRdy() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("LatchIsWriteRdy");
                try {
                    TimeUnit.MILLISECONDS.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                isRdyCharacteristic.setValue("");
                while (!gatt.writeCharacteristic(isRdyCharacteristic)) {
                    /** intentionally empty */
                }
            }
        }).start();
    }

    public void write(byte[] p) throws InterruptedException {
        latchRdy.await();

        synchronized (toSend) {
            int length = p.length;
            int offset = 0;

            do {
                // You always need to detuct 3bytes from the mtu
                int chunckSize = length - offset > mtu - 3 ? mtu - 3 : length - offset;
                byte[] chunck = Arrays.copyOfRange(p, offset, offset + chunckSize);
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
