package tech.berty.gobridge.bledriver;

import android.util.Log;

public class Logger {
    private static final String TAG = "BertyBleLogger";

    // Debug mode - defaults to false (production-safe)
    private static boolean sDebugMode = false;

    // Minimum log level for production (only warnings and errors)
    private static final int MIN_PRODUCTION_LEVEL = Log.WARN;

    /**
     * Initialize debug mode based on application debuggable flag.
     * Call this during app initialization before any Berty code runs.
     */
    public static void initializeDebugMode(boolean isDebuggable) {
        sDebugMode = isDebuggable;
        Log.i(TAG, "BLE Logger initialized: debugMode=" + sDebugMode);
    }

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
        // Get the Android log priority for this level
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
                break;
            case Error:
                priority = Log.ERROR;
                break;
            default:
                priority = Log.INFO;
        }

        // In production builds, only log warnings and errors to prevent log flooding
        if (!sDebugMode && priority < MIN_PRODUCTION_LEVEL) {
            return;
        }

        if (mUseExternalLogger) {
            BleInterface.BLELog(level, tag + ": " + message);
        } else {
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
