package tech.berty.gobridge;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;

import java.io.File;


// go packages
import bertybridge.Bertybridge;

public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final String inMemoryDir = ":memory:";
    private final ReactApplicationContext reactContext;

    public GoBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "GoBridge";
    }

    private static String[] readableArrayToStringArray(ReadableArray readableArray) {
        String[] arr = new String[readableArray.size()];
        for (int i = 0; i < readableArray.size(); i++) {
            arr[i] = readableArray.getString(i);
        }

        return arr;
    }

}
