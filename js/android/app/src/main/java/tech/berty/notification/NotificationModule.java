package tech.berty.notification;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.tasks.OnCanceledListener;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import org.json.JSONException;
import org.json.JSONObject;
import android.util.Base64;

import java.util.Map;

public class NotificationModule extends ReactContextBaseJavaModule {
    private final static String EVENT_ID = "onPushReceived";

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "PushTokenRequester";
    }

    public static void sendEvent(ReactContext reactContext, @NonNull Map<String, String> params) {
        WritableMap wmap = new WritableNativeMap();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            wmap.putString(entry.getKey(), entry.getValue());
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(EVENT_ID, wmap);
    }

    @ReactMethod
    public void request(Promise promise) {
        NotificationService.getToken()
            .addOnCompleteListener(new OnCompleteListener() {
                @Override
                public void onComplete(@NonNull Task task) {
                    if (task.isSuccessful()) {
                        JSONObject json = new JSONObject();
                        String bundleID = getReactApplicationContext().getPackageName();
                        String tokenB64 = Base64.encodeToString(((String) task.getResult()).getBytes(), Base64.NO_WRAP);

                        try {
                            json.put("bundleId", bundleID);
                            json.put("token", tokenB64);
                        } catch (JSONException e) {
                            promise.reject(e);
                            return;
                        }

                        promise.resolve(json.toString());
                    } else {
                        promise.reject(task.getException());
                    }
                }
            })
            .addOnCanceledListener(new OnCanceledListener() {
                @Override
                public void onCanceled() {
                    promise.reject(new Exception("token request canceled"));
                }
            });
    }
}
