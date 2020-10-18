package tech.berty.app;

import com.facebook.react.ReactActivity;


import com.shakebugs.shake.Shake;
import android.view.MotionEvent;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Berty";
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
      Shake.handleTouchEvent(ev, this);
      return super.dispatchTouchEvent(ev);
  }
}