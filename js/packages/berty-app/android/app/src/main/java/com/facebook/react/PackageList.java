// // TODO: generate this file with bazel
//
// package com.facebook.react;
//
// import android.app.Application;
// import android.content.Context;
// import android.content.res.Resources;
//
// import com.facebook.react.ReactPackage;
// import com.facebook.react.shell.MainReactPackage;
// import java.util.Arrays;
// import java.util.ArrayList;
//
// import tech.berty.app.BuildConfig;
// // import tech.berty.app.R;
//
// // tech.berty.chatbridge
// import tech.berty.bridge.BertyBridgePackage;
//
// public class PackageList {
//   private Application application;
//   private ReactNativeHost reactNativeHost;
//   public PackageList(ReactNativeHost reactNativeHost) {
//     this.reactNativeHost = reactNativeHost;
//   }
//
//   public PackageList(Application application) {
//     this.reactNativeHost = null;
//     this.application = application;
//   }
//
//   private ReactNativeHost getReactNativeHost() {
//     return this.reactNativeHost;
//   }
//
//   private Resources getResources() {
//     return this.getApplication().getResources();
//   }
//
//   private Application getApplication() {
//     if (this.reactNativeHost == null) return this.application;
//     return this.reactNativeHost.getApplication();
//   }
//
//   private Context getApplicationContext() {
//     return this.getApplication().getApplicationContext();
//   }
//
//   public ArrayList<ReactPackage> getPackages() {
//     return new ArrayList<>(Arrays.<ReactPackage>asList(
//       new MainReactPackage(),
//       new BertyChatBridgePackage()
//     ));
//   }
// }
