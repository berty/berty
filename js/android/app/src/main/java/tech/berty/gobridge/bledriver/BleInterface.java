package tech.berty.gobridge.bledriver;

import android.content.Context;

import bertybridge.Bertybridge;
import bertybridge.ProximityDriver;
import bertybridge.ProximityTransport;

// BleInterface implements the Golang NativeDriver interface
// berty/go/internal/proximitytransport/nativedriver.go
public class BleInterface implements ProximityDriver {
    public static final String DefaultAddr = "/ble/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    public static final int ProtocolCode = 0x0042;
    public static final String ProtocolName = "ble";
    private static final String TAG = "bty.ble.BleInterface";
    private static ProximityTransport mTransport;
    private final Context mContext;
    private BleDriver mBleDriver;
    private Logger mLogger;

    public BleInterface(Context context, boolean useExternalLogger) {
        mContext = context;
        mLogger = new Logger(false, useExternalLogger);
    }

    public static boolean BLEHandleFoundPeer(String remotePID) {
        if (mTransport != null) {
            return mTransport.handleFoundPeer(remotePID);
        }
        return false;
    }

    public static void BLEHandleLostPeer(String remotePID) {
        if (mTransport != null) {
            mTransport.handleLostPeer(remotePID);
        }
    }

    public static void BLEReceiveFromPeer(String remotePID, byte[] payload) {
        if (mTransport != null) {
            mTransport.receiveFromPeer(remotePID, payload);
        }
    }

    public static void BLELog(Logger.Level level, String message) {
        if (mTransport != null) {
            mTransport.log(level.getValue(), message);
        }
    }

    public void start(String localPID) {
        mLogger.d(TAG, "start driver");

        mTransport = Bertybridge.getProximityTransport(ProtocolName);
        if (mTransport == null) {
            mLogger.e(TAG, "proximityTransporter not found");
            return;
        }

        if ((this.mBleDriver = BleDriver.getInstance(mContext, mLogger)) == null) {
            mLogger.e(TAG, "can't get BleDriver instance");
            return;
        }
        this.mBleDriver.StartBleDriver(localPID);
    }

    public void stop() {
        if (this.mBleDriver != null) {
            this.mBleDriver.StopBleDriver();
            this.mBleDriver = null;
        }
        mTransport = null;
    }

    public boolean dialPeer(String remotePID) {
        return mBleDriver.peerManager().get(remotePID) != null;
    }

    public boolean sendToPeer(String remotePID, byte[] payload) {
        if (this.mBleDriver != null) {
            return this.mBleDriver.SendToPeer(remotePID, payload);
        }
        return false;
    }

    public void closeConnWithPeer(String remotePID) {
        mBleDriver.deviceManager().closeDeviceConnection(remotePID);
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
}
