package tech.berty.bertybridgeexpo.gobridge;

import android.util.Log;
import bertybridge.Bridge;
import bertybridge.Bertybridge;

public class Logger {
    public enum LogLevel {
        Debug(Bertybridge.LevelDebug, Log.DEBUG),
        Info(Bertybridge.LevelInfo, Log.INFO),
        Warn(Bertybridge.LevelWarn, Log.WARN),
        Error(Bertybridge.LevelError, Log.ERROR);

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
        if (Logger.mBridge == null) {
            Log.println(level.getNativeLogLevel(), tag, message);
            return ;
        }

        Logger.mBridge.log(level.getGoLevel(), tag, message);
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
