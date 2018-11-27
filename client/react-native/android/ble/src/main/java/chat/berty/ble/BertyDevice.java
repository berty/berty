package chat.berty.ble;

import android.annotation.TargetApi;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.os.Build;
import android.support.annotation.Nullable;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
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
    protected BluetoothGattService svc;
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
        this.svcSema = new Semaphore(0);
        this.latchRdy = new CountDownLatch(2);
        this.latchConn = new CountDownLatch(2);
        this.latchChar = new CountDownLatch(6);
        this.latchRead = new CountDownLatch(2);
        this.toSend = new ArrayList<>();
        waitRdy();
        waitConn();
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
        Log.e(TAG, "waitConn()");
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("WaitConn");
                try {
                    latchConn.await();
                    while (!gatt.discoverServices()){
                        Log.e(TAG, "Waiting service discover");
                        Thread.sleep(1000);
                    }
                    waitService();
                } catch (Exception e) {
                    Log.e(TAG, "Error waiting/writing " + e.getMessage());
                }

            }
        }).start();
    }

    public void waitService() {
        Log.e(TAG, "waitService()");
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("WaitService");
                try {
                    svcSema.acquire();
                    waitChar();
                    populateCharacteristic();
                } catch (Exception e) {
                    Log.e(TAG, "Error waiting/writing " + e.getMessage());
                }

            }
        }).start();
    }

    public void waitChar() {
        Log.e(TAG, "waitChar()");
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("WaitChar");
                try {
                    latchChar.await();
                    waitRead();
                    launchRead(maCharacteristic);
                    launchRead(peerIDCharacteristic);
                } catch (Exception e) {
                    Log.e(TAG, "Error waiting/writing " + e.getMessage());
                }

            }
        }).start();
    }

    public void waitRead() {
        Log.e(TAG, "waitRead()");
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("WaitChar");
                try {
                    latchRead.await();
                    launchWriteIsRdy();
                } catch (Exception e) {
                    Log.e(TAG, "Error waiting/writing " + e.getMessage());
                }

            }
        }).start();
    }

    public void launchRead(BluetoothGattCharacteristic characteristic) {
        Log.e(TAG, "launchRead() - characteristic=" + characteristic.getUuid());
        new Thread(new Runnable() {
            @Override
            public void run() {
                Thread.currentThread().setName("LaunchRead");
                while (!gatt.readCharacteristic(characteristic)) {
                    Log.e(TAG, "launchRead() waiting read");
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public void populateCharacteristic() {
        Log.e(TAG, "populateCharacteristic()");
        ExecutorService es = Executors.newFixedThreadPool(6);
        List<PopulateCharacteristic> todo = new ArrayList<>(6);

        todo.add(new PopulateCharacteristic(BertyUtils.MA_UUID));
        todo.add(new PopulateCharacteristic(BertyUtils.PEER_ID_UUID));
        todo.add(new PopulateCharacteristic(BertyUtils.CLOSER_UUID));
        todo.add(new PopulateCharacteristic(BertyUtils.WRITER_UUID));
        todo.add(new PopulateCharacteristic(BertyUtils.IS_READY_UUID));
        todo.add(new PopulateCharacteristic(BertyUtils.ACCEPT_UUID));

        try {
            List<Future<BluetoothGattCharacteristic>> answers = es.invokeAll(todo);
            for (Future<BluetoothGattCharacteristic> future : answers) {
                BluetoothGattCharacteristic c = future.get();

                if (c != null && c.getUuid().equals(BertyUtils.MA_UUID)) {
                    maCharacteristic = c;
                    latchChar.countDown();
                } else if (c != null && c.getUuid().equals(BertyUtils.PEER_ID_UUID)) {
                    peerIDCharacteristic = c;
                    latchChar.countDown();
                } else if (c != null && c.getUuid().equals(BertyUtils.CLOSER_UUID)) {
                    closerCharacteristic = c;
                    latchChar.countDown();
                } else if (c != null && c.getUuid().equals(BertyUtils.WRITER_UUID)) {
                    writerCharacteristic = c;
                    latchChar.countDown();
                } else if (c != null && c.getUuid().equals(BertyUtils.IS_READY_UUID)) {
                    isRdyCharacteristic = c;
                    latchChar.countDown();
                } else if (c != null && c.getUuid().equals(BertyUtils.ACCEPT_UUID)) {
                    acceptCharacteristic = c;
                    latchChar.countDown();
                } else {
                    Log.e(TAG, "Retrieved an unknown characteristic");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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

    private class PopulateCharacteristic implements Callable<BluetoothGattCharacteristic> {
        private UUID uuid;

        public PopulateCharacteristic(UUID charactUUID) {
            uuid = charactUUID;
        }

        public @Nullable
        BluetoothGattCharacteristic call() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                return gatt.getService(BertyUtils.SERVICE_UUID).getCharacteristic(uuid);
            }

            return null;
        }
    }
}
