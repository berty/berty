package chat.berty.main;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.airbnb.android.react.lottie.LottiePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.pusherman.networkinfo.RNNetworkInfoPackage;
import com.imagepicker.ImagePickerPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import org.reactnative.camera.RNCameraPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import org.reactnative.camera.RNCameraPackage;
import com.horcrux.svg.SvgPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.pusherman.networkinfo.RNNetworkInfoPackage;
import com.imagepicker.ImagePickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.lang.System;
import java.util.List;

import chat.berty.ble.Manager;
import chat.berty.core.CorePackage;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new CorePackage(),
                new ImagePickerPackage(),
                new MainReactPackage(),
                new LottiePackage(),
                new RNViewShotPackage(),
                new RNCameraPackage(),
                new RNNetworkInfoPackage(),
                new ReactNativeExceptionHandlerPackage(),
                new ReactNativeRestartPackage(),
                new SvgPackage(),
                new VectorIconsPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);

        Manager.getInstance().setmContext(this.getApplicationContext());
    }
}
