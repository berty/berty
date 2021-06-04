package tech.berty.gobridge.bledriver;

import android.util.Log;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

// Vastly inspired from https://medium.com/@martijn.van.welie/making-android-ble-work-part-1-a736dcd53b02
// Github repo: https://github.com/weliem/blessed-android
public class BleQueue {
    private static final String TAG = "bty.ble.BleQueue";

    // Maximum number of retries of commands
    private static final int MAX_TRIES = 3;

    private final Queue<TaskDelay> mCommandQueue = new ConcurrentLinkedQueue<>();

    private boolean mCommandQueueBusy = false;
    private boolean mIsRetrying = false;
    private int mNrTries = 0;

    private int mIndex = 0;

    private class TaskDelay {
        private final Runnable task;
        private final long delay;
        private final int index;

        public TaskDelay(Runnable t, long d) {
            task = t;
            delay = d;
            index = mIndex++;
        }
    }

    public synchronized boolean add(Runnable r, long delay) {
        TaskDelay task = new TaskDelay(r, delay);
        boolean result = mCommandQueue.add(task);

        if (result) {
            Log.d(TAG, String.format("add: index=%d", task.index));
            nextCommand();
        } else {
            Log.e(TAG, "could not enqueue task command");
            return false;
        }
        return true;
    }

    /**
     * The current command has been completed, move to the next command in the queue (if any)
     */
    public synchronized void completedCommand() {
        Log.v(TAG, "completedCommand called");

        TaskDelay currentCommand = mCommandQueue.poll();
        if (currentCommand == null) {
            Log.e(TAG, "completedCommand error: no task found");
            return ;
        }
        Log.d(TAG, String.format("completedCommand: index=%d", currentCommand.index));
        mIsRetrying = false;
        mCommandQueueBusy = false;
        nextCommand();
    }

    /**
     * Retry the current command. Typically used when a read/write fails and triggers a bonding procedure
     */
    public synchronized void retryCommand() {
        // TODO: to implement in driver
        Log.v(TAG, "retryCommand called");

        mCommandQueueBusy = false;
        TaskDelay currentCommand = mCommandQueue.peek();
        if (currentCommand != null) {
            if (mNrTries >= MAX_TRIES) {
                // Max retries reached, give up on this one and proceed
                Log.d(TAG, "max number of tries reached, not retrying operation anymore");
                mCommandQueue.poll();
            } else {
                mIsRetrying = true;
            }
        }
        nextCommand();
    }

    /**
     * Execute the next command in the subscribe queue.
     * A queue is used because the calls have to be executed sequentially.
     * If the read or write fails, the next command in the queue is executed.
     */
    public synchronized void nextCommand() {
        Log.v(TAG, "nextCommand called");

        // If there is still a command being executed, then bail out
        if (mCommandQueueBusy) {
            Log.d(TAG, "nextCommand: another command is running, cancel");
            return;
        }

        // Check if there is something to do at all
        final TaskDelay bluetoothCommand = mCommandQueue.peek();
        if (bluetoothCommand == null) return;

        Log.d(TAG, String.format("nextCommand: running index=%d", bluetoothCommand.index));

        // Execute the next command in the queue
        mCommandQueueBusy = true;
        if (!mIsRetrying) {
            mNrTries = 0;
        }
        BleDriver.mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    bluetoothCommand.task.run();
                } catch (Exception e) {
                    Log.e(TAG, "nextCommand: command exception", e);
                    completedCommand();
                }
            }
        }, bluetoothCommand.delay);
    }

    public synchronized void clear() {
        mCommandQueue.clear();
        mCommandQueueBusy = false;
    }
}
