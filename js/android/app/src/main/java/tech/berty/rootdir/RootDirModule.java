package tech.berty.rootdir;

import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

// @SYNC(gfanton): sync module name with ios
public class RootDirModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RootDirModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    // @SYNC(gfanton): sync module name with ios
    @NonNull
    @Override
    public String getName() {
        return "RootDirModule";
    }

    // @SYNC(gfanton): sync method name with ios
    @ReactMethod
    public void getRootDir(Promise promise) {
        String rootDir = this.reactContext.getFilesDir().getAbsolutePath();
        promise.resolve(rootDir);
    }
}

