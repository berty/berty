package tech.berty.gobridge;

public enum LoggerLevel {
    ASSERT("ASSERT"),
    DEBUG("DEBUG"),
    INFO("INFO"),
    WARN("WARN"),
    ERROR("ERROR"),
    PANIC("PANIC"),
    DPANIC("DPANIC"),
    FATAL("FATAL"),
    VERBOSE("VERBOSE"),
    UNKNOW("UNKNOW");

    private final String level;

    LoggerLevel(String level) {
        this.level = level;
    }

    public String valueOf() {
        return level;
    }
}
