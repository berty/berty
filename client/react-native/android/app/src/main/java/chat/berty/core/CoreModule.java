package chat.berty.core;

import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import chat.berty.ble.Manager;
import core.Core;
import core.MobileNotification;
import core.NativeNotificationDriver;

public class CoreModule extends ReactContextBaseJavaModule {
    private Logger logger = new Logger("chat.berty.io");
    private MobileNotification notificationDriver = Core.getNativeNotificationDriver();
    private String filesDir = "";
    private ReactApplicationContext reactContext;

    public CoreModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.filesDir = reactContext.getFilesDir().getAbsolutePath();
        this.reactContext = reactContext;

        Object o = new Manager.ActivityGetter() {
            public Activity getCurrentActivity() {
                return reactContext.getCurrentActivity();
            }
        };

        Manager.getInstance().setmReactContext(o, reactContext);

        this.notificationDriver.setNativeNotificationDriver(new Notification(reactContext, this.notificationDriver));
    }

    public String getName() {
        return "CoreModule";
    }

    @ReactMethod
    public void listAccounts(Promise promise) {
        try {
            String data = Core.listAccounts(this.filesDir);
            promise.resolve(data);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to list accounts: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void initialize(Promise promise) {
        try {
            Core.initialize(this.logger, this.filesDir);
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
                .withDatastorePath(this.filesDir)
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
            Core.dropDatabase(this.filesDir);
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
}
