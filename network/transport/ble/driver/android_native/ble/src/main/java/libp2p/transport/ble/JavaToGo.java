package libp2p.transport.ble;

import android.annotation.TargetApi;
import android.os.Build;

import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.Semaphore;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class JavaToGo {
    private static final String TAG = "java_to_go";

    private static final LinkedBlockingDeque<EventContainer> events = new LinkedBlockingDeque<>();

    public static EventContainer getEvent() throws InterruptedException { return events.take(); }

    // It's ugly but Java -> Go reverse binding doesn't fully support object casting.
    // You can't extends an abstract class in Java then cast abstract type to concrete type in Go.
    public static final class EventContainer {
        private final EventType type;
        private HandleFoundPeerEvent handleFoundPeerEvent;
        private ReceiveFromPeerEvent receiveFromPeerEvent;
        private LogEvent logEvent;

        EventContainer(final HandleFoundPeerEvent handleFoundPeerEvent) {
            this.type = EventType.HANDLE_FOUND_PEER;
            this.handleFoundPeerEvent = handleFoundPeerEvent;
        }

        EventContainer(final ReceiveFromPeerEvent receiveFromPeerEvent) {
            this.type = EventType.RECEIVE_FROM_PEER;
            this.receiveFromPeerEvent = receiveFromPeerEvent;
        }

        EventContainer(final LogEvent logEvent) {
            this.type = EventType.LOG;
            this.logEvent = logEvent;
        }

        public EventContainer() {
            this.type = EventType.INTERRUPT;
        }

        public final HandleFoundPeerEvent getHandleFoundPeerEvent() { return handleFoundPeerEvent; }
        public final ReceiveFromPeerEvent getReceiveFromPeerEvent() { return receiveFromPeerEvent; }
        public final LogEvent getLogEvent() { return logEvent; }

        public int getType() {
            return type.toInt();
        }
    }

    public enum EventType {
        HANDLE_FOUND_PEER(0),
        RECEIVE_FROM_PEER(1),
        LOG(2),
        INTERRUPT(3);

        private int type;

        EventType(int type) {
            this.type = type;
        }

        public int toInt() {
            return type;
        }
    }

    public static final class HandleFoundPeerEvent {
        private final String remotePID;
        private boolean success;
        private final Semaphore responseLock = new Semaphore(0);

        public HandleFoundPeerEvent(final String remotePID) {
            this.remotePID = remotePID;
        }

        public String getRemotePID() { return remotePID; }

        public void sendResponseToJava(final boolean success) {
            this.success = success;
            responseLock.release();
        }

        boolean waitResponseFromGo() {
            try { responseLock.acquire(); } catch(Exception e) { /* ignore */ }
            return success;
        }
    }

    public static final class ReceiveFromPeerEvent {
        private final String remotePID;
        private final byte[] payload;
        private final Semaphore responseLock = new Semaphore(0);

        public ReceiveFromPeerEvent(final String remotePID, final byte[] payload) {
            this.remotePID = remotePID;
            this.payload = payload;
        }

        public String getRemotePID() { return remotePID; }
        public byte[] getPayload() { return payload; }

        public void sendResponseToJava() {
            responseLock.release();
        }

        void waitResponseFromGo() {
            try { responseLock.acquire(); } catch (Exception e) { /* ignore */ }
        }
    }

    public static final class LogEvent {
        private final String tag;
        private final String level;
        private final String log;

        public LogEvent(final String tag, final String level, final String log) {
            this.tag = tag;
            this.level = level;
            this.log = log;
        }

        public String getTag() { return tag; }
        public String getLevel() { return level; }
        public String getLog() { return log; }
    }

    static boolean handleFoundPeer(final String remotePID) {
        HandleFoundPeerEvent event = new HandleFoundPeerEvent(remotePID);

        try {
            events.put(new EventContainer(event));
            if (event.waitResponseFromGo()) {
                Log.i(TAG, "handleFoundPeer() succeeded for peerID: " + remotePID);
                return true;
            }
            Log.e(TAG, "receiveFromPeer() failed from golang for peerID: " + remotePID);
        } catch(Exception e) {
            Log.e(TAG, "receiveFromPeer() failed for peerID: " + remotePID + ", error: " + e.getMessage());
        }

        return false;
    }

    static void receiveFromPeer(final String remotePID, final byte[] payload) {
        ReceiveFromPeerEvent event = new ReceiveFromPeerEvent(remotePID, payload);

        try {
            events.put(new EventContainer(event));
            event.waitResponseFromGo();
        } catch(Exception e) {
            Log.e(TAG, "receiveFromPeer() failed: " + e.getMessage());
        }
    }

    static void log(final String tag, final String level, final String log) {
        try {
            events.put(new EventContainer(new LogEvent(tag, level, log)));
        } catch (Exception e) {
            // Failed to log: what a bad situation ^^ (fallback on Logcat)
            android.util.Log.e(TAG, "Log to golang failed with tag: " + tag + ", level: " + level + ", log: " + log);
        }
    }

    static void stopEventLoop() {
        events.clear();
        events.add(new EventContainer());
    }
}
