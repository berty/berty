package tech.berty.gobridge;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

import java.io.File;


// go packages
import bertybridge.Bertybridge;
import bertybridge.BridgeOpts;
import bertybridge.DemoBridge;
import bertybridge.DemoOpts;

public class GoBridgeModule extends ReactContextBaseJavaModule {
    private final String inMemoryDir = ":memory:";
    private final ReactApplicationContext reactContext;
    private DemoBridge demoBridge = null;
    private final String orbitdir;

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

            String loglevel = opts.hasKey("loglevel") ? opts.getString("loglevel") : "info";
            String orbitdir = opts.hasKey("persistance") && opts.getBoolean("persistance") ? this.orbitdir : inMemoryDir;

            if (orbitdir != inMemoryDir) {
                final File dir = new File(this.orbitdir);
                if (!dir.exists()) {
                    if (!dir.mkdirs()) {
                        throw new Exception("orbitdb directory creation failed");
                    }
                }
            }


            BridgeOpts bridgeOpts = new BridgeOpts();
            bridgeOpts.setGRPCWebSocketListener(true);

            DemoOpts demoOpts = new DemoOpts();
            demoOpts.setLogLevel(loglevel);
            demoOpts.setOrbitDBDirectory(orbitdir);
            demoOpts.setBridgeOpts(bridgeOpts);

            this.demoBridge = Bertybridge.newDemoBridge(demoOpts);
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
