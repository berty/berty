package chat.berty.core.notification;

import com.facebook.react.bridge.BaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nullable;

import android.app.Activity;

public class NotificationModule extends BaseJavaModule {

    static private NotificationModule singleton = null;

    private final ReactApplicationContext mReactApplicationContext;

    private NotificationModule(ReactApplicationContext reactContext) {
        NotificationModule.singleton = this;
        mReactApplicationContext = reactContext;
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from javascript.
     */
    @Override
    public String getName() {
        return "NotificationModule";
    }

    /**
     * Package classes can access this instance
     */
    static protected final NotificationModule getInstance() {
        return singleton;
    }

    /**
     * Permit to instanciate NotificationModule singleton
     */
    static public final NotificationModule getInstance(ReactApplicationContext reactContext) {
        if (singleton == null) {
            singleton = new NotificationModule(reactContext);
        }
        return singleton;
    }
    /**
     * Know if class has been instanciated
     */
    static public final boolean isInstantiated() {
        return singleton != null;
    }

    /**
     * Subclasses and package classes can use this method to access catalyst context passed as a constructor
     */
    protected final ReactApplicationContext getReactApplicationContext() {
        return mReactApplicationContext;
    }

    /**
     * Get the activity to which this context is currently attached, or {@code null} if not attached.
     *
     * DO NOT HOLD LONG-LIVED REFERENCES TO THE OBJECT RETURNED BY THIS METHOD, AS THIS WILL CAUSE
     * MEMORY LEAKS.
     *
     * For example, never store the value returned by this method in a member variable. Instead, call
     * this method whenever you actually need the Activity and make sure to check for {@code null}.
     */
    protected @Nullable final Activity getCurrentActivity() {
        return mReactApplicationContext.getCurrentActivity();
    }

    @ReactMethod
    public final void display(String title, String body, String icon, String sound, String url, long badge) {
        new NotificationDisplay(title, body, icon, sound, url, badge).execute();
    }
}
