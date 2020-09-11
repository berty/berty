package tech.berty.app;

import com.facebook.react.ReactActivity;

import android.os.Bundle;
import com.shakebugs.react.TouchTracker;
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

  private TouchTracker touchTracker;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	touchTracker = new TouchTracker(getApplicationContext());
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
	touchTracker.handleTouchEvent(ev, this);
	return super.dispatchTouchEvent(ev);
  }

}