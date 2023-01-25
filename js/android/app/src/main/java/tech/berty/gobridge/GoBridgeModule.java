package tech.berty.gobridge;

import android.bluetooth.BluetoothAdapter;
import android.content.res.Resources;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import bertybridge.Bertybridge;
import bertybridge.Bridge;
import bertybridge.BridgeConfig;
import bertybridge.PromiseBlock;
import bertybridge.RemoteBridge;
import bertybridge.RemoteBridgeConfig;
import bertybridge.ServiceClient;
import tech.berty.android.BuildConfig;
import tech.berty.gobridge.bledriver.BleInterface;
import tech.berty.gobridge.Logger;
import tech.berty.rootdir.RootDirModule;

public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final static String TAG = "GoBridge";
    // protocol
    private static Bridge bridgeMessenger = null;
    private static RemoteBridge remoteBridge = null;
    private static ServiceClient serviceClient = null;
    private static File rootDir = null;
    private static File tempDir = null;
    private final ReactApplicationContext reactContext;
    private KeystoreDriver keystoreDriver;

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

    @Override
    public String getName() {
        return "GoBridge";
    }

    //////////////
    // Protocol //
    //////////////

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
            String level = opts.hasKey("level") ? opts.getString("level") : "INFO";

            // log
            Logger.log(Logger.LogLevel.fromString(level), "react-native", message);
        }
    }

    @ReactMethod
    public void initBridge(Promise promise) {
        try {
            if (bridgeMessenger != null || remoteBridge != null || serviceClient != null) {
                throw new Exception("bridge is already instantiated");
            }

            if (this.keystoreDriver == null) {
                throw new Exception("keystoreDriver is not instantiated");
            }

            final BridgeConfig config = Bertybridge.newBridgeConfig();
            if (config == null) {
                throw new Exception("");
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
            config.setAppRootDir(rootDir.getAbsolutePath());

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

            ConnectivityDriver connectivityDriver = new ConnectivityDriver(reactContext);
            reactContext.registerReceiver(connectivityDriver, new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
            reactContext.registerReceiver(connectivityDriver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
            config.setConnectivityDriver(connectivityDriver);

            bridgeMessenger = Bertybridge.newBridge(config);
            serviceClient = bridgeMessenger; // bridgeMessenger implements ServiceClient interface

            Logger.useBridge(bridgeMessenger);

            promise.resolve(true);
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void initBridgeRemote(String address, Promise promise) {
        try {
            if (remoteBridge != null || bridgeMessenger != null || serviceClient != null) {
                throw new Exception("bridge is already instantiated");
            }

            if (this.keystoreDriver == null) {
                throw new Exception("keystoreDriver is not instantiated");
            }

            final RemoteBridgeConfig config = Bertybridge.newRemoteBridgeConfig();
            if (config == null) {
                throw new Exception("");
            }

            remoteBridge = Bertybridge.newRemoteBridge(address, config);
            serviceClient = remoteBridge; // remoteBridge implements ServiceClient interface
            promise.resolve(true);
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void connectService(String serviceName, String address, Promise promise) {
        try {
            if (remoteBridge == null) {
                throw new Exception("remote bridge not started");
            }

            remoteBridge.connectService(serviceName, address);
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
            if (remoteBridge != null) {
                remoteBridge.close();
                remoteBridge = null;
            }
            serviceClient = null;
            promise.resolve(true);
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void invokeBridgeMethod(String method, String b64message, Promise promise) {
        try {
            if (serviceClient == null) {
                throw new Exception("bridge not started");
            }

            PromiseBlock promiseBlock = new JavaPromiseBlock(promise);
            serviceClient.invokeBridgeMethodWithPromiseBlock(promiseBlock, method, b64message);
        } catch (Exception err) {
            promise.reject(err);
        }
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
            if (bridgeMessenger != null) {
                bridgeMessenger.close();
            }
            if (remoteBridge != null) {
                remoteBridge.close();
            }
        } catch (Exception e) {
            Logger.e(TAG, "bridge close error", e);
        }

        bridgeMessenger = null;
        remoteBridge = null;
        serviceClient = null;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        if (BuildConfig.DEBUG_LOGS == true) {
            constants.put("debug", true);
        }
        return constants;
    }
}
