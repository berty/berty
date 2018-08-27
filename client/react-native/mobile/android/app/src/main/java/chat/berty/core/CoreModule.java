package chat.berty.core;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;

import core.Core;

public class CoreModule extends ReactContextBaseJavaModule {

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
    public void start(Promise promise) {
        try {
            Core.start(this.filesDir);
            promise.resolve(null);
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getPort(Promise promise) {
        try {
            Long port = Core.getPort();
            promise.resolve(port.toString());
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getUnixSockPath(Promise promise) {
        try {
            String unixSockPath = Core.getUnixSockPath();
            promise.resolve(unixSockPath.toString());
        } catch (Exception err) {
            promise.reject(err);
        }
    }
}
