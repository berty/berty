package tech.berty.notification;

import android.util.Log;

import bertybridge.Printer;

public class NotificationLogger implements Printer {
    private final static String TAG = "Notification";
    private final static NotificationLogger instance = new NotificationLogger();
    private NotificationLogger() {}

    public static NotificationLogger getInstance() { return instance; }

    @Override
    public void print(String s) {
        Log.i(TAG, s);
    }
}
