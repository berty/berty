package tech.berty.bertybridgeexpo.notification;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.FormatedPush;
import bertybridge.PushConfig;
import bertybridge.PushStandalone;

import expo.modules.kotlin.Promise;
import expo.modules.kotlin.exception.CodedException;
import tech.berty.bertybridgeexpo.BertyBridgeExpoModule;
import tech.berty.bertybridgeexpo.gobridge.KeystoreDriver;
import tech.berty.bertybridgeexpo.rootdir.RootDirModule;
import tech.berty.bertybridgeexpo.gobridge.Logger;
import tech.berty.bertybridgeexpo.LifecycleListener;

import com.google.android.gms.tasks.OnCanceledListener;
import com.google.android.gms.tasks.OnCompleteListener;
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
    private final static String EVENT_ID = "onPushReceived";
    private final BertyBridgeExpoModule bertyBridge;
    private final PushStandalone push;

    public Task<String> getToken() {
        return FirebaseMessaging.getInstance().getToken();
    }

    public NotificationService(BertyBridgeExpoModule bertyBridge) {
        super();

        this.bertyBridge = bertyBridge;

        String tags;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            tags = Resources.getSystem().getConfiguration().getLocales().toLanguageTags();
        } else {
            tags = Resources.getSystem().getConfiguration().locale.toLanguageTag();
        }

        PushConfig config = new PushConfig();
        config.setPreferredLanguages(tags);
        this.push = new PushStandalone(config);
        Logger.d(TAG, "NotificationService created");
    }


    @Override
    public void onNewToken(@NonNull String s) {
        super.onNewToken(s);
    }

    private void createPushNotification(FormatedPush fpush) {
        Logger.d(TAG, "createPushNotification called");
        NotificationHelper notificationHelper = new NotificationHelper(getBaseContext());

        // Create deepLink on click interaction
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        String deeplink = fpush.getDeepLink();
        if (!deeplink.equals("")) {
            intent.setData(Uri.parse(deeplink));
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT|PendingIntent.FLAG_IMMUTABLE);

        // Create Notification according to builder pattern
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NotificationHelper.CHANNEL_ID_MESSAGE)
            .setContentTitle(fpush.getTitle())
            .setContentText(fpush.getBody())
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .setCategory(Notification.CATEGORY_MESSAGE)
            .setGroup(fpush.getConversationIdentifier())
            .setVibrate(new long[]{125L, 75L, 125L})
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        String subtitle = fpush.getSubtitle();
        if (!subtitle.equals("")) {
            builder.setSubText(subtitle);
        }

        // Send notification
        notificationHelper.getManager().notify((Long.valueOf(System.currentTimeMillis() % Integer.MAX_VALUE)).intValue(), builder.build());
    }

    private void createReactNativeEvent(String push) {
        Logger.d(TAG, "handle foreground push");

        // build params
        Map<String, String> params = new HashMap<>();

        // @SYNC(gfanton): sync params event with ios
        params.put("body", push);

        bertyBridge.sendEvent(EVENT_ID, params);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Logger.d(TAG, "receiving remote message");

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Logger.d(TAG, "Message data payload");

            String data = remoteMessage.getData().get(Bertybridge.ServicePushPayloadKey);
            if (data != null) {
                try {
                    if (LifecycleListener.Companion.isForeground()) {
                        // send an event to the front when app is in foreground
                        this.createReactNativeEvent(data);
                        return;
                    }

                    KeystoreDriver keystore = new KeystoreDriver(getApplicationContext());
                    FormatedPush format;
                    Bridge bridge = BertyBridgeExpoModule.Companion.getBridgeMessenger();
                    if (bridge == null) {
                        // create a native push notification when app is in background
                        String rootDir = new RootDirModule(bertyBridge.getReactContext()).getRootDir();
                        format = this.push.decrypt(rootDir, data, keystore);
                    } else {
                        format = bridge.pushDecrypt(data);
                    }
                    if (!format.getMuted()) {
                        this.createPushNotification(format);
                    }
                } catch (Exception e) {
                    Logger.d(TAG, "Decrypt push error: " + e);
                }
            }
        }
    }

    public void request(Promise promise) {
        getToken()
            .addOnCompleteListener(new OnCompleteListener() {
                @Override
                public void onComplete(@NonNull Task task) {
                    if (task.isSuccessful()) {
                        JSONObject json = new JSONObject();
                        String bundleID = bertyBridge.getReactContext().getPackageName();
                        String tokenB64 = Base64.encodeToString(((String) task.getResult()).getBytes(), Base64.NO_WRAP);

                        try {
                            json.put("bundleId", bundleID);
                            json.put("token", tokenB64);
                        } catch (JSONException e) {
                            promise.reject(new CodedException(e));
                            return;
                        }

                        promise.resolve(json.toString());
                    } else {
                        promise.reject(new CodedException(task.getException()));
                    }
                }
            })
            .addOnCanceledListener(new OnCanceledListener() {
                @Override
                public void onCanceled() {
                    promise.reject(new CodedException("NotificationError", "token request canceled", null));
                }
            });
    }
}
