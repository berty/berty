package tech.berty.gobridge;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;

import java.io.File;

// go packages
import bertybridge.PromiseBlock;
import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.Config;

public class GoBridgeModule extends ReactContextBaseJavaModule {
  private final static String TAG = "GoBridge";
  private final ReactApplicationContext reactContext;
  private final static LoggerDriver rnlogger = new LoggerDriver("tech.berty", "react");

  // protocol
  private static Bridge bridgeMessenger = null;
  private static File rootDir = null;
  private static File tempDir = null;

  public GoBridgeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.rootDir = new File(reactContext.getFilesDir().getAbsolutePath() + "/berty");
    System.out.println("root dir: " + this.rootDir.getAbsolutePath());
    this.tempDir = new File(reactContext.getCacheDir().getAbsolutePath() + "/berty");
    System.out.println("temp dir: " + this.tempDir.getAbsolutePath());
  }

  @Override
  public String getName() {
    return "GoBridge";
  }

  @ReactMethod
  public void clearStorage(Promise promise) {
    try {
      if (this.rootDir != null && this.rootDir.exists()) {
        if (!deleteRecursive(this.rootDir)) {
          throw new Exception("can't delete rootDir");
        }
      }
      if (this.tempDir != null && this.tempDir.exists()) {
        if (!deleteRecursive(this.tempDir)) {
          throw new Exception("can't delete tempDir");
        }
      }
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void log(ReadableMap opts) {
    if (opts.hasKey("message")) {
      String message = opts.getString("message");
      String type = opts.hasKey("level") ? opts.getString("level") : "info";

      // set log level
      LoggerLevel level;
      try {
        level = LoggerLevel.valueOf(type.toUpperCase());
      } catch (Exception e) {
        level = LoggerLevel.INFO;
      }

      // log
      GoBridgeModule.rnlogger.print(message, level, "react-native");
    }
  }

  //////////////
  // Protocol //
  //////////////

  @ReactMethod
  public void startProtocol(ReadableMap opts, Promise promise) {
    try {
      if (this.bridgeMessenger != null) {
        promise.resolve(false);
        return;
      }

      final boolean optPersistence = opts.hasKey("persistence") && opts.getBoolean("persistence");
      String[] optCLIArgs = {};
      if (opts.hasKey("cliArgs") && opts.getType("cliArgs") == ReadableType.Array) {
          optCLIArgs = readableArrayToStringArray(opts.getArray("cliArgs"));
      }

      final Config config = Bertybridge.newConfig();
      if (config == null) {
        throw new Exception("");
      }

      // init logger
      LoggerDriver logger = new LoggerDriver("tech.berty", "protocol");
      config.setLoggerDriver(logger);

      // pass js args
      for (String arg: optCLIArgs) {
          config.appendCLIArg(arg);
      }

      // set root dir
      if (optPersistence) {
        if (this.rootDir != null && !this.rootDir.exists()) {
            if (!this.rootDir.mkdirs()) {
                throw new Exception("rootdir directory creation failed");
            }
        }
        Log.i(TAG, "root dir: " + this.rootDir.getAbsolutePath());
        config.appendCLIArg("--store.dir");
        config.appendCLIArg(this.rootDir.getAbsolutePath());
      }

      // set temp dir
      if (this.tempDir != null && !this.tempDir.exists()) {
        if (!this.tempDir.mkdirs()) {
          throw new Exception("tempdir directory creation failed");
        }
      }
      config.setAndroidCacheDir(this.tempDir.getAbsolutePath());

      System.out.println("bflifecycle: calling Bertybridge.newBridge");
      this.bridgeMessenger = Bertybridge.newBridge(config);
      System.out.println("bflifecycle: done Bertybridge.newBridge");
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void stopProtocol(Promise promise) {
    try {
      if (this.bridgeMessenger != null) {
        System.out.println("bflifecycle: calling bridgeMessenger.close()");
        this.bridgeMessenger.close();
        System.out.println("bflifecycle: done bridgeMessenger.close()");
        this.bridgeMessenger = null;
      }
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void getProtocolAddr(Promise promise) {
    try {
      if (this.bridgeMessenger == null) {
        throw new Exception("bridge not started");
      }

      String addr = this.bridgeMessenger.grpcWebSocketListenerAddr();
      promise.resolve(addr);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void invokeBridgeMethod(String method, String b64message, Promise promise) {
    try {
      if (this.bridgeMessenger == null) {
        throw new Exception("bridge not started");
      }

      PromiseBlock promiseBlock = new JavaPromiseBlock(promise);
      this.bridgeMessenger.invokeBridgeMethodWithPromiseBlock(promiseBlock, method, b64message);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  private static String[] readableArrayToStringArray(ReadableArray readableArray) {
    String[] arr = new String[readableArray.size()];
    for (int i = 0; i < readableArray.size(); i++) {
      arr[i] = readableArray.getString(i);
    }

    return arr;
  }

  private static boolean deleteRecursive(File fileOrDirectory) {
    if (fileOrDirectory.isDirectory()) {
      for (File child : fileOrDirectory.listFiles()) {
        if (!deleteRecursive(child)) {
          return false;
        }
      }
    }
    return fileOrDirectory.delete();
  }
}
