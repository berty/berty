package libp2p.transport.ble;

import android.annotation.TargetApi;
import android.os.Build;

import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.Semaphore;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class JavaToGo {
    private static final String TAG = "java_to_go";

    private static final LinkedBlockingDeque<Event> events = new LinkedBlockingDeque<>();

    public static Event getEvent() throws InterruptedException { return events.take(); }

    public enum EventType {
        HANDLE_FOUND_PEER(0),
        RECEIVE_FROM_PEER(1),
        LOG(2);

        private int type;

        EventType(int type) {
            this.type = type;
        }

        public int toInt() {
            return type;
        }
    }

    public static abstract class Event {
        private final EventType type;

        Event(final EventType type) {
            this.type = type;
        }

        public int getType() {
            return type.toInt();
        }
    }

    public static final class HandleFoundPeerEvent extends Event {
        private final String remotePID;
        private boolean success;
        private final Semaphore responseLock = new Semaphore(0);

        HandleFoundPeerEvent(String remotePID) {
            super(EventType.HANDLE_FOUND_PEER);
            this.remotePID = remotePID;
        }

        public String getRemotePID() { return remotePID; }

        public void sendResponseToJava(boolean success) {
            this.success = success;
            responseLock.release();
        }

        boolean waitResponseFromGo() {
            try { responseLock.acquire(); } catch(Exception e) {}
            return success;
        }
    }

    public static final class ReceiveFromPeerEvent extends Event {
        private final String remotePID;
        private final byte[] payload;
        private final Semaphore responseLock = new Semaphore(0);

        ReceiveFromPeerEvent(String remotePID, byte[] payload) {
            super(EventType.RECEIVE_FROM_PEER);
            this.remotePID = remotePID;
            this.payload = payload;
        }

        public String getRemotePID() { return remotePID; }
        public byte[] getPayload() { return payload; }

        public void sendResponseToJava() {
            responseLock.release();
        }

        void waitResponseFromGo() {
            try { responseLock.acquire(); } catch (Exception e) {}
        }
    }

    public static final class LogEvent extends Event {
        private final String tag;
        private final String level;
        private final String log;

        LogEvent(String tag, String level, String log) {
            super(EventType.LOG);
            this.tag = tag;
            this.level = level;
            this.log = log;
        }

        public String getTag() { return tag; }
        public String getLevel() { return level; }
        public String getLog() { return log; }
    }

    static boolean handleFoundPeer(String remotePID) {
        HandleFoundPeerEvent event = new HandleFoundPeerEvent(remotePID);

        try {
            events.put(event);
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

    static void receiveFromPeer(String remotePID, byte[] payload) {
        ReceiveFromPeerEvent event = new ReceiveFromPeerEvent(remotePID, payload);

        try {
            events.put(event);
            event.waitResponseFromGo();
        } catch(Exception e) {
            Log.e(TAG, "receiveFromPeer() failed: " + e.getMessage());
        }
    }

    static void log(String tag, String level, String log) {
        try {
            events.put(new LogEvent(tag, level, log));
        } catch (Exception e) {
            // Failed to log: what a bad situation ^^ (fallback on Logcat)
            android.util.Log.e(TAG, "Log to golang failed with tag: " + tag + ", level: " + level + ", log: " + log);
        }
    }
}
