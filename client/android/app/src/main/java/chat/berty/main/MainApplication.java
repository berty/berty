package chat.berty.main;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.airbnb.android.react.lottie.LottiePackage;
import com.instabug.reactlibrary.RNInstabugReactnativePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.zoontek.rndevmenu.RNDevMenuPackage;
import com.reactcommunity.rnlanguages.RNLanguagesPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
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
                new RNGestureHandlerPackage(),
                new ReactNativeConfigPackage(),
                new RNDevMenuPackage(),
                new RNInstabugReactnativePackage.Builder(BuildConfig.INSTABUG_TOKEN,MainApplication.this)
                    .setInvocationEvent(BuildConfig.DEBUG ? "none" : "shake")
                    .setPrimaryColor("#1D82DC")
                    .setFloatingEdge("left")
                    .setFloatingButtonOffsetFromTop(250)
                    .build(),
                new LottiePackage(),
                new RNLanguagesPackage(),
                new RNFetchBlobPackage(),
                new RNDeviceInfo(),
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
    }
}
