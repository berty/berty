package chat.berty.core;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;

import core.Core;

public class CoreModule extends ReactContextBaseJavaModule {
    private Logger logger = new Logger("chat.berty.io");
    private String filesDir = "";
    private ReactApplicationContext reactContext;

    public CoreModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.filesDir = reactContext.getFilesDir().getAbsolutePath();
        this.reactContext = reactContext;
    }

    public String getName() {
        return "CoreModule";
    }

    @ReactMethod
    public void start(Promise promise) throws Exception {
        try {
            Core.start(this.filesDir, this.logger);
            promise.resolve(null);
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to start core: %s", err);
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getPort(Promise promise) throws Exception {
        try {
            Long data = Core.getPort();
            promise.resolve(data.toString());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, this.getName(), "Unable to get port :%s", err);
            promise.reject(err);
        }
    }
}
