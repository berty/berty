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
import bertybridge.Bertybridge;
import bertybridge.Protocol;
import bertybridge.ProtocolConfig;

public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final static String TAG = "GoBridge";
    private final ReactApplicationContext reactContext;

    // protocol
    private Protocol bridgeProtocol = null;
    private final String rootDir;

    public GoBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.rootDir = reactContext.getFilesDir().getAbsolutePath() + "/berty";
    }

    @Override
    public String getName() {
        return "GoBridge";
    }

    @ReactMethod
    public void clearStorage(Promise promise) {
        try {
            final File rootDir = new File(this.rootDir);
            if (rootDir.exists()) {
                if (!rootDir.delete()) {
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
            String level = opts.hasKey("level") ? opts.getString("level") : "info";
            // TODO
        }
    }

    //////////////
    // Protocol //
    //////////////

    @ReactMethod
    public void startProtocol(ReadableMap opts, Promise promise) {
        try {
            if (this.bridgeProtocol != null) {
                throw new Exception("bridge protocol already started");
            }

            // gather opts
            final boolean optPersistence = opts.hasKey("persistence") && opts.getBoolean("persistence");
            final String optLog = opts.hasKey("logLevel") ? opts.getString("logLevel)") : "";
            final boolean optPOIDebug = opts.hasKey("poiDebug") && opts.getBoolean("poiDebug");
            String[] optsGrpcListeners = {"/ip4/127.0.0.1/tcp/0/grpcws"}; // default value
            if (opts.hasKey("grpcListeners") && opts.getType("grpcListeners") == ReadableType.Array) {
                optsGrpcListeners = readableArrayToStringArray(opts.getArray("grpcListeners"));
            }
            String[] optsSwarmListeners = {"/ip4/0.0.0.0/tcp/0", "/ip6/0.0.0.0/tcp/0"}; // default value
            if (opts.hasKey("swarmListeners") && opts.getType("swarmListeners") == ReadableType.Array) {
                optsGrpcListeners = readableArrayToStringArray(opts.getArray("swarmListeners"));
            }
            final boolean optTracing = opts.hasKey("tracing") && opts.getBoolean("tracing");
            final String optTracingPrefix = opts.hasKey("tracingPrefix") ? opts.getString("tracingPrefix") : "";
            final boolean optLocalDiscovery = opts.hasKey("localDiscovery") && opts.getBoolean("localDiscovery");

            final ProtocolConfig config = Bertybridge.newProtocolConfig();
            if (config == null) {
                throw new Exception("");
            }

            // init logger
            // TODO

            config.logLevel(optLog);
            // TODO
            //config.loggerDriver(logger);

            // configure grpc listener
            for (String listener: optsGrpcListeners) {
                config.addGRPCListener(listener);
            }

            // configure swarm listeners
            for (String listener: optsGrpcListeners) {
                config.addSwarmListener(listener);
            }

            // set persistence if needed
            if (optPersistence) {
                final File dir = new File(this.rootDir);
                if (!dir.exists()) {
                    if (!dir.mkdirs()) {
                        throw new Exception("rootdir directory creation failed");
                    }
                }
                Log.i(TAG, "root dir: " + this.rootDir);
                config.rootDirectory(this.rootDir);
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

            Log.i(TAG, "bflifecycle: calling Bertybridge.newProtocolBridge");
            this.bridgeProtocol = Bertybridge.newProtocolBridge(config);
            Log.i(TAG, "bflifecycle: done Bertybridge.newProtocolBridge");
            promise.resolve(true);
        } catch(Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void stopProtocol(Promise promise) {
        try {
            if (this.bridgeProtocol != null) {
                Log.i(TAG, "bflifecycle: calling bridgeProtocol.close()");
                this.bridgeProtocol.close();
                Log.i(TAG, "bflifecycle: done bridgeProtocol.close()");
                this.bridgeProtocol = null;
            }
            promise.resolve(true);
        } catch (Exception err) {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getProtocolAddr(Promise promise) {
        try {
            if (this.bridgeProtocol == null) {
                throw new Exception("bridge protocol not started");
            }

            String addr = this.bridgeProtocol.grpcWebSocketListenerAddr();
            promise.resolve(addr);
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

}
