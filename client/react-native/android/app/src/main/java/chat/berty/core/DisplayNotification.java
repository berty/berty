package chat.berty.core;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;

import java.lang.ref.WeakReference;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

import chat.berty.main.MainActivity;
import chat.berty.main.R;

public class DisplayNotification extends AsyncTask {
    private static final String TAG = "DisplayNotification";
    private static final String CHANNEL_ID = "berty-chat-android-notification-id";
    private static final String CHANNEL_NAME = "berty.chat.android.core.notification.name";
    private static final String CHANNEL_DESCRIPTION = "berty.chat.android.core.notification.description";

    private final WeakReference<Context> contextWeakReference;
    private final WeakReference<ReactApplicationContext> reactContextWeakReference;

    private final android.app.NotificationManager notificationManager;

    private final String title;

    /**
     * <p>Runs on the UI thread after {@link #doInBackground}. The
     * specified result is the value returned by {@link #doInBackground}.</p>
     *
     * <p>This method won't be invoked if the task was cancelled.</p>
     *
     * @param o The result of the operation computed by {@link #doInBackground}.
     * @see #onPreExecute
     * @see #doInBackground
     * @see #onCancelled(Object)
     */
    @Override
    protected void onPostExecute(Object o) {
        contextWeakReference.clear();
        reactContextWeakReference.clear();
        super.onPostExecute(o);
    }

    private final String body;
    private final String icon;
    private final String url;
    private final String sound;

    DisplayNotification(Context context, ReactApplicationContext reactContext, android.app.NotificationManager notificationManager,
                        String title, String body, String icon, String sound, String url) {
        this.contextWeakReference = new WeakReference<>(context);
        this.reactContextWeakReference = new WeakReference<>(reactContext);
        this.notificationManager = notificationManager;
        this.title = title;
        this.body = body;
        this.icon = icon;
        this.sound = sound;
        this.url = url;
    }


    /**
     * Override this method to perform a computation on a background thread. The
     * specified parameters are the parameters passed to {@link #execute}
     * by the caller of this task.
     * <p>
     * This method can call {@link #publishProgress} to publish updates
     * on the UI thread.
     *
     * @param objects The parameters of the task.
     * @return A result, defined by the subclass of this task.
     * @see #onPreExecute()
     * @see #onPostExecute
     * @see #publishProgress
     */
    @Override
    protected Object doInBackground(Object[] objects) {
        Context context = contextWeakReference.get();
        if (context == null) return null;


        int m =  new Random().nextInt(6) + 5;
        String notificationID = Integer.toString(m);
        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("url", url);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                notificationID.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT
        );

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setVibrate(new long[]{0, 1000})
                .setContentIntent(pendingIntent);

        notificationManager.notify(m, mBuilder.build());
        return null;
    }
}
