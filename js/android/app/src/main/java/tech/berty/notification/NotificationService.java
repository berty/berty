package tech.berty.notification;

import android.app.Notification;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.DecryptedPush;
import tech.berty.android.MainActivity;
import tech.berty.android.MainApplication;
import tech.berty.gobridge.GoBridgeModule;
import tech.berty.gobridge.KeystoreDriver;
import tech.berty.rootdir.RootDirModule;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;

public class NotificationService extends FirebaseMessagingService {
    private static final String TAG = "NotificationService";

    public static Task<String> getToken() {
        return FirebaseMessaging.getInstance().getToken();
    }

    @Override
    public void onNewToken(@NonNull String s) {
        super.onNewToken(s);
        Log.d(TAG, "NEW TOKEN: " + s);
    }

    private void createPushNotification(DecryptedPush dpush) {
        NotificationHelper notificationHelper = new NotificationHelper(getBaseContext());

        String message = "you have a new message";
        try {
            JSONObject payloadAtts = new JSONObject(dpush.getPayloadAttrsJSON());
            message = payloadAtts.getString("message");
        } catch (JSONException e) {
            Log.w(TAG, "Unable to unmarshall json payload:", e);
        }

        // Create Notification according to builder pattern
        Notification notification = new NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID_MESSAGE)
            .setContentTitle(dpush.getMemberDisplayName())
            .setContentText(message)
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .build();

        // Send notification
        notificationHelper.getManager().notify(1001, notification);
    }

    private void createReactNativeEvent(String push) {
        MainApplication application = (MainApplication) this.getApplication();

        // get react context
        ReactContext reactContext = application
            .getReactNativeHost()
            .getReactInstanceManager()
            .getCurrentReactContext();

        // build params
        Map<String, String> params = new HashMap<>();

        // @SYNC(gfanton): sync params event with ios
        params.put("body", push);

        NotificationModule.sendEvent(reactContext, params);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());

            String data = remoteMessage.getData().get(Bertybridge.ServicePushPayloadKey);
            if (data != null) {
                try {
                    Log.d(TAG, "NotifAppState"+MainActivity.getAppState().toString());
                    if (MainActivity.getAppState() == MainActivity.AppState.Foreground) {
                        // send an event to the front when app is in foreground
                        this.createReactNativeEvent(data);
                    } else {
                        byte[] storageKey = new KeystoreDriver(getApplicationContext()).get(Bertybridge.StorageKeyName);
                        DecryptedPush decryptedPush;
                        Bridge bridge = GoBridgeModule.getBridgeMessenger();
                        if (bridge == null) {
                            // create a native push notification when app is in background
                            String rootDir = new RootDirModule(new ReactApplicationContext(getApplicationContext())).getRootDir();
                            decryptedPush = Bertybridge.pushDecryptStandaloneWithLogger(NotificationLogger.getInstance(), rootDir, data, storageKey);
                        } else {
                            decryptedPush = bridge.pushDecrypt(data);
                        }
                        this.createPushNotification(decryptedPush);
                    }
                } catch (Exception e) {
                    Log.d(TAG, "Decrypt push error: " + e.toString());
                }
            }
        }
    }
}
