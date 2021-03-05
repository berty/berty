package tech.berty.gobridge.nearby;

import android.content.Context;
import android.util.Log;

import bertybridge.Bertybridge;
import bertybridge.NativeBleDriver;
import bertybridge.NativeNBDriver;
import bertybridge.ProximityTransport;

public class NBInterface implements NativeNBDriver {
    private static final String TAG = "bty.nearby.NBInterface";

    public static final String DefaultAddr = "/nearby/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    public static final int ProtocolCode = 0x0044;
    public static final String ProtocolName = "nearby";

    private Context mContext;
    private static ProximityTransport mTransport;
    private NBDriver mNBDriver;

    public NBInterface(Context context) {
        mContext = context;
    }

    public void start(String localPID) {
        Log.d(TAG, "start Android Nearby driver");

        this.mTransport = Bertybridge.getProximityTransport(ProtocolName);
        if (mTransport == null) {
            Log.e(TAG, "proximityTransporter not found");
            return ;
        }

        if ((this.mNBDriver = NBDriver.getInstance(mContext)) == null) {
            Log.e(TAG, "can't get BleDriver instance");
            return ;
        }
        this.mNBDriver.StartNBDriver(localPID);
    }

    public void stop() {
        if (this.mNBDriver != null) {
            this.mNBDriver.StopNBDriver();
            this.mNBDriver = null;
        }
        mTransport = null;
    }

    public boolean dialPeer(String remotePID) {
        if (mNBDriver != null) {
            return mNBDriver.findPeer(remotePID) != null;
        }

        return false;
    }

    public boolean sendToPeer(String remotePID, byte[] payload) {
        if (this.mNBDriver != null) {
            return mNBDriver.SendToPeer(remotePID, payload);
        }
        return false;
    }

    public void closeConnWithPeer(String remotePID) {
        if (this.mNBDriver != null) {
            mNBDriver.closeConn(remotePID);
        }
    }

    public long protocolCode() {
        return ProtocolCode;
    }

    public String protocolName() {
        return ProtocolName;
    }

    public String defaultAddr() {
        return DefaultAddr;
    }

    public static boolean NBHandleFoundPeer(String remotePID) {
        if (mTransport != null) {
            return mTransport.handleFoundPeer(remotePID);
        }
        return false;
    }

    public static void NBHandleLostPeer(String remotePID) {
        if (mTransport != null) {
            mTransport.handleLostPeer(remotePID);
        }
    }

    public static void NBReceiveFromPeer(String remotePID, byte[] payload) {
        if (mTransport != null) {
            mTransport.receiveFromPeer(remotePID, payload);
        }
    }
}
