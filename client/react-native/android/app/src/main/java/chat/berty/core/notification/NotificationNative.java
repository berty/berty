package chat.berty.core.notification;

import android.Manifest;
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

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.gson.Gson;

import java.util.Map;

import chat.berty.core.Level;
import chat.berty.core.Logger;
import chat.berty.main.BuildConfig;
import chat.berty.main.R;
import core.Core;
import core.MobileNotification;
import core.NativeNotificationDriver;

public class NotificationNative implements NativeNotificationDriver {
    public static int PERMISSION_CODE = 200;
    private Logger logger = new Logger("chat.berty.io");

    private static final String CHANNEL_ID = "berty-chat-android-notification-id";
    private static final String CHANNEL_NAME = "berty.chat.android.core.notification.name";
    private static final String CHANNEL_DESCRIPTION = "berty.chat.android.core.notification.description";

    private static MobileNotification gomobile = Core.getNotificationDriver();

    public void display(String title, String body, String icon, String sound, String url) throws Exception {
        new NotificationDisplay(title, body, icon, sound, url).execute();
    }

    public void refreshToken() throws Exception {
            FirebaseInstanceId.getInstance().deleteToken(BuildConfig.APPLICATION_ID, "GCM");
            FirebaseInstanceId.getInstance().deleteInstanceId();
            FirebaseInstanceId.getInstance().getInstanceId();
            FirebaseInstanceId.getInstance().getToken(BuildConfig.APPLICATION_ID, "GCM");
    }

    public void askPermissions() {
        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();

        if (ContextCompat.checkSelfPermission(context.getCurrentActivity(), Manifest.permission.ACCESS_NOTIFICATION_POLICY) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    context.getCurrentActivity(),
                    new String[]{Manifest.permission.ACCESS_NOTIFICATION_POLICY},
                    PERMISSION_CODE);
        }
    }

    public void register() throws Exception {
        this.askPermissions();
        FirebaseInstanceId.getInstance().getInstanceId();
        FirebaseInstanceId.getInstance().getToken(BuildConfig.APPLICATION_ID, "GCM");
    }

    public void unregister() throws Exception {
        FirebaseInstanceId.getInstance().deleteToken(BuildConfig.APPLICATION_ID, "GCM");
        FirebaseInstanceId.getInstance().deleteInstanceId();
        gomobile.receiveFCMToken(null);
    }
}


