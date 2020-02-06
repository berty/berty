package tech.berty.gobridge;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;

// go packages
import bertybridge.Bertybridge;
import bertybridge.BridgeOpts;
import bertybridge.DemoBridge;
import bertybridge.DemoOpts;

public class GoBridgeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private DemoBridge demoBridge = null;
    private final String orbitdir;

    public GoBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.orbitdir = reactContext.getFilesDir().getAbsolutePath();
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

            String loglevel = "info";
            String orbitdir = "memory";

            if (opts.hasKey("loglevel")) loglevel = opts.getString("loglevel");
            if (opts.hasKey("persistance")) orbitdir = this.orbitdir;

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
