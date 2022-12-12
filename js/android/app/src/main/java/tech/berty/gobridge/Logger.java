package tech.berty.gobridge;

import android.util.Log;
import bertybridge.Bridge;
import bertybridge.Bertybridge;
import tech.berty.android.BuildConfig;

public class Logger {
    public enum LogLevel {
        Debug(Bertybridge.Debug, Log.DEBUG),
        Info(Bertybridge.Info, Log.INFO),
        Warn(Bertybridge.Warn, Log.WARN),
        Error(Bertybridge.Error, Log.ERROR);

        private final long mGoLevel;
        private final int mNativeLevel;

        LogLevel(long goLevel, int nativeLevel) {
            this.mGoLevel = goLevel;
            this.mNativeLevel = nativeLevel;
        }

        public static LogLevel fromString(String level) {
            switch (level.toUpperCase()) {
                case "DEBUG":
                    return LogLevel.Debug;
                case "WARN":
                    return LogLevel.Warn;
                case "ERROR":
                    return LogLevel.Error;
                default:
                    return LogLevel.Info;
            }
        }

        public int getNativeLogLevel() {
            return this.mNativeLevel;
        }

        public long getGoLevel() {
            return this.mGoLevel;
        }
    };

    private static Bridge mBridge = null;

    public static void useBridge(Bridge bridge) {
        Logger.mBridge = bridge;
    }

    public static void log(LogLevel level, String tag, String message) {
        if (!BuildConfig.DEBUG) {
            return ;
        }

        if (Logger.mBridge == null) {
            Log.println(level.getNativeLogLevel(), tag, message);
            return ;
        }

        Logger.mBridge.log(level.getGoLevel(), message);
    }

    public static void v(String tag, String message) {
        Logger.log(LogLevel.Debug, tag, message);
    }

    public static void d(String tag, String message) {
        Logger.log(LogLevel.Debug, tag, message);
    }

    public static void i(String tag, String message) {
        Logger.log(LogLevel.Info, tag, message);
    }

    public static void w(String tag, String message) {
        Logger.log(LogLevel.Warn, tag, message);
    }

    public static void e(String tag, String message) {
        Logger.log(LogLevel.Error, tag, message);
    }

    public static void e(String tag, String message, Throwable tr) {
        Logger.log(LogLevel.Error, tag, message + ": " + tr.toString());
    }
}
