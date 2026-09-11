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
    private static volatile ProximityTransport mTransport;
    private static final Object mTransportLock = new Object();
    private final Context mContext;
    // Lock object for synchronized access to mBleDriver
    private final Object mDriverLock = new Object();
    private BleDriver mBleDriver;
    private Logger mLogger;

    public BleInterface(Context context, boolean useExternalLogger) {
        mContext = context;
        mLogger = new Logger(false, useExternalLogger);
    }

    public static boolean BLEHandleFoundPeer(String remotePID) {
        synchronized (mTransportLock) {
            if (mTransport != null) {
                return mTransport.handleFoundPeer(remotePID);
            }
        }
        return false;
    }

    public static void BLEHandleLostPeer(String remotePID) {
        synchronized (mTransportLock) {
            if (mTransport != null) {
                mTransport.handleLostPeer(remotePID);
            }
        }
    }

    public static void BLEReceiveFromPeer(String remotePID, byte[] payload) {
        synchronized (mTransportLock) {
            if (mTransport != null) {
                mTransport.receiveFromPeer(remotePID, payload);
            }
        }
    }

    public static void BLELog(Logger.Level level, String message) {
        synchronized (mTransportLock) {
            if (mTransport != null) {
                mTransport.log(level.getValue(), message);
            }
        }
    }

    public void start(String localPID) {
        mLogger.d(TAG, "start driver");

            synchronized (mTransportLock) {
            mTransport = Bertybridge.getProximityTransport(ProtocolName);
            if (mTransport == null) {
                mLogger.e(TAG, "proximityTransporter not found");
                return;
            }
        }

        synchronized (mDriverLock) {
            if ((this.mBleDriver = BleDriver.getInstance(mContext, mLogger)) == null) {
                mLogger.e(TAG, "can't get BleDriver instance");
                synchronized (mTransportLock) {
                    mTransport = null;
                }
                return;
            }
            this.mBleDriver.StartBleDriver(localPID);
        }
    }

    public void stop() {
        synchronized (mDriverLock) {
            if (this.mBleDriver != null) {
                this.mBleDriver.StopBleDriver();
                this.mBleDriver = null;
            }
        }
            synchronized (mTransportLock) {
            mTransport = null;
        }
    }

    public boolean dialPeer(String remotePID) {
        synchronized (mDriverLock) {
            if (mBleDriver == null || mBleDriver.peerManager() == null) {
                return false;
            }
            return mBleDriver.peerManager().get(remotePID) != null;
        }
    }

    public boolean sendToPeer(String remotePID, byte[] payload) {
        synchronized (mDriverLock) {
            if (this.mBleDriver != null) {
                return this.mBleDriver.SendToPeer(remotePID, payload);
            }
        }
        return false;
    }

    public void closeConnWithPeer(String remotePID) {
        synchronized (mDriverLock) {
            if (mBleDriver != null && mBleDriver.deviceManager() != null) {
                mBleDriver.deviceManager().closeDeviceConnection(remotePID);
            }
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
}
