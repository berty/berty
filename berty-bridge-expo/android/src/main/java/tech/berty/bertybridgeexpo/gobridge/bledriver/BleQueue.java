package tech.berty.bertybridgeexpo.gobridge.bledriver;

import static android.bluetooth.BluetoothGatt.GATT_FAILURE;

import android.os.Handler;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

// Vastly inspired from https://medium.com/@martijn.van.welie/making-android-ble-work-part-1-a736dcd53b02
// Github repo: https://github.com/weliem/blessed-android
public class BleQueue {
    private static final String TAG = "bty.ble.BleQueue";
    private final Logger mLogger;

    // Maximum number of retries of commands
    private static final int MAX_TRIES = 3;

    // timeout in ms before cancelling task
    private static final long TIMEOUT = 5000;

    // status given to the callback of a command that timed out or was dropped
    private static final int STATUS_FAILURE = GATT_FAILURE;
    private final Queue<TaskDelay> mCommandQueue = new ConcurrentLinkedQueue<>();
    private String mId;
    private Runnable mTimeoutRunnable;
    private Handler mHandler;

    private boolean mCommandQueueBusy = false;
    private boolean mIsRetrying = false;
    private int mNrTries = 0;

    private int mIndex = 0;

    public BleQueue(Logger logger, Handler handler) {
        mLogger = logger;
        mHandler = handler;
    }

    public synchronized void setId(String id) {
        mId = id;
    }

    public synchronized boolean add(Runnable r, Callback callback,long delay, Runnable cancel) {
        TaskDelay task = new TaskDelay(r, callback, delay, cancel);
        boolean result = mCommandQueue.add(task);

        if (result) {
            mLogger.d(TAG, String.format("id=%s add: index=%d", mLogger.sensitiveObject(mId), task.index));
            nextCommand();
        } else {
            mLogger.e(TAG, String.format("id=%s add error: could not enqueue task command", mLogger.sensitiveObject(mId)));
            return false;
        }
        return true;
    }

    /**
     * The current command has been completed, move to the next command in the queue (if any)
     */
    public synchronized void completedCommand(int status) {
        mLogger.v(TAG, String.format("id=%s completedCommand called", mLogger.sensitiveObject(mId)));

        cancelTimer();
        TaskDelay currentCommand = mCommandQueue.poll();
        if (currentCommand == null) {
            mLogger.e(TAG, String.format("id=%s completedCommand error: no task found", mLogger.sensitiveObject(mId)));
            return;
        }
        mLogger.d(TAG, String.format("id=%s completedCommand: index=%d", mLogger.sensitiveObject(mId), currentCommand.index));
        if (currentCommand.callback != null) {
            mLogger.d(TAG, String.format("id=%s completedCommand: callback for index=%d", mLogger.sensitiveObject(mId), currentCommand.index));
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
        mLogger.v(TAG, String.format("id=%s retryCommand called", mLogger.sensitiveObject(mId)));

        mCommandQueueBusy = false;
        TaskDelay currentCommand = mCommandQueue.peek();
        if (currentCommand != null) {
            if (mNrTries >= MAX_TRIES) {
                // Max retries reached, give up on this one and proceed
                mLogger.d(TAG, String.format("id=%s retryCommand: max number of tries reached, not retrying operation anymore", mLogger.sensitiveObject(mId)));
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
            mLogger.e(TAG, String.format("id=%s startTimer error: no task found", mLogger.sensitiveObject(mId)));
            return;
        }
        mLogger.v(TAG, String.format("id=%s startTimer called: index=%s", mLogger.sensitiveObject(mId), bluetoothCommand.index));

        cancelTimer();
        mTimeoutRunnable = () -> onCommandTimeout(bluetoothCommand);

        mHandler.postDelayed(mTimeoutRunnable, TIMEOUT);
    }

    private void onCommandTimeout(TaskDelay bluetoothCommand) {
        synchronized (this) {
            // the command may have been completed or cleared since the timer was posted
            if (mCommandQueue.peek() != bluetoothCommand) {
                return;
            }
            mLogger.d(TAG, String.format("BleQueue id=%s startTimer: cancel runnable: index=%s", mLogger.sensitiveObject(mId), bluetoothCommand.index));

            mCommandQueue.poll();
            mIsRetrying = false;
            mCommandQueueBusy = false;
            mTimeoutRunnable = null;
        }

        // Run outside of the lock: the cancel runnable (usually disconnect()) takes other locks
        // and may clear this queue.
        bluetoothCommand.cancel.run();
        // Release the caller waiting for this command, otherwise it waits forever.
        failCallback(bluetoothCommand);
        nextCommand();
    }

    // Report a failure to the callback of a command that will never be completed.
    // The callback is run directly instead of being posted: the handler's looper may already be
    // stopped (driver stopping), and the callbacks only release a latch.
    private void failCallback(TaskDelay command) {
        if (command.callback != null) {
            mLogger.d(TAG, String.format("id=%s failCallback: index=%d", mLogger.sensitiveObject(mId), command.index));
            command.callback.run(STATUS_FAILURE);
        }
    }

    private void cancelTimer() {
        mLogger.v(TAG, String.format("id=%s cancelTimer called", mLogger.sensitiveObject(mId)));
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
        mLogger.v(TAG, String.format("id=%s nextCommand called", mLogger.sensitiveObject(mId)));

        // If there is still a command being executed, then bail out
        if (mCommandQueueBusy) {
            mLogger.d(TAG, String.format("id=%s nextCommand: another command is running, cancel", mLogger.sensitiveObject(mId)));
            return;
        }

        // Check if there is something to do at all
        final TaskDelay bluetoothCommand = mCommandQueue.peek();
        if (bluetoothCommand == null) {
            mLogger.v(TAG, String.format("id=%s nextCommand: no next command", mLogger.sensitiveObject(mId)));
            return;
        }

        mLogger.d(TAG, String.format("id=%s nextCommand: running index=%d", mLogger.sensitiveObject(mId), bluetoothCommand.index));

        // Execute the next command in the queue
        mCommandQueueBusy = true;
        if (!mIsRetrying) {
            mNrTries = 0;
        }
        mHandler.postDelayed(() -> {
            synchronized (this) {
                // the queue may have been cleared while this command was waiting for its delay
                if (mCommandQueue.peek() != bluetoothCommand) {
                    return;
                }
                startTimer();
            }
            try {
                bluetoothCommand.task.run();
            } catch (Exception e) {
                mLogger.e(TAG, String.format("id=%s nextCommand: command exception", mLogger.sensitiveObject(mId)), e);
                completedCommand(1);
            }
        }, bluetoothCommand.delay);
    }

    // Drop all the pending commands. Their callbacks are called with a failure status so that
    // the threads waiting for them are released.
    public void clear() {
        List<TaskDelay> dropped = new ArrayList<>();
        synchronized (this) {
            cancelTimer();
            TaskDelay command;
            while ((command = mCommandQueue.poll()) != null) {
                dropped.add(command);
            }
            mCommandQueueBusy = false;
            mIsRetrying = false;
        }

        for (TaskDelay command : dropped) {
            failCallback(command);
        }
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
