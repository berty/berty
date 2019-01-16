package chat.berty.main;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    protected String TAG = "MainActivity";

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
}
