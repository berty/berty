package chat.berty.main;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import chat.berty.core.Level;
import chat.berty.core.Logger;
import core.Core;

public class MainActivity extends ReactActivity {

    protected String TAG = "MainActivity";
    private Logger logger = new Logger("chat.berty.io");

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "root";
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            Core.setAppState(Core.getDeviceInfoAppStateBackground());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, TAG, "on create: %s", err);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        try {
            Core.setAppState(Core.getDeviceInfoAppStateBackground());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, TAG, "on pause: %s", err);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        try {
            Core.setAppState(Core.getDeviceInfoAppStateForeground());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, TAG, "on resume: %s", err);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            Core.setAppState(Core.getDeviceInfoAppStateKill());
        } catch (Exception err) {
            this.logger.format(Level.ERROR, TAG, "on destroy: %s", err);
        }
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
}
