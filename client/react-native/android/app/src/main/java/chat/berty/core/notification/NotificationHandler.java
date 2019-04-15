package chat.berty.core.notification;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.gson.Gson;

import java.util.Map;

import chat.berty.core.Level;
import chat.berty.core.Logger;
import core.Core;
import core.MobileNotification;

public class NotificationHandler extends FirebaseMessagingService implements ActivityEventListener {
    private Logger logger = new Logger("chat.berty.io");

    public String TAG = "NotificationHandler";

    private MobileNotification notificationDriver = Core.getNotificationDriver();

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> map = remoteMessage.getData();
        String data = new Gson().toJson(map);
        try {
            Core.setStoragePath(getApplicationContext().getFilesDir().getAbsolutePath());
            this.notificationDriver.receive(data);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, TAG, "cannot get storage path: %s", err);
        }
    }

    /**
     * Called if InstanceID token is updated. This may occur if the security of
     * the previous token had been compromised. Note that this is called when the InstanceID token
     * is initially generated so this is where you would retrieve the token.
     */
    @Override
    public void onNewToken(String token) {
        this.notificationDriver.receiveFCMToken(token.getBytes());
    }

    static WritableMap toNotificationOpenMap(Intent intent) {
        Bundle extras = intent.getExtras();
        WritableMap notificationMap = Arguments.makeNativeMap(extras.getBundle("notification"));
        WritableMap notificationOpenMap = Arguments.createMap();
        notificationOpenMap.putString("action", extras.getString("action"));
        notificationOpenMap.putString("url", extras.getString("url"));
        notificationOpenMap.putMap("notification", notificationMap);

        Bundle extrasBundle = extras.getBundle("results");
        if (extrasBundle != null) {
            WritableMap results = Arguments.makeNativeMap(extrasBundle);
            notificationOpenMap.putMap("results", results);
        }

        return notificationOpenMap;
    }

    /**
     * Called when host (activity/service) receives an {@link Activity#onActivityResult} call.
     *
     * @param activity
     * @param requestCode
     * @param resultCode
     * @param data
     */
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        // Log.e(TAG, "123");
    }

    /**
     * Called when a new intent is passed to the activity
     *
     * @param intent
     */
    @Override
    public void onNewIntent(Intent intent) {
        if (!NotificationModule.isInstantiated()) { return; }

        ReactApplicationContext context = NotificationModule.getInstance().getReactApplicationContext();

        WritableMap notificationOpenMap = toNotificationOpenMap(intent);

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("url", notificationOpenMap);
    }
}
