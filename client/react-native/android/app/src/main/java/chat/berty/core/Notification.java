package chat.berty.core;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.firebase.FirebaseApp;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.gson.Gson;

import java.util.Map;

import chat.berty.main.R;
import core.Core;
import core.MobileNotification;
import core.NativeNotificationDriver;

public class Notification implements NativeNotificationDriver {
    public static int PERMISSION_CODE = 200;
    private Logger logger = new Logger("chat.berty.io");

    private ReactContext reactContext;

    private static final String CHANNEL_ID = "berty-chat-android-notification-id";
    private static final String CHANNEL_NAME = "berty.chat.android.core.notification.name";
    private static final String CHANNEL_DESCRIPTION = "berty.chat.android.core.notification.description";

    private static MobileNotification GoCore = Core.getNotificationDriver();

    public Notification(final ReactContext reactContext) {
        this.reactContext = reactContext;
    }

    public static class FCM extends FirebaseMessagingService {
        /**
         * Called when message is received.
         *s
         * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
         */
        @Override
        public void onMessageReceived(RemoteMessage remoteMessage) {
            Map<String, String> map = remoteMessage.getData();
            String data = new Gson().toJson(map);
            Notification.GoCore.receive(data);
        }

        /**
         * Called if InstanceID token is updated. This may occur if the security of
         * the previous token had been compromised. Note that this is called when the InstanceID token
         * is initially generated so this is where you would retrieve the token.
         */
        @Override
        public void onNewToken(String token) {
            Notification.GoCore.receiveToken(token.getBytes(), "fcm");
        }

    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription(CHANNEL_DESCRIPTION);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = (NotificationManager) this.reactContext.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public void display(String title, String body, String icon, String sound, String badge) throws Exception {
        NotificationManager notificationManager = (NotificationManager) this.reactContext.getSystemService(Context.NOTIFICATION_SERVICE);

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

    public void refreshToken() throws Exception {
        FirebaseInstanceId.getInstance().deleteInstanceId();
        FirebaseInstanceId.getInstance().getInstanceId();
    }

    public void askPermissions() {
        if (ContextCompat.checkSelfPermission(this.reactContext.getCurrentActivity(), Manifest.permission.ACCESS_NOTIFICATION_POLICY) == PackageManager.PERMISSION_GRANTED) {
            this.logger.format(Level.DEBUG, "GRANTED", "GRANTED");

            return;
        }

        this.logger.format(Level.DEBUG, "NOT_GRANTED", "NOT_GRANTED");

        ActivityCompat.requestPermissions(
                this.reactContext.getCurrentActivity(),
                new String[]{Manifest.permission.ACCESS_NOTIFICATION_POLICY},
                PERMISSION_CODE);
    }

    public void register() throws Exception {
        this.logger.format(Level.DEBUG, "REGISTER", "REGISTER");
        this.askPermissions();
        this.createNotificationChannel();
        FirebaseInstanceId.getInstance().getInstanceId();
    }

    public void unregister() throws Exception {
        FirebaseInstanceId.getInstance().deleteInstanceId();
    }


}


