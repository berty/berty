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
import bertybridge.MessengerBridge;
import bertybridge.MessengerConfig;



public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final static String TAG = "GoBridge";
    private final ReactApplicationContext reactContext;
    private final static LoggerDriver rnlogger = new LoggerDriver("tech.berty", "react");

    // protocol
    private static MessengerBridge bridgeMessenger = null;
    private static File rootDir = null;

    public GoBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.rootDir = new File(reactContext.getFilesDir().getAbsolutePath() + "/berty");
        System.out.println("root dir: " + this.rootDir.getAbsolutePath());
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
                promise.resolve(true);
            }
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

            // gather opts
            final boolean optPersistence = opts.hasKey("persistence") && opts.getBoolean("persistence");
            final String optLog = opts.hasKey("logLevel") ? opts.getString("logLevel") : "";
            final boolean optPOIDebug = opts.hasKey("poiDebug") && opts.getBoolean("poiDebug");
            String[] optsGrpcListeners = {"/ip4/127.0.0.1/tcp/0/grpcws"}; // default value
            if (opts.hasKey("grpcListeners") && opts.getType("grpcListeners") == ReadableType.Array) {
                optsGrpcListeners = readableArrayToStringArray(opts.getArray("grpcListeners"));
            }
            String[] optsSwarmListeners = {"/ip4/0.0.0.0/tcp/0", "/ip6/0.0.0.0/tcp/0"}; // default value
            if (opts.hasKey("swarmListeners") && opts.getType("swarmListeners") == ReadableType.Array) {
                optsSwarmListeners = readableArrayToStringArray(opts.getArray("swarmListeners"));
            }
            final boolean optTracing = opts.hasKey("tracing") && opts.getBoolean("tracing");
            final String optTracingPrefix = opts.hasKey("tracingPrefix") ? opts.getString("tracingPrefix") : "";
            final boolean optLocalDiscovery = opts.hasKey("localDiscovery") && opts.getBoolean("localDiscovery");

            final MessengerConfig config = Bertybridge.newMessengerConfig();
            if (config == null) {
                throw new Exception("");
            }

            // init logger
            LoggerDriver logger = new LoggerDriver("tech.berty", "protocol");

            config.logLevel(optLog);
            config.loggerDriver(logger);

            // configure grpc listener
            for (String listener: optsGrpcListeners) {
                config.addGRPCListener(listener);
            }

            // configure swarm listeners
            for (String listener: optsSwarmListeners) {
                config.addSwarmListener(listener);
            }

            // set persistence if needed
            if (optPersistence) {
                if (this.rootDir != null && !this.rootDir.exists()) {
                    if (!this.rootDir.mkdirs()) {
                        throw new Exception("rootdir directory creation failed");
                    }
                }
                Log.i(TAG, "root dir: " + this.rootDir.getAbsolutePath());
                config.rootDirectory(this.rootDir.getAbsolutePath());
            }

            if (optPOIDebug) {
                config.enablePOIDebug();
            }

            if (optTracing) {
                config.enableTracing();
                config.setTracingPrefix(optTracingPrefix);
            }

            if (!optLocalDiscovery) {
                config.disableLocalDiscovery();
            }

            System.out.println("bflifecycle: calling Bertybridge.newMessengerBridge");
            this.bridgeMessenger = Bertybridge.newMessengerBridge(config);
            System.out.println("bflifecycle: done Bertybridge.newMessengerBridge");
            promise.resolve(true);
        } catch(Exception err) {
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
    public void invokeBridgeMethod(String method, String b64message , Promise promise) {
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
