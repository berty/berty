package chat.berty;

import android.app.Activity;
import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Message;
import android.os.ParcelUuid;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.HashMap;
import java.util.UUID;

import static android.content.ContentValues.TAG;

public class BertyBluetoothModule extends ReactContextBaseJavaModule {
    protected BluetoothAdapter mBluetoothAdapter;
    final static int BLUETOOTH_ENABLE_REQUEST = 1;
    protected ReactApplicationContext mReactContext;

    protected UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    protected String TAG = "BertyBluetoothModule";

    protected BertyBluetooth manager;

    public BertyBluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
        manager = new BertyBluetooth(this);
    }

    public void sendEvent(String eventName,
                           @Nullable WritableMap params) {
        Log.d(TAG, "sending");
        try {
            MainApplication app = (MainApplication) getCurrentActivity().getApplication();
            app.getReactNativeHost().
                    getReactInstanceManager().
                    getCurrentReactContext().
                    getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).
                    emit(eventName, params);
        } catch (Exception e) {
            Log.e(TAG, e.toString());
        }

        Log.d(TAG, "seeeeeeeenndded");
    }

    @Override
    public String getName() {
        return "BertyBluetoothModule";
    }

    @ReactMethod
    public void askBluetooth() {
        manager.askBluetooth();
    }

    public Activity getCA() {
        return this.getCurrentActivity();
    }

    @ReactMethod
    public void startDiscover() {
        manager.startDiscover();
    }

    @ReactMethod
    public void startDiscoverability() {
        manager.startDiscoverabilty();
    }

    @ReactMethod
    public void connect(String name) {
        manager.connect(name);
    }

    @ReactMethod
    public void writeTo(String addr, String msg) {
        manager.writeTo(addr, msg);
    }
}
