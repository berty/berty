package tech.berty.notification;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.FormatedPush;
import bertybridge.PushConfig;
import bertybridge.PushStandalone;
import tech.berty.android.MainActivity;
import tech.berty.android.MainApplication;
import tech.berty.gobridge.GoBridgeModule;
import tech.berty.gobridge.KeystoreDriver;
import tech.berty.gobridge.LoggerDriver;
import tech.berty.rootdir.RootDirModule;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.HashMap;
import java.util.Map;

public class NotificationService extends FirebaseMessagingService {
    private static final String TAG = "NotificationService";
    private final static LoggerDriver logger = new LoggerDriver("tech.berty.notif", "gomobile");
    private PushStandalone push;

    public static Task<String> getToken() {
        return FirebaseMessaging.getInstance().getToken();
    }

    public NotificationService() {
        super();

        String tags;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            tags = Resources.getSystem().getConfiguration().getLocales().toLanguageTags();
        } else {
            tags = Resources.getSystem().getConfiguration().locale.toLanguageTag();
        }

        PushConfig config = new PushConfig();
        config.setPreferredLanguages(tags);
        config.setDriverLogger(logger);
        this.push = new PushStandalone(config);
        Log.d(TAG, "NotificationService created");
    }


    @Override
    public void onNewToken(@NonNull String s) {
        super.onNewToken(s);
    }

    private void createPushNotification(FormatedPush fpush) {
        Log.d(TAG, "createPushNotification called");
        NotificationHelper notificationHelper = new NotificationHelper(getBaseContext());

        // Create deepLink on click interaction
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        String deeplink = fpush.getDeepLink();
        if (deeplink != "") {
            intent.setData(Uri.parse(deeplink));
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT);

        // Create Notification according to builder pattern
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID_MESSAGE)
            .setContentTitle(fpush.getTitle())
            .setContentText(fpush.getBody())
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        String subtitle = fpush.getSubtitle();
        if (subtitle != "") {
            builder.setSubText(subtitle);
        }

        // Send notification
        notificationHelper.getManager().notify(1001, builder.build());
    }

    private void createReactNativeEvent(String push) {
        Log.d(TAG, "handle foreground push");
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
        Log.d(TAG, "receiving remote message");

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload");

            String data = remoteMessage.getData().get(Bertybridge.ServicePushPayloadKey);
            if (data != null) {
                try {
                    if (MainActivity.getAppState() == MainActivity.AppState.Foreground) {
                        // send an event to the front when app is in foreground
                        this.createReactNativeEvent(data);
                        return;
                    }

                    KeystoreDriver keystore = new KeystoreDriver(getApplicationContext());
                    FormatedPush format;
                    Bridge bridge = GoBridgeModule.getBridgeMessenger();
                    if (bridge == null) {
                        // create a native push notification when app is in background
                        String rootDir = new RootDirModule(new ReactApplicationContext(getApplicationContext())).getRootDir();
                        format = this.push.decrypt(rootDir, data, keystore);
                    } else {
                        format = bridge.pushDecrypt(data);
                    }
                    this.createPushNotification(format);
                } catch (Exception e) {
                    Log.d(TAG, "Decrypt push error: " + e.toString());
                }
            }
        }
    }
}
