package tech.berty.core;

import android.util.Log;

public class Logger implements core.NativeLogger {
    boolean isEnabled = true;
    String subsytem = "logger";

    public Logger(String subsytem) {
        this.subsytem = subsytem;
    }

    // @TODO: implement this
    @Override
    public boolean levelEnabler(String level) {
        return this.isEnabled;
    }

    public void format(Level level, String namespace, String format, Object... args) {
        final String message = String.format(format, args);
        try {
            this.log(level.toString(), namespace, message);
        } catch (Exception e) {
            final String tag = this.subsytem + "." + namespace;
            Log.e(tag, "Unable to use logger: " + e.getMessage());
            Log.e(tag, message);
        }
    }

    @Override
    public void log(String level, String namespace, String message) throws Exception {
        final Level currentLevel = Level.valueOf(level);
        final String tag = this.subsytem + "." + namespace;

        switch(currentLevel) {
            case DEBUG:
                Log.d(tag, message);
                break;
            case INFO:
                Log.i(tag, message);
                break;
            case WARN:
                Log.w(tag, message);
                break;
            case ERROR:
                Log.e(tag, message);
                break;
            case PANIC:
                Log.wtf(tag, message);
                break;
            case DPANIC:
                Log.wtf(tag, message);
                break;
            case FATAL:
                Log.wtf(tag, message);
                break;
            case UNKNOW:
                Log.i(tag, message);
                break;
            default:
                Log.i(tag, message);
                break;


        }
    }
}
