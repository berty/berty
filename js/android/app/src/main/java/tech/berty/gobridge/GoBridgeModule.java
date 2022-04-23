package tech.berty.gobridge;

import android.content.res.Resources;
import android.os.Build;
import android.os.LocaleList;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import java.io.File;
import java.util.Locale;

import tech.berty.android.BuildConfig;
import tech.berty.rootdir.RootDirModule;

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
      try {
          this.keystoreDriver = new KeystoreDriver(reactContext);
      } catch (Exception e) {
          e.printStackTrace();
      }
      rootDir = new File(new RootDirModule(reactContext).getRootDir());
    tempDir = new File(reactContext.getCacheDir().getAbsolutePath() + "/berty");
  }

  public static Bridge getBridgeMessenger() {
    return bridgeMessenger;
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
    if (!BuildConfig.DEBUG) {
        return;
    }

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

      if (this.keystoreDriver == null) {
          throw new Exception("keystoreDriver is not instantiated");
      }

      final Config config = Bertybridge.newConfig();
      if (config == null) {
        throw new Exception("");
      }

      // init logger

      if (BuildConfig.DEBUG) {
          LoggerDriver logger = new LoggerDriver("tech.berty", "protocol");
          config.setLoggerDriver(logger);
      }

      // set net driver
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
          NetDriver inet = new NetDriver();
          config.setNetDriver(inet);
      }

      // set mdns locker driver
      MDNSLockerDriver imdnslocker = new MDNSLockerDriver(reactContext);
      config.setMDNSLocker(imdnslocker);

      // load and set user preferred language
      String tags = null;
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
          tags = Resources.getSystem().getConfiguration().getLocales().toLanguageTags();
      } else {
          tags = Resources.getSystem().getConfiguration().locale.toLanguageTag();
      }
      config.setPreferredLanguages(tags);

      // set root dir
      config.setRootDir(rootDir.getAbsolutePath());

      // set temp dir
      if (tempDir != null && !tempDir.exists()) {
        if (!tempDir.mkdirs()) {
          throw new Exception("tempdir directory creation failed");
        }
      }
      config.setAndroidCacheDir(tempDir.getAbsolutePath());

      // set ble driver
      BleInterface bleDriver = new BleInterface(reactContext, true);
      config.setBleDriver(bleDriver);

      // set NearBy driver
      // BertyNearbyDriver NBDriver = new BertyNearbyDriver(reactContext);
      // config.setNBDriver(NBDriver);

      // set native keystore driver
      config.setKeystoreDriver(this.keystoreDriver);

      this.bridgeMessenger = Bertybridge.newBridge(config);
      promise.resolve(true);
    } catch (Exception err) {
      promise.reject(err);
    }
  }

  @ReactMethod
  public void closeBridge(Promise promise) {
    try {
      if (bridgeMessenger != null) {
        bridgeMessenger.close();
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

  @Override
  public void finalize() {
    try {
        GoBridgeModule.bridgeMessenger.close();
    } catch (Exception e) {
        Log.i(TAG, "bridge close error", e);
    }

    GoBridgeModule.bridgeMessenger = null;
  }
}
