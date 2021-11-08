package tech.berty.gobridge.bledriver;

import android.os.Handler;
import android.util.Log;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import static android.bluetooth.BluetoothGatt.GATT_SUCCESS;

import androidx.arch.core.executor.TaskExecutor;

// Vastly inspired from https://medium.com/@martijn.van.welie/making-android-ble-work-part-1-a736dcd53b02
// Github repo: https://github.com/weliem/blessed-android
public class BleQueue {
    private static final String TAG = "bty.ble.BleQueue";

    // Maximum number of retries of commands
    private static final int MAX_TRIES = 3;

    // timeout in ms before cancelling task
    private static final long TIMEOUT = 5000;
    private final Queue<TaskDelay> mCommandQueue = new ConcurrentLinkedQueue<>();
    private String mId;
    private Runnable mTimeoutRunnable;
    private Handler mHandler;

    private boolean mCommandQueueBusy = false;
    private boolean mIsRetrying = false;
    private int mNrTries = 0;

    private int mIndex = 0;

    public BleQueue(Handler mHandler) {
        this.mHandler = mHandler;
    }

    public synchronized void setId(String id) {
        mId = id;
    }

    public synchronized boolean add(Runnable r, Callback callback,long delay, Runnable cancel) {
        TaskDelay task = new TaskDelay(r, callback, delay, cancel);
        boolean result = mCommandQueue.add(task);

        if (result) {
            Log.d(TAG, String.format("id=%s add: index=%d", mId, task.index));
            nextCommand();
        } else {
            Log.e(TAG, String.format("id=%s add error: could not enqueue task command", mId));
            return false;
        }
        return true;
    }

    /**
     * The current command has been completed, move to the next command in the queue (if any)
     */
    public synchronized void completedCommand(int status) {
        Log.v(TAG, String.format("id=%s completedCommand called", mId));

        cancelTimer();
        TaskDelay currentCommand = mCommandQueue.poll();
        if (currentCommand == null) {
            Log.e(TAG, String.format("id=%s completedCommand error: no task found", mId));
            return;
        }
        Log.d(TAG, String.format("id=%s completedCommand: index=%d", mId, currentCommand.index));
        if (currentCommand.callback != null) {
            Log.d(TAG, String.format("id=%s completedCommand: callback for index=%d", mId, currentCommand.index));
            mHandler.post(() -> currentCommand.callback.run(status));
        }
        mIsRetrying = false;
        mCommandQueueBusy = false;
        nextCommand();
    }

    /**
     * Retry the current command. Typically used when a read/write fails and triggers a bonding procedure
     */
    public synchronized void retryCommand() {
        // TODO: to implement in driver
        Log.v(TAG, String.format("id=%s retryCommand called", mId));

        mCommandQueueBusy = false;
        TaskDelay currentCommand = mCommandQueue.peek();
        if (currentCommand != null) {
            if (mNrTries >= MAX_TRIES) {
                // Max retries reached, give up on this one and proceed
                Log.d(TAG, String.format("id=%s retryCommand: max number of tries reached, not retrying operation anymore", mId));
                mCommandQueue.poll();
            } else {
                mIsRetrying = true;
            }
        }
        nextCommand();
    }

    private void startTimer() {
        // Check if there is something to do at all
        final TaskDelay bluetoothCommand = mCommandQueue.peek();
        if (bluetoothCommand == null) {
            Log.e(TAG, String.format("id=%s startTimer error: no task found", mId));
            return;
        }
        Log.v(TAG, String.format("id=%s startTimer called: index=%s", mId, bluetoothCommand.index));

        cancelTimer();
        mTimeoutRunnable = () -> {
            Log.i(TAG, String.format("BleQueue id=%s startTimer: cancel runnable: index=%s", mId, bluetoothCommand.index));

            mCommandQueue.poll();
            mIsRetrying = false;
            mCommandQueueBusy = false;
            bluetoothCommand.cancel.run();
            nextCommand();

            mTimeoutRunnable = null;
        };

        mHandler.postDelayed(mTimeoutRunnable, TIMEOUT);
    }

    private void cancelTimer() {
        Log.v(TAG, String.format("id=%s cancelTimer called", mId));
        if (mTimeoutRunnable != null) {
            mHandler.removeCallbacks(mTimeoutRunnable);
            mTimeoutRunnable = null;
        }
    }

    /**
     * Execute the next command in the subscribe queue.
     * A queue is used because the calls have to be executed sequentially.
     * If the read or write fails, the next command in the queue is executed.
     */
    public synchronized void nextCommand() {
        Log.v(TAG, String.format("id=%s nextCommand called", mId));

        // If there is still a command being executed, then bail out
        if (mCommandQueueBusy) {
            Log.d(TAG, String.format("id=%s nextCommand: another command is running, cancel", mId));
            return;
        }

        // Check if there is something to do at all
        final TaskDelay bluetoothCommand = mCommandQueue.peek();
        if (bluetoothCommand == null) {
            Log.v(TAG, String.format("id=%s nextCommand: no next command", mId));
            return;
        }

        Log.d(TAG, String.format("id=%s nextCommand: running index=%d", mId, bluetoothCommand.index));

        // Execute the next command in the queue
        mCommandQueueBusy = true;
        if (!mIsRetrying) {
            mNrTries = 0;
        }
        mHandler.postDelayed(() -> {
            try {
                startTimer();
                bluetoothCommand.task.run();
            } catch (Exception e) {
                Log.e(TAG, String.format("id=%s nextCommand: command exception", mId), e);
                completedCommand(1);
            }
        }, bluetoothCommand.delay);
    }

    public synchronized void clear() {
        TaskDelay taskDelay = mCommandQueue.poll();
        if (taskDelay != null) {
            mHandler.removeCallbacks(taskDelay.task);
        }
        mCommandQueue.clear();
        mCommandQueueBusy = false;
    }

    private class TaskDelay {
        private final Runnable task;
        private final Callback callback;
        private final long delay;
        private final Runnable cancel;
        private final int index;

        public TaskDelay(Runnable t, Callback cb, long d, Runnable c) {
            task = t;
            callback = cb;
            delay = d;
            cancel = c;
            index = mIndex++;
        }
    }

    static public class Callback {
        private Runnable task;
        private int status;

        public void setTask(Runnable task) {
            this.task = task;
        }

        public int getStatus() {
            return status;
        }

        public void run(int status) {
            this.status = status;
            this.task.run();
        }
    }
}
