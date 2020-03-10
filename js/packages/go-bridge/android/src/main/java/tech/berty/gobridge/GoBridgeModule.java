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
import bertybridge.Demo;
import bertybridge.DemoConfig;

public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final String inMemoryDir = ":memory:";
    private final ReactApplicationContext reactContext;
    private final String orbitdir;

    private Demo demoBridge = null;

    public GoBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.orbitdir = reactContext.getFilesDir().getAbsolutePath() + "/orbitdb";
    }

    @Override
    public String getName() {
        return "GoBridge";
    }

    @ReactMethod
    public void startDemo(ReadableMap opts, Promise promise) {
        try {
            if (this.demoBridge != null) {
                throw new Exception("demo bridge already started");
            }

            // get opts
            final String loglevel = opts.hasKey("loglevel") ? opts.getString("logLevel") : "info";
            final String orbitdb = opts.hasKey("persistance") && opts.getBoolean("persistance") ? this.orbitdir : inMemoryDir;

            String[] grpcListeners = {"/ip4/127.0.0.1/tcp/0/grpcws"}; // default
            if (opts.hasKey("grpcListeners") && opts.getType("grpcListeners") == ReadableType.Array) {
                    grpcListeners = readableArrayToStringArray(opts.getArray("grpcListeners"));
            }

            String[] swarmListeners =  {"/ip4/0.0.0.0/tcp/0", "/ip6/0.0.0.0/tcp/0"}; // default
            if (opts.hasKey("swarmListeners") && opts.getType("grpcListeners") == ReadableType.Array) {
                swarmListeners = readableArrayToStringArray(opts.getArray("swarmListeners"));
            }

            if (orbitdir != inMemoryDir) {
                final File dir = new File(this.orbitdir);
                if (!dir.exists()) {
                    if (!dir.mkdirs()) {
                        throw new Exception("orbitdb directory creation failed");
                    }
                }
            }

            final DemoConfig config = Bertybridge.newDemoConfig();

            // set loglevel
            config.logLevel(loglevel);

            // set persistance
            config.orbitDBDirectory(orbitdir);

            // set swarm listenersswarmListener
            for (String listener: swarmListeners) {
                config.addSwarmListener(listener);
            }
            // set grpc listenersgrpcListener
            for (String listener : grpcListeners) {
                config.addGRPCListener(listener);
            }

            this.demoBridge = Bertybridge.newDemoBridge(config);
            promise.resolve(true);
        }catch(

    Exception err)
    {
            promise.reject(err);
        }
    }

    @ReactMethod
    public void getDemoAddr(Promise promise) {
        try {
            if (this.demoBridge == null) {
                throw new Exception("demo bridge not started");
            }

            String addr = this.demoBridge.grpcWebSocketListenerAddr();
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
