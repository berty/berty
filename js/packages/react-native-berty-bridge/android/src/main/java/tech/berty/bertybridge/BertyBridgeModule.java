package tech.berty.bertybridge;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

// go packages
import bertybridge.Bertybridge;
import bertybridge.BridgeOpts;
import bertybridge.DemoBridge;
import bertybridge.DemoOpts;

public class BertyBridgeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private DemoBridge demoBridge = null;


    public BertyBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "BertyBridge";
    }

    @ReactMethod
    public void startDemo(Promise promise) {
        try {
            if (this.demoBridge != null) {
                throw new Exception("demo bridge already started");
            }

            BridgeOpts bridgeOpts = new BridgeOpts();
            bridgeOpts.setGRPCWebSocketListener(true);

            DemoOpts opts = new DemoOpts();
            opts.setLogLevel("debug");
            opts.setBridgeOpts(bridgeOpts);
            
            this.demoBridge = Bertybridge.newDemoBridge(opts);
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
