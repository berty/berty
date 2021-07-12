package tech.berty.gobridge;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;
import android.util.Base64;

import bertybridge.Bertybridge;
import bertybridge.ProximityDriver;

import java.io.File;
import java.nio.charset.StandardCharsets;

import bertybridge.ProximityTransport;
import tech.berty.gobridge.nearbydriver.base.NearbyDriver;
import tech.berty.gobridge.nearbydriver.lifecycle.UserAcceptCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserConnectionCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserMessageCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserRequestCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserSearchCallback;
import tech.berty.gobridge.nearbydriver.model.Endpoint;

import static androidx.core.content.ContextCompat.checkSelfPermission;

public class BertyNearbyDriver implements ProximityDriver {
    private static final String TAG = "bty.NearbyDriver";

    private static final String SERVICE_ID = "tech.berty.bty.nearby";

    private static final String[] REQUIRED_PERMISSIONS =
        new String[]{
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION,
        };

    public static final String DefaultAddr = "/nearby/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    public static final int ProtocolCode = 0x0044;
    public static final String ProtocolName = "nearby";

    private final NearbyDriver nearby;
    private final Context mContext;
    private String localPID;

    private static ProximityTransport mTransport;

    UserConnectionCallback userConnectionCallback = new UserConnectionCallback() {
        // onConnectionRequested is the entry point for incoming connections
        // we have to check if there are duplicated endpoints
        @Override
        public void onConnectionRequested(String endpointName, String endpointId, boolean isIncomingRequest) {
            Log.i(TAG, String.format("onConnectionRequested called: userId=%s userName=%s", endpointId, endpointName));

            nearby.acceptConnection(endpointId, userMessageCallback, userAcceptCallback);
        }

        @Override
        public void onConnectionResult(final String endpointId, String endpointName, boolean isConnected) {
            Log.i(TAG, String.format("onConnectionResult called: userId=%s userName=%s", endpointId, endpointName));

            if (isConnected) {
                Log.i(TAG, "Connected");
                // inform BertyBridge that there is a new connection
                mTransport.handleFoundPeer(endpointName);
            } else {
                Log.e(TAG, "Rejected");
                // connection was rejected this has to be added later on
                Log.e(TAG, String.format("onConnectionResult REJECTED: endpointId=%s unknown", endpointId));
            }
        }

        @Override
        public void onDisconnected(String endpointId, String endpointName) {
            Log.i(TAG, String.format("onDisconnected called: userId=%s userName=%s", endpointId, endpointName));

            // inform BertyBridge that there is a new connection
            mTransport.handleLostPeer(endpointName);
        }
    };

    UserMessageCallback userMessageCallback = new UserMessageCallback() {
        @Override
        public void onMessageReceived(String userId, byte[] payload) {
            Log.d(TAG, String.format("onMessageReceived: userId=%s payload=%s payload(hex)=%s", userId, Base64.encodeToString(payload, Base64.DEFAULT), bytesToHex(payload)));
            Endpoint endpoint = nearby.getConnectedUser(userId);
            if (endpoint == null) {
                Log.e(TAG, String.format("onMessageReceived error: endpointId=%s not found", userId));
                return ;
            }

            mTransport.receiveFromPeer(endpoint.getName(), payload);
        }

        @Override
        public void onFileReceived(String userId, File file) {
        }
    };

    UserSearchCallback userSearchCallback = new UserSearchCallback() {
        // onUserFound is the entry point for outgoing connections
        // we have to check if there are duplicated endpoints
        @Override
        public void onUserFound(String userName, String userId) {
            Log.i(TAG, String.format("onUserFound called: userName=%s userId=%s", userName, userId));

            // Request and accept connection since both run at the same time there is no client/server
            //nearby.acceptConnection(userId, userMessageCallback, userAcceptCallback);
            nearby.connectTo(localPID, userId, userConnectionCallback, userRequestCallback);
        }

        @Override
        public void onUserLost(String userId) {
            Log.i(TAG, String.format("onUserLost called: userId=%s", userId));
        }
    };

    private final UserAcceptCallback userAcceptCallback = new UserAcceptCallback() {
        @Override
        public void onConnectionAccepted(boolean success, String userId, int error) {
            Log.i(TAG, "Connection accept: " + success + " : " + userId);

            // Check if connection is not accepted and request
            // We could handle error case here also accept request
            if (!success) {
                nearby.connectTo(localPID, userId, userConnectionCallback, userRequestCallback);
            }
        }
    };

    private final UserRequestCallback userRequestCallback = new UserRequestCallback() {
        @Override
        public void onConnectionRequested(boolean requested, String userName, String userId, int error) {
            Log.i(TAG, "Connection request: " + requested + " : " + userName + " : " + userId);

            // Handle multiple requests when error code
            if (error == 8012) {
                nearby.connectTo(localPID, userId, userConnectionCallback, userRequestCallback);
            }
        }
    };

    public BertyNearbyDriver(Context context) {
        this.mContext = context;

        // init driver and bridge
        nearby = NearbyDriver.getInstance(context.getApplicationContext());
    }

    private boolean hasPermissions(Context context, String... permissions) {
        for (String permission : permissions) {
            if (checkSelfPermission(context, permission)
                != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, String.format("hasPermissions error: permission=%s not GRANTED", permission));
                return false;
            }
        }
        Log.d(TAG, "hasPermissions: all permissions are GRANTED");
        return true;
    }

    @Override
    public void start(String localPID) {
        this.localPID = localPID;

        mTransport = Bertybridge.getProximityTransport(ProtocolName);
        if (mTransport == null) {
            Log.e(TAG, "proximityTransporter not found");
            return ;
        }

        if (!hasPermissions(mContext, REQUIRED_PERMISSIONS))
        {
            Log.e(TAG, "start error: canceled");
            return ;
        }

        nearby.startSearching(SERVICE_ID, userSearchCallback);
        nearby.startSharing(localPID, SERVICE_ID, userConnectionCallback);
    }

    @Override
    public void stop() {
        nearby.stopSharing();
        nearby.stopSearching();
    }

    @Override
    public boolean dialPeer(String remotePID) {
        return nearby.getEndpointFromName(remotePID) != null;
    }

    @Override
    public boolean sendToPeer(String remotePID, byte[] payload) {
        Log.d(TAG, String.format("sendToPeer: userName=%s payload=%s payload(hex)=%s", remotePID, Base64.encodeToString(payload, Base64.DEFAULT), bytesToHex(payload)));
        Endpoint endpoint = nearby.getEndpointFromName(remotePID);

        if (endpoint != null) {
            nearby.sendMessage(endpoint.getId(), payload);

            return true;
        }

        Log.e(TAG, String.format("sendToPeer error: remotePID=%s not found", remotePID));
            return false;
    }

    @Override
    public void closeConnWithPeer(String remotePID) {
        Endpoint endpoint = nearby.getEndpointFromName(remotePID);

        if (endpoint != null) {
            nearby.disconnectFrom(endpoint.getId());
        }
    }

    @Override
    public long protocolCode() {
        return ProtocolCode;
    }

    @Override
    public String protocolName() {
        return ProtocolName;
    }

    @Override
    public String defaultAddr() {
        return DefaultAddr;
    }

    public static String bytesToHex(byte[] bytes) {
        final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }
}
