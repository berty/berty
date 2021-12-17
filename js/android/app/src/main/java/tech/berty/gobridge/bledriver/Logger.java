package tech.berty.gobridge.bledriver;

import tech.berty.android.BuildConfig;
import android.util.Log;

public class Logger {
    public enum Level {
        Verbose(0),
        Debug(1),
        Info(2),
        Warn(3),
        Error(4);

        private final int value;

        Level(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }
    };
    private boolean mShowSensitiveData;
    private boolean mUseExternalLogger;

    public Logger(boolean showSensitiveData, boolean useExternalLogger) {
        mShowSensitiveData = showSensitiveData;
        mUseExternalLogger = useExternalLogger;
    }

    public void log(Level level, String tag, String message) {
        if (!BuildConfig.DEBUG) {
            return;
        }

        if (mUseExternalLogger) {
            BleInterface.BLELog(level, tag + ": " + message);
        } else {
            int priority;
            switch (level) {
                case Verbose:
                    priority = Log.VERBOSE;
                    break;
                case Debug:
                    priority = Log.DEBUG;
                    break;
                case Warn:
                    priority = Log.WARN;
                case Error:
                    priority = Log.ERROR;
                    break;
                default:
                    priority = Log.INFO;
            }
            Log.println(priority, tag, message);
        }
    }

    public void v(String tag, String message) {
        log(Level.Verbose, tag, message);
    }

    public void d(String tag, String message) {
        log(Level.Debug, tag, message);
    }

    public void i(String tag, String message) {
        log(Level.Info, tag, message);
    }

    public void w(String tag, String message) {
        log(Level.Warn, tag, message);
    }

    public void e(String tag, String message) {
        log(Level.Error, tag, message);
    }

    public void e(String tag, String message, Throwable tr) { log(Level.Error, tag, message + ": " + tr.toString()); }

    public String sensitiveObject(Object obj) {
        if (mShowSensitiveData) {
            return obj.toString();
        } else {
            return "####";
        }
    }

    public boolean showSensitiveData() {
        return mShowSensitiveData;
    }
}
