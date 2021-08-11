package tech.berty.notification;

import android.app.Notification;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import bertybridge.Bertybridge;
import bertybridge.DecryptedPush;
import tech.berty.android.MainActivity;
import tech.berty.android.MainApplication;
import tech.berty.gobridge.GoBridgeModule;

import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class NotificationService extends FirebaseMessagingService {
    private static final String TAG = "NotificationService";

    // @FIXME: set this to protected
    public static Task<String> getMessagingToken() {
        return FirebaseMessaging.getInstance().getToken();
    }

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

        // Create Notification according to builder pattern
        Notification notification = new NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID_MESSAGE)
            .setContentTitle(dpush.getTitle())
            .setContentText(dpush.getMessage())
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .build();

        // Send notification
        notificationHelper.getManager().notify(1001, notification);
    }

    private void createReactNativeEvent(DecryptedPush dpush) {
        MainApplication application = (MainApplication) this.getApplication();

        // get react context
        ReactContext reactContext = application
            .getReactNativeHost()
            .getReactInstanceManager()
            .getCurrentReactContext();

        // build params
        Map<String, String> params = new HashMap<>();

        // @SYNC(gfanton): sync params event with ios
        params.put("title", dpush.getTitle());
        params.put("message", dpush.getMessage());

        NotificationModule.sendEvent(reactContext, params);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        File rootDir = new File(getFilesDir().getAbsolutePath() + "/" + GoBridgeModule.bertyFolder);

        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());

            String data = remoteMessage.getData().get("data");
            if (data != null) {
                try {
                    DecryptedPush decryptedPush = Bertybridge.handleNotification(rootDir.toString(), data);
                    Log.d(TAG, "NotifAppState"+MainActivity.getAppState().toString());
                    if (MainActivity.getAppState() == MainActivity.AppState.Foreground) {
                        // send an event to the front when app is in foreground
                        this.createReactNativeEvent(decryptedPush);
                    } else {
                        // create a native push notification when app is in background
                        this.createPushNotification(decryptedPush);
                    }
                } catch (Exception e) {
                    Log.d(TAG, "Decrypt push error: " + e.toString());
                    return;
                }
            }
        }
    }
}
