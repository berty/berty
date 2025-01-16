package tech.berty.bertybridgeexpo.rootdir;

import android.content.Context;

import androidx.annotation.NonNull;

import java.io.File;

public class RootDirModule {
    private final Context reactContext;
    private final static String bertyFolder = "berty";

    public RootDirModule(Context reactContext) {
        this.reactContext = reactContext;
    }

    public String getRootDir() {
        String rootDir = reactContext.getNoBackupFilesDir().getAbsolutePath();
        return new File(rootDir + "/" + bertyFolder).getAbsolutePath();
    }

    @NonNull
    public String getName() {
        return "RootDir";
    }
}

