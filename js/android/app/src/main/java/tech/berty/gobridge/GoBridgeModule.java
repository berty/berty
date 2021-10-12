package tech.berty.gobridge;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import java.io.File;

// go packages
import bertybridge.PromiseBlock;
import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.Config;
import tech.berty.gobridge.bledriver.BleInterface;

public class GoBridgeModule extends ReactContextBaseJavaModule {
  private final static String TAG = "GoBridge";
  private final ReactApplicationContext reactContext;
  private final static LoggerDriver rnlogger = new LoggerDriver("tech.berty", "react");
  private KeystoreDriver keystoreDriver;

  // protocol
  private static Bridge bridgeMessenger = null;
  private static File rootDir = null;
  private static File tempDir = null;

  public GoBridgeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.keystoreDriver = new KeystoreDriver(reactContext);
    rootDir = new File(reactContext.getFilesDir().getAbsolutePath() + "/berty");
    System.out.println("root dir: " + rootDir.getAbsolutePath());
    tempDir = new File(reactContext.getCacheDir().getAbsolutePath() + "/berty");
    System.out.println("temp dir: " + tempDir.getAbsolutePath());
  }

  @Override
  public String getName() {
    return "GoBridge";
  }

  @ReactMethod
  public void clearStorage(Promise promise) {
    try {
      if (rootDir != null && rootDir.exists()) {
        if (!deleteRecursive(rootDir)) {
          throw new Exception("can't delete rootDir");
        }
      }
      if (tempDir != null && tempDir.exists()) {
        if (!deleteRecursive(tempDir)) {
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
  public void initBridge(Promise promise) {
    try {
      if (bridgeMessenger != null) {
        promise.resolve(false);
        return;
      }

      final Config config = Bertybridge.newConfig();
      if (config == null) {
        throw new Exception("");
      }

      // init logger
      LoggerDriver logger = new LoggerDriver("tech.berty", "protocol");
      config.setLoggerDriver(logger);

      // set root dir
      Log.i(TAG, "root dir: " + rootDir.getAbsolutePath());
      config.setRootDir(rootDir.getAbsolutePath());

      // set temp dir
      if (tempDir != null && !tempDir.exists()) {
        if (!tempDir.mkdirs()) {
          throw new Exception("tempdir directory creation failed");
        }
      }
      config.setAndroidCacheDir(tempDir.getAbsolutePath());

      // set ble driver
      BleInterface bleDriver = new BleInterface(reactContext);
      config.setBleDriver(bleDriver);

      // set NearBy driver
      BertyNearbyDriver NBDriver = new BertyNearbyDriver(reactContext);
      config.setNBDriver(NBDriver);

      // set native keystore driver
      config.setKeystoreDriver(this.keystoreDriver);

      System.out.println("bflifecycle: calling Bertybridge.newBridge");
      this.bridgeMessenger = Bertybridge.newBridge(config);
      System.out.println("bflifecycle: done Bertybridge.newBridge");
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void closeBridge(Promise promise) {
    try {
      if (bridgeMessenger != null) {
        System.out.println("bflifecycle: calling bridgeMessenger.close()");
        bridgeMessenger.close();
        System.out.println("bflifecycle: done bridgeMessenger.close()");
        bridgeMessenger = null;
      }
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void invokeBridgeMethod(String method, String b64message, Promise promise) {
    try {
      if (bridgeMessenger == null) {
        throw new Exception("bridge not started");
      }

      PromiseBlock promiseBlock = new JavaPromiseBlock(promise);
      bridgeMessenger.invokeBridgeMethodWithPromiseBlock(promiseBlock, method, b64message);
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


  @ReactMethod
  public void getProtocolAddr(Promise promise) {
    try {
      if (bridgeMessenger == null) {
        throw new Exception("bridge not started");
      }
      promise.resolve(null);
    } catch (Exception err) {
      promise.reject(err);
    }
  }
}
