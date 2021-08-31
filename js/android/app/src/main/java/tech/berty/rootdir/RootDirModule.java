package tech.berty.rootdir;

import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class RootDirModule extends ReactContextBaseJavaModule {
    private final static String bertyFolder = "berty";

    public RootDirModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public String getRootDir() {
        String rootDir = getReactApplicationContext().getNoBackupFilesDir().getAbsolutePath();
        return new File(rootDir + "/" + bertyFolder).getAbsolutePath();
    }

    @NonNull
    @Override
    public String getName() {
        return "RootDir";
    }

    @ReactMethod
    public void get(Promise promise) {
        promise.resolve(getRootDir());
    }
}

