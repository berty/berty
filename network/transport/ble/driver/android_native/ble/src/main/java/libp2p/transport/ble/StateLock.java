package libp2p.transport.ble;

final class StateLock {
    private boolean state;

    void setState(boolean state) {
        this.state = state;
    }

    boolean getState() {
        return state;
    }
}
