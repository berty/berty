package tech.berty.gobridge.nearby;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.connection.AdvertisingOptions;
import com.google.android.gms.nearby.connection.ConnectionInfo;
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback;
import com.google.android.gms.nearby.connection.ConnectionResolution;
import com.google.android.gms.nearby.connection.ConnectionsClient;
import com.google.android.gms.nearby.connection.ConnectionsStatusCodes;
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo;
import com.google.android.gms.nearby.connection.DiscoveryOptions;
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback;
import com.google.android.gms.nearby.connection.Payload;
import com.google.android.gms.nearby.connection.PayloadCallback;
import com.google.android.gms.nearby.connection.PayloadTransferUpdate;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;

import static androidx.core.content.ContextCompat.checkSelfPermission;
import static com.google.android.gms.nearby.connection.Strategy.P2P_CLUSTER;

// Make the NBDriver class a Singleton
public class NBDriver {
    private static final String TAG = "bty.nearby.NBDriver";

    private static final String[] REQUIRED_PERMISSIONS =
        new String[]{
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION,
        };

    private static final String SERVICE_ID = "tech.berty.bty.nearby";

    private static volatile NBDriver mNBDriver;

    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

    private Context mAppContext;
    private ConnectionsClient mConnectionsClient;
    private String mPeerID;

    private boolean mStarted = false;
    private boolean mIsAdvertising = false;
    private boolean mIsDiscovering = false;

    private final Map<String, Endpoint> mConnections = new HashMap<>();
    private final Object mLock = new Object();

    // Callbacks for connections to other devices.
    private final ConnectionLifecycleCallback mConnectionLifecycleCallback =
        new ConnectionLifecycleCallback() {
            @Override
            public void onConnectionInitiated(String endpointId, ConnectionInfo connectionInfo) {
                Log.d(TAG, String.format("onConnectionInitiated: endpointId=%s connectionInfo=%s", endpointId, connectionInfo.getEndpointName()));

                synchronized (mLock) {
                    Endpoint endpoint = new Endpoint(endpointId, connectionInfo.getEndpointName());
                    mConnections.put(endpointId, endpoint);
                }

                mConnectionsClient.acceptConnection(endpointId, mPayloadCallback);
            }

            @Override
            public void onConnectionResult(String endpointId, ConnectionResolution result) {
                Log.v(TAG, String.format("onConnectionResult: endpointId=%s result=%s", endpointId, result));

                Endpoint endpoint;

                synchronized (mLock) {
                    endpoint = mConnections.get(endpointId);
                }
                if (endpoint == null) {
                    Log.e(TAG, String.format("onConnectionResult error: endpoint not found: %s", endpointId));
                    return;
                }

                switch (result.getStatus().getStatusCode()) {
                    case ConnectionsStatusCodes.STATUS_OK:
                        // We're connected! Can now start sending and receiving data.
                        Log.i(TAG, "onConnectionResult: connection successfully");
                        endpoint.setConnected(true);
                        NBInterface.NBHandleFoundPeer(endpoint.getName());
                        break;
                    case ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED:
                        Log.i(TAG, "onConnectionResult: the connection was rejected by one or both sides");
                        break;
                    case ConnectionsStatusCodes.STATUS_ERROR:
                        Log.e(TAG, "onConnectionResult error: the connection broke before it was able to be accepted");
                        break;
                    default:
                        //
                        Log.e(TAG, "onConnectionResult error: Unknown status code");
                }

            }

            @Override
            public void onDisconnected(String endpointId) {
                Log.v(TAG, String.format("onDisconnected called: endPointId=%s", endpointId));

                Endpoint endpoint;

                synchronized(mLock) {
                    endpoint = mConnections.remove(endpointId);
                }
                if (endpoint == null) {
                    Log.e(TAG, String.format("onDisconnected error: endpoint not found: %s", endpointId));
                    return;
                }

                Log.i(TAG, String.format("onDisconnected: endPointId=%s endPointName=%s", endpointId, endpoint.getName()));
                NBInterface.NBHandleLostPeer(endpoint.getName());
            }
        };

    private final PayloadCallback mPayloadCallback =
        new PayloadCallback() {
            @Override
            public void onPayloadReceived(String endpointId, Payload payload) {
                Log.v(TAG, String.format("onPayloadReceived called: endpoint=%s", endpointId));

                Endpoint endpoint;

                synchronized(mLock) {
                    endpoint = mConnections.get(endpointId);
                }
                if (endpoint == null || !endpoint.connected) {
                    Log.e(TAG, String.format("onPayloadReceived error: endpoint not found: %s", endpointId));
                    return;
                }
                Log.d(TAG, String.format("onPayloadReceived: endpointId=%s peerID=%s base64=%s value=%s", endpointId, endpoint.getName(), Base64.getEncoder().encodeToString(payload.asBytes()), bytesToHex(payload.asBytes())));

                NBInterface.NBReceiveFromPeer(endpoint.getName(), payload.asBytes());
            }

            @Override
            public void onPayloadTransferUpdate(String endpointId, PayloadTransferUpdate update) {
                Log.d(TAG, String.format("onPayloadTransferUpdate: endpointId=%s, update=%s", endpointId, update));
            }
        };

    private NBDriver(Context context) {
        Log.d(TAG, "new NDBDriver instance");
        if (mNBDriver != null) {
            throw new RuntimeException("Use getInstance() method to get the singleton instance of this class");
        }
        mAppContext = context;
        mConnectionsClient = Nearby.getConnectionsClient(context);
    }

    // Singleton method
    public static synchronized NBDriver getInstance(Context appContext) {
        Log.d(TAG, "getInstance called");
        if (mNBDriver == null) {
            mNBDriver = new NBDriver(appContext);
        }
        return mNBDriver;
    }

    public boolean hasPermissions(Context context, String... permissions) {
        for (String permission : permissions) {
            if (checkSelfPermission(context, permission)
                != PackageManager.PERMISSION_GRANTED) {
                Log.e(TAG, String.format("hasPermissions error: permission=%s not GRANTED", permission));
                return false;
            }
        }
        Log.d(TAG, String.format("hasPermissions: all permissions are GRANTED"));
        return true;
    }

    public synchronized boolean isStarted() {
        return mStarted;
    }

    public synchronized void setStarted(boolean status) {
        mStarted = status;
    }

    public synchronized void StartNBDriver(String localPeerID) {
        Log.d(TAG, "StartNBDriver called");

        if (!hasPermissions(mAppContext, REQUIRED_PERMISSIONS)) {
            Log.e(TAG, "StartNBDriver error: required permissions missing");
            return;
        }

        if (isStarted()) {
            Log.w(TAG, "StartBleDriver(): Nearby driver is already on, one instance is allow");
            return;
        }

        mPeerID = localPeerID;
        startAdvertising();
        startDiscovering();

        Log.d(TAG, "StartNBDriver: start ok");
    }

    public synchronized void StopNBDriver() {
        if (!isStarted()) {
            Log.d(TAG, "driver is not started");
            return;
        }

        stopDiscovering();
        stopAdvertising();
        mConnectionsClient.stopAllEndpoints();
        setStarted(false);
    }

    public boolean SendToPeer(String remotePID, byte[] payload) {
        Log.v(TAG, String.format("onPayloadReceived called: remotePID=%s", remotePID));

        Endpoint endpoint = findPeer(remotePID);

        if (endpoint == null || !endpoint.connected) {
            Log.e(TAG, String.format("SendToPeer error: endpoint not found: peerID=%s", remotePID));
            return false;
        }

        Log.d(TAG, String.format("SendToPeer: endpointId=%s remotePID=%s base64=%s value=%s", endpoint.getId(), remotePID, Base64.getEncoder().encodeToString(payload), bytesToHex(payload)));

        mConnectionsClient
            .sendPayload(endpoint.getId(), Payload.fromBytes(payload))
            .addOnFailureListener(
                new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, String.format("SendToPeer: sendPayload failed: endpointId=%s error=%s", endpoint.getId(), e));
                    }
                });

        return true;
    }

    public void startAdvertising() {
        Log.d(TAG, "startAdvertising called");

        if (mIsAdvertising) {
            Log.w(TAG, "startAdvertising: advertising already on");
            return ;
        }

        mIsAdvertising = true;

        AdvertisingOptions advertisingOptions =
            new AdvertisingOptions.Builder().setStrategy(P2P_CLUSTER).build();
        mConnectionsClient
            .startAdvertising(
                mPeerID, SERVICE_ID, mConnectionLifecycleCallback, advertisingOptions)
            .addOnSuccessListener(
                new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void unusedResult) {
                        Log.i(TAG, String.format("startAdvertising: started: service=%s endpointName=%s", SERVICE_ID, mPeerID));
                    }
                })
            .addOnFailureListener(
                new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, "startAdvertising error:", e);
                        mIsAdvertising = false;
                    }
                });
    }

    public void stopAdvertising() {
        Log.v(TAG, "stopAdvertising called");

        if (!mIsAdvertising) {
            Log.w(TAG, "stopAdvertising: advertising already off");
            return;
        }

        mIsAdvertising = false;
        mConnectionsClient.stopAdvertising();
    }

    protected void startDiscovering() {
        Log.d(TAG, "startDiscovering called");

        if (mIsDiscovering) {
            Log.w(TAG, "startDiscovering: discovering already on");
            return ;
        }

        mIsDiscovering = true;

        mConnectionsClient
            .startDiscovery(
                SERVICE_ID,
                new EndpointDiscoveryCallback() {
                    @Override
                    public void onEndpointFound(String endpointId, DiscoveredEndpointInfo info) {
                        Log.d(TAG, String.format("onEndpointFound: endpointId=%s, endpointName=%s)", endpointId, info.getEndpointName()));

                        if (SERVICE_ID.equals(info.getServiceId())) {
                            connectToEndpoint(endpointId, info.getEndpointName());
                        } else {
                            Log.w(TAG, String.format("onEndpointFound error: wrong service=%s", info.getServiceId()));
                        }
                    }

                    @Override
                    public void onEndpointLost(String endpointId) {
                        Log.d(TAG, String.format("onEndpointLost: endpointId=%s", endpointId));
                    }
                },
                new DiscoveryOptions.Builder().setStrategy(P2P_CLUSTER).build())
            .addOnSuccessListener(
                new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void unusedResult) {
                        Log.i(TAG, String.format("startDiscovering: started: service=%s", SERVICE_ID));
                    }
                })
            .addOnFailureListener(
                new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, "startDiscovering error:", e);
                        mIsDiscovering = false;
                    }
                });
    }

    public void stopDiscovering() {
        Log.v(TAG, "stopDiscovering called");

        if (!mIsDiscovering) {
            Log.w(TAG, "stopDiscovering: discovering already off");
            return;
        }

        mIsDiscovering = false;
        mConnectionsClient.stopDiscovery();
    }

    private void connectToEndpoint(final String endpointId, final String endpointName) {
        Log.d(TAG, String.format("connectToEndpoint: endpointId=%s", endpointId));

        synchronized (mLock) {
         if (mConnections.get(endpointId) != null || findPeer(endpointName) != null) {
                Log.d(TAG, String.format("connectToEndpoint: endpoint already known, cancel connection: endpointId=%s", endpointId));
                return;
            }
        }
        mConnectionsClient
            .requestConnection(mPeerID, endpointId, mConnectionLifecycleCallback)
            .addOnFailureListener(
                new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, String.format("connectToEndpoint error: requestConnection failed: endpointId=%s error=%s", endpointId, e));
                    }
                });
    }

    public static String bytesToHex(byte[] bytes) {
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }

    public Endpoint findPeer(String peerID) {
        synchronized (mLock) {
            for (Endpoint endpoint : mConnections.values()) {
                if (endpoint.getName().equals(peerID) && endpoint.isConnected()) {
                    return endpoint;
                }
            }
        }
        return null;
    }

    public void closeConn(String peerID) {
        Log.v(TAG, String.format("closeConn called: peerID=%s", peerID));

        Endpoint endpoint;

        if ((endpoint = findPeer(peerID)) != null) {
            mConnectionsClient.disconnectFromEndpoint(endpoint.getId());
        } else {
            Log.e(TAG, "closeConn error: endpoint nor found");
        }
    }

    protected class Endpoint {
        @NonNull private final String id;
        @NonNull private final String name;
        private boolean connected = false;

        private Endpoint(@NonNull String id, @NonNull String name) {
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
}
