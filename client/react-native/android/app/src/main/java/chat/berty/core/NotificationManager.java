package chat.berty.core;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.gson.Gson;

import java.util.Map;

import core.Core;
import core.MobileNotification;
import core.NativeNotification;

public class NotificationManager extends FirebaseMessagingService implements ActivityEventListener, NativeNotification {
    public String TAG = "NotificationManager";

    private ReactApplicationContext reactContext;

    private Context context;

    private MobileNotification notificationDriver = Core.getNotificationDriver();

    private android.app.NotificationManager notificationManager;

    @SuppressLint("ServiceCast")
    NotificationManager(ReactApplicationContext reactContext) {
        super();
        reactContext.addActivityEventListener(this);
        this.reactContext = reactContext;
        this.context = reactContext.getApplicationContext();
        this.notificationManager = (android.app.NotificationManager) this.context.getSystemService(Context.NOTIFICATION_SERVICE);
        this.notificationDriver.setNativeNotification(this);

    }

    public void displayNotification(String title, String body, String icon, String sound, String url) throws Exception {
        new DisplayNotification(context, reactContext, notificationManager, title, body, icon, sound, url).execute();
    }

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> map = remoteMessage.getData();
        String data = new Gson().toJson(map);
        this.notificationDriver.receiveNotification(data);
    }

    /**
     * Called if InstanceID token is updated. This may occur if the security of
     * the previous token had been compromised. Note that this is called when the InstanceID token
     * is initially generated so this is where you would retrieve the token.
     */
    @Override
    public void onNewToken(String token) {
        this.notificationDriver.receivePushID(token, "fcm");
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
        Log.e(TAG, "123");
    }

    /**
     * Called when a new intent is passed to the activity
     *
     * @param intent
     */
    @Override
    public void onNewIntent(Intent intent) {
        WritableMap notificationOpenMap = toNotificationOpenMap(intent);

        ReactApplication reactApplication = (ReactApplication) context.getApplicationContext();
        ReactContext reactContext = reactApplication
                .getReactNativeHost()
                .getReactInstanceManager()
                .getCurrentReactContext();

        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("url", notificationOpenMap);
    }
}
