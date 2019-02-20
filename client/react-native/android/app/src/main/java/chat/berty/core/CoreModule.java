package chat.berty.core;

import android.app.Activity;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import chat.berty.core.notification.NotificationNative;
import core.Core;
import core.MobileNotification;

import chat.berty.ble.BleManager;

public class CoreModule extends ReactContextBaseJavaModule {
    private Logger logger = new Logger("chat.berty.io");

    private ReactApplicationContext reactContext;
    private MobileNotification notificationDriver = Core.getNotificationDriver();

    public CoreModule(ReactApplicationContext reactContext) {
        super(reactContext);

        String storagePath = reactContext.getFilesDir().getAbsolutePath();
        try {
            Core.getDeviceInfo().setStoragePath(storagePath);
        } catch (Exception error) {
            logger.format(Level.ERROR, this.getName(), error.getMessage());
        }
        this.notificationDriver.setNative(new NotificationNative());

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
    public void listAccounts(Promise promise) {
        try {
            String data = Core.listAccounts();
            promise.resolve(data);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to list accounts: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void initialize(Promise promise) {
        try {
            Core.initialize(this.logger, Core.getDeviceInfo().getStoragePath());
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to init core: %s", err);
            promise.reject(err);
        }
    }


    @ReactMethod
    public void start(String nickname, Promise promise) {
        try {
            core.MobileOptions coreOptions = new core.MobileOptions()
                    .withNickname(nickname)
                    .withLoggerDriver(this.logger);

            Core.start(coreOptions);
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to start core: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void restart(Promise promise) {
        try {
            Core.restart();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to restart core: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void panic(Promise promise) throws Exception {
        Core.panic();
        promise.resolve(null);
    }

    @ReactMethod
    public void throwException() throws Exception {
        throw new Exception("thrown exception");
    }

    @ReactMethod
    public void dropDatabase(Promise promise) {
        try {
            Core.dropDatabase();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to drop database: %s", err);
            promise.reject(err);
        }
    }


    @ReactMethod
    public void getPort(Promise promise) {
        try {
            Long data = Core.getPort();
            promise.resolve(data.toString());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to get port: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getNetworkConfig(Promise promise) {
        promise.resolve(Core.getNetworkConfig());
    }

    @ReactMethod
    public void updateNetworkConfig(String config, Promise promise) {
        try {
            Core.updateNetworkConfig(config);
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to update network config: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void isBotRunning(Promise promise) {
        promise.resolve(Core.isBotRunning());
    }

    @ReactMethod
    public void startBot(Promise promise) {
        try {
            Core.startBot();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to update start bot: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void stopBot(Promise promise) {
        try {
            Core.stopBot();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to update stop bot: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getLocalGRPCInfos(Promise promise) {
        promise.resolve(Core.getLocalGRPCInfos());
    }

    @ReactMethod
    public void startLocalGRPC(Promise promise) {
        try {
            Core.startLocalGRPC();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to update start local gRPC: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void stopLocalGRPC(Promise promise) {
        try {
            Core.stopLocalGRPC();
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to update stop local gRPC: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void setCurrentRoute(String route) {
        Core.getDeviceInfo().setAppRoute(route);
    }
}
