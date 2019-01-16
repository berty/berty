package chat.berty.core;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class NotificationModule extends ReactContextBaseJavaModule {
    private NotificationManager notificationManager;

    NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.notificationManager = new NotificationManager(reactContext);
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from javascript.
     */
    @Override
    public String getName() {
        return "NotificationModule";
    }
}
