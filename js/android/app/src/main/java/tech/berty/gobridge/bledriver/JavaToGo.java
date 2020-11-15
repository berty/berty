package tech.berty.gobridge.bledriver;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class JavaToGo {
    private static final String TAG = "JavaToGo";

    public static boolean HandleFoundPeer(String peerID) {
        Log.d(TAG, "handleFoundPeer() called");
        return true;
    }

    public static void ReceiveFromPeer(String remotePID, byte[] payload) {
        Log.d(TAG, "ReceiveFromPeer() called");
    }
}
