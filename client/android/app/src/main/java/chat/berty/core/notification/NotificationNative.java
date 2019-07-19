package chat.berty.core.notification;

import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;

import com.google.firebase.iid.FirebaseInstanceId;

import chat.berty.core.Logger;
import chat.berty.main.R;
import core.Core;
import core.MobileNotification;
import core.NativeNotificationDriver;

public class NotificationNative implements NativeNotificationDriver {
    public static int PERMISSION_CODE = 200;
    private Logger logger = new Logger("chat.berty.io");

    private static final String CHANNEL_ID = "berty-chat-wandroid-notification-id";
    private static final String CHANNEL_NAME = "berty.chat.android.core.notification.name";
    private static final String CHANNEL_DESCRIPTION = "berty.chat.android.core.notification.description";

    private static MobileNotification gomobile = Core.getNotificationDriver();

    public void display(String title, String body, String icon, String sound, String url) throws Exception {
        new NotificationDisplay(title, body, icon, sound, url).execute();
    }

    public void refreshToken() throws Exception {
        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();
        String authorizedEntity = context.getApplicationContext().getResources().getString(R.string.gcm_defaultSenderId);

            FirebaseInstanceId.getInstance().deleteToken(authorizedEntity, "FCM");
            FirebaseInstanceId.getInstance().deleteInstanceId();
            FirebaseInstanceId.getInstance().getInstanceId();
            FirebaseInstanceId.getInstance().getToken(authorizedEntity, "FCM");
    }

    public void askPermissions() {
        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();

        if (ContextCompat.checkSelfPermission(context.getCurrentActivity(), Manifest.permission.ACCESS_NOTIFICATION_POLICY) == PackageManager.PERMISSION_GRANTED) {
            return;
        }
        ActivityCompat.requestPermissions(
                context.getCurrentActivity(),
                new String[]{Manifest.permission.ACCESS_NOTIFICATION_POLICY},
                PERMISSION_CODE);
    }

    public void register() throws Exception {
        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();
        String authorizedEntity = context.getApplicationContext().getResources().getString(R.string.gcm_defaultSenderId);

        this.askPermissions();
        FirebaseInstanceId.getInstance().getInstanceId();
        String token = FirebaseInstanceId.getInstance().getToken(authorizedEntity, "FCM");
        gomobile.receiveFCMToken(token.getBytes());
    }

    public void unregister() throws Exception {
        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();
        String authorizedEntity = context.getApplicationContext().getResources().getString(R.string.gcm_defaultSenderId);

        FirebaseInstanceId.getInstance().deleteToken(authorizedEntity, "FCM");
        FirebaseInstanceId.getInstance().deleteInstanceId();
        gomobile.receiveFCMToken(null);
    }
}


