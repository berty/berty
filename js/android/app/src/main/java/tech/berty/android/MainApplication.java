package tech.berty.android;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;
import androidx.lifecycle.ProcessLifecycleOwner;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import android.content.res.Configuration;
import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import tech.berty.gobridge.GoBridgePackage;
import tech.berty.notification.NotificationPackage;
import tech.berty.notification.NotificationService;
import tech.berty.rootdir.RootDirPackage;

public class MainApplication extends Application implements ReactApplication, LifecycleObserver {
    private static final String TAG = "MainApplication";

    public enum AppState {
        Background,
        Foreground
    }

    private static AppState appState = AppState.Foreground;

    private final ReactNativeHost mReactNativeHost =
        new ReactNativeHostWrapper(this, new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
                @SuppressWarnings("UnnecessaryLocalVariable")
                List<ReactPackage> packages = new PackageList(this).getPackages();
                // Packages that cannot be autolinked yet can be added manually here, for example:
                // packages.add(new MyReactNativePackage());
                packages.add(new NotificationPackage());
                packages.add(new RootDirPackage());
                packages.add(new GoBridgePackage());
                return packages;
            }

            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        });



    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    public void onAppBackgrounded() {
        //App in background
        MainApplication.appState = AppState.Background;
        Log.d(TAG, "AppState" + MainApplication.appState);
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    public void onAppForegrounded() {
        //App in foreground
        MainApplication.appState = AppState.Foreground;
        Log.d(TAG, "AppState" + MainApplication.appState);
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        // init SoLoader
        SoLoader.init(this, /* native exopackage */ false);

        // init flipper
        initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

        // register for lifecycle events
        ProcessLifecycleOwner.get().getLifecycle().addObserver(this);

        // init expo
        ApplicationLifecycleDispatcher.onApplicationCreate(this);
    }

    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private static void initializeFlipper(
        Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
            try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                Class<?> aClass = Class.forName("tech.berty.android.ReactNativeFlipper");
                aClass
                    .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                    .invoke(null, context, reactInstanceManager);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
    }
}
