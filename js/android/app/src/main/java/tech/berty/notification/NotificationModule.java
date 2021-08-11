package tech.berty.notification;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class NotificationModule extends ReactContextBaseJavaModule {
    // @SYNC(gfanton): sync event name with ios
    public final static String EVENT_ID = "NotificationModuleEvent";

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        // @SYNC(gfanton): sync module name with ios
        return "NotificationModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("NOTIFICATION_EVENT_ID", EVENT_ID);
        return constants;
    }

    public static void sendEvent(ReactContext reactContext, @NonNull Map<String, String> params) {
        WritableMap wmap = new WritableNativeMap();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            wmap.putString(entry.getKey(), entry.getValue());
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(EVENT_ID, wmap);
    }
}
