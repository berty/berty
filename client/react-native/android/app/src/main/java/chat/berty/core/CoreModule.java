package chat.berty.core;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;

import chat.berty.core.notification.NotificationNative;
import core.Core;
import core.NativeBridge;
import core.MobileNotification;

import chat.berty.ble.BleManager;

public class CoreModule extends ReactContextBaseJavaModule {
    private Logger logger = new Logger("chat.berty.io");

    private ReactApplicationContext reactContext;
    private MobileNotification notificationDriver = Core.getNotificationDriver();
    private ConnectivityUpdateHandler connectivity;
    NativeBridge daemon = Core.newNativeBridge();

    public CoreModule(ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;
        String storagePath = reactContext.getFilesDir().getAbsolutePath();
        try {
            Core.getDeviceInfo().setStoragePath(storagePath);
        } catch (Exception error) {
            logger.format(Level.ERROR, this.getName(), error.getMessage());
        }
        this.notificationDriver.setNative(new NotificationNative());

        connectivity = new ConnectivityUpdateHandler(reactContext);

        // TODO: Get rid of this and make a proper react-native module that extends ReactContextBaseJavaModule
        // See https://facebook.github.io/react-native/docs/native-modules-android
        Object activityAndContextGetter = actGetter(reactContext);

        BleManager.setReactGetter(activityAndContextGetter, reactContext);

    }

    private Object actGetter(final ReactApplicationContext reactContext) {
        return new BleManager.ActivityAndContextGetter() {
            public Activity getCurrentActivity() {
                return reactContext.getCurrentActivity();
            }

            public Context getApplicationContext() {
                return reactContext.getApplicationContext();
            }
        };
    }
    /////////////////////////////////////////////////////////////////////////

    public String getName() {
        return "CoreModule";
    }

    @ReactMethod
    public void Invoke(String method, String message, Promise promise) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String data = daemon.invoke(method, message);
                    promise.resolve(data);
                } catch (Exception err) {
                    logger.format(Level.ERROR, getName(), "Invoke daemon failed: %s", err);
                    promise.reject(err);
                }
            }
        }).start();
    }

    @ReactMethod
    public void throwException() throws Exception {
        throw new Exception("thrown exception");
    }

    @ReactMethod
    public void openSettings() {
        Intent intent = new Intent();
        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", reactContext.getPackageName(), null);
        intent.setData(uri);
        reactContext.startActivity(intent);
    }
}
