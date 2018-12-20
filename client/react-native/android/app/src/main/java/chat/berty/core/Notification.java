package chat.berty.core;

import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import chat.berty.ble.Manager;
import chat.berty.main.R;
import core.Core;

public class Notification implements core.NativeNotification {
    private ReactApplicationContext reactContext;
    private static final String CHANNEL_ID = "berty-chat-android-notification-id";
    private static final String CHANNEL_NAME = "berty.chat.android.core.notification.name";
    private static final String CHANNEL_DESCRIPTION = "berty.chat.android.core.notification.description";

    public Notification(final ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.createNotificationChannel();
    }

    @Override
    public void displayNativeNotification(String title, String body, String icon, String sound) throws Exception {
        NotificationManager notificationManager = (NotificationManager)this.reactContext.getSystemService(Context.NOTIFICATION_SERVICE);

        Intent intent = new Intent(this.reactContext, Notification.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(this.reactContext, 0, intent, 0);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            // .setLargeIcon(largeIconBitmap)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setVibrate(new long[]{0, 1000})
            .setContentIntent(pendingIntent);

        notificationManager.notify(10, mBuilder.build());
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription(CHANNEL_DESCRIPTION);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = (NotificationManager)this.reactContext.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
