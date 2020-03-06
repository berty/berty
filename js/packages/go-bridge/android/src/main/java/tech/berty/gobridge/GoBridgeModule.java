package tech.berty.gobridge;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

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

            final String loglevel = opts.hasKey("loglevel") ? opts.getString("logLevel") : "info";
            final String orbitdb = opts.hasKey("persistance") && opts.getBoolean("persistance") ? this.orbitdir : inMemoryDir;
            final String grpcListeners = opts.hasKey("grpcListeners") ? opts.getString("grpcListeners") : "/ip4/127.0.0.1/tcp/0/grpcws";
            final String swarmListeners = opts.hasKey("swarmListeners") ? opts.getString("grpcListeners") : "/ip4/0.0.0.0/tcp/0,/ip6/0.0.0.0/tcp/0";

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

            // set swarm listeners
            config.swarmListeners(swarmListeners);

            // set grpc Listeners
            config.addGRPCListener(grpcListeners);


            this.demoBridge = Bertybridge.newDemoBridge(config);
            promise.resolve(true);
        } catch (Exception err) {
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
}
