package chat.berty.core;

public enum Level
{
    DEBUG("DEBUG"),
    INFO("INFO"),
    WARN("WARN"),
    ERROR("ERROR"),
    PANIC("PANIC"),
    DPANIC("DPANIC"),
    FATAL("FATAL"),
    UNKNOW("UNKNOW");

    private final String level;

    Level(final String level) {
        this.level = level;
    }

    @Override
    public String toString() {
        return level;
    }
}

