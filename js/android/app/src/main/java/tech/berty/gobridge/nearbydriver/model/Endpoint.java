package tech.berty.gobridge.nearbydriver.model;

import androidx.annotation.NonNull;

public class Endpoint {
    @NonNull
    private final String id;
    @NonNull private final String name;
    private boolean connected = false;

    public Endpoint(@NonNull String id, @NonNull String name) {
        this.id = id;
        this.name = name;
    }

    @NonNull
    public String getId() {
        return id;
    }

    @NonNull
    public String getName() {
        return name;
    }

    public boolean isConnected() { return connected; }

    public void setConnected(boolean state) { connected = state; }
}
