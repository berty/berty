package tech.berty.gobridge;

import android.util.Log;
import android.util.LogPrinter;

import bertybridge.NativeLoggerDriver;

public class LoggerDriver implements NativeLoggerDriver {
    private final String subsystem;
    private final String category;
    private final boolean isEnabled;

    public LoggerDriver() {
        this("logger", "log");
    }

    public LoggerDriver(String subsystem) {
        this(subsystem, "log");
    }

    public LoggerDriver(String subsystem, String category) {
        this.subsystem = subsystem;
        this.category = category;
        this.isEnabled = true;
    }

    public void log(String level, String namespace, String message) throws Exception {
        LoggerLevel loggerLevel;

        try {
            loggerLevel = LoggerLevel.valueOf(level);
        } catch (Exception cause) {
            throw new Exception("Invalid level");
        }

        if (message == null) {
            throw new Exception("Empty message");
        }

        if (namespace != null && namespace != "") {
            namespace = this.subsystem + "." + namespace;
        } else {
            namespace = this.subsystem;
        }

        int priority;
        switch (loggerLevel) {
            case ASSERT:
                priority = Log.ASSERT;
                break;
            case DEBUG:
                priority = Log.DEBUG;
                break ;
            case PANIC:
            case DPANIC:
            case FATAL:
            case ERROR:
                priority = Log.ERROR;
                break ;
            case INFO:
                priority = Log.INFO;
                break ;
            case VERBOSE:
                priority = Log.VERBOSE;
                break ;
            case WARN:
                priority = Log.WARN;
                break ;
            case UNKNOW:
            default:
                priority = Log.INFO;
        }
        LogPrinter logPrinter = new LogPrinter(priority, namespace);
        String out = String.format("[%s] [%s]: %s", level, namespace, message);
        logPrinter.println(out);
    }

    public void format(String format, LoggerLevel loggerLevel, Object ... args) {
        this.print(String.format(format, args), loggerLevel, null);
    }

    public void print(String message, LoggerLevel loggerLevel, String category) {
        if (category == null) {
            category = this.category;
            try {
                this.log(loggerLevel.valueOf(), category, message);
            } catch (Exception e) {
                System.out.printf("[%s] [%s]: %s\n", loggerLevel.valueOf(), this.subsystem + ".log", message);
            }
        }
    }

    // @TODO: implement this
    public boolean levelEnabler(String level) {
        return this.isEnabled;
    }
}
