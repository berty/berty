package tech.berty.gobridge.nearbydriver.base;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.collection.SimpleArrayMap;

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
import com.google.android.gms.nearby.connection.Strategy;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import java.io.File;
import java.lang.ref.WeakReference;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import tech.berty.gobridge.nearbydriver.lifecycle.UserAcceptCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserConnectionCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserMessageCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserRequestCallback;
import tech.berty.gobridge.nearbydriver.lifecycle.UserSearchCallback;
import tech.berty.gobridge.nearbydriver.model.Endpoint;
import tech.berty.gobridge.nearbydriver.util.BertyLogger;

// Make the NBDriver class a Singleton
public class NearbyDriver {
    private static final String TAG = "bty.NearbyDriverSDK";

    private WeakReference<Context> mAppContext;
    private ConnectionsClient mConnectionsClient;
    private static volatile NearbyDriver mNBDriver;

    private final SimpleArrayMap<Long, Payload> incomingFiles = new SimpleArrayMap<>();

    private Map<String, Endpoint> foundMap = new ConcurrentHashMap<>();
    private Map<String, Endpoint> connectedMap = new ConcurrentHashMap<>();

    private NearbyDriver(Context context) {
        BertyLogger.d(TAG, "new NDBDriver instance");
        if (mNBDriver != null) {
            throw new RuntimeException("Use getInstance() method to get the singleton instance of this class");
        }

        mAppContext = new WeakReference<>(context.getApplicationContext());

        mConnectionsClient = Nearby.getConnectionsClient(context);
    }

    // Singleton method
    public static synchronized NearbyDriver getInstance(Context appContext) {
        BertyLogger.d(TAG, "getInstance called");
        if (mNBDriver == null) {
            mNBDriver = new NearbyDriver(appContext);
        }
        return mNBDriver;
    }

    /**
     * Start searching.
     *
     * @param channel            the channel
     * @param userSearchCallback the user search callback
     */
    public void startSearching(String channel, final UserSearchCallback userSearchCallback) {
        mConnectionsClient.startDiscovery(channel, new EndpointDiscoveryCallback() {
            @Override
            public void onEndpointFound(@NonNull String endpointId, @NonNull DiscoveredEndpointInfo discoveredEndpointInfo) {

                // kept info for connection
                if (!foundMap.containsKey(endpointId)) {
                    Log.d(TAG, "New User Found");
                    foundMap.put(endpointId, new Endpoint(endpointId, discoveredEndpointInfo.getEndpointName()));
                } else {
                    // check if onDisconnect is always called
                    Log.d(TAG, "User already Found");
                    return;
                }

                userSearchCallback.onUserFound(discoveredEndpointInfo.getEndpointName(), endpointId);
            }

            @Override
            public void onEndpointLost(@NonNull String endpointId) {
                // Make sure the user is gone
                disconnectFrom(endpointId);

                // Remove from foundMap
                if (foundMap.get(endpointId) != null) {
                    foundMap.remove(endpointId);
                }

                // pass userLost
                userSearchCallback.onUserLost(endpointId);
            }
        }, new DiscoveryOptions.Builder().setStrategy(Strategy.P2P_CLUSTER).build())
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        BertyLogger.d("BertySDK", "Searching started");
                    }
                }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
                BertyLogger.d("BertySDK", "Searching failed: " + e.toString());
            }
        });
    }

    /**
     * Stop searching.
     */
    public void stopSearching() {
        mConnectionsClient.stopDiscovery();
    }

    /**
     * Start sharing.
     *
     * @param name                   the name
     * @param channel                the channel
     * @param userConnectionCallback the user connection callback
     */
    public void startSharing(String name, String channel, final UserConnectionCallback userConnectionCallback) {
        mConnectionsClient.startAdvertising(name, channel, new ConnectionLifecycleCallback() {
            @Override
            public void onConnectionInitiated(@NonNull String endpointId, @NonNull ConnectionInfo connectionInfo) {
                onHandleConnectionRequested(userConnectionCallback, endpointId, connectionInfo);
                //userConnectionCallback.onConnectionRequested(connectionInfo.getEndpointName(), endpointId, connectionInfo.isIncomingConnection());
            }


            @Override
            public void onConnectionResult(final String endpointId, ConnectionResolution result) {
                switch (result.getStatus().getStatusCode()) {
                    case ConnectionsStatusCodes.STATUS_OK: {
                        handleConnectedToEndpoint(endpointId, userConnectionCallback);
                        break;
                    }
                    case ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED:
                    default: {
                        handleRejectedConnection(endpointId, userConnectionCallback);
                    }
                }
            }

            @Override
            public void onDisconnected(@NonNull String endpointId) {
               handleOnDisconnected(userConnectionCallback, endpointId);
            }
        }, new AdvertisingOptions.Builder().setStrategy(Strategy.P2P_CLUSTER).build())
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        BertyLogger.d("BertySDK", "Sharing success");
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        BertyLogger.d("BertySDK", "Sharing failed: "  + e.toString());
                    }
                });
    }

    private void handleRejectedConnection(String endpointId, UserConnectionCallback userConnectionCallback) {
        BertyLogger.d("BertySDK", "Failed to connect to " + endpointId);

        Endpoint endpoint = foundMap.get(endpointId);
        if (endpoint == null) {
            Log.e(TAG, String.format("onConnectionResult error: endpointId=%s unknown", endpointId));
            return ;
        }

        BertyLogger.d("BertySDK", "Rejected endpoint removed " + endpointId);

        // Remove from found
        foundMap.remove(endpointId);

        userConnectionCallback.onConnectionResult(endpointId, endpoint.getName(), false);
    }

    private void handleConnectedToEndpoint(String endpointId, UserConnectionCallback userConnectionCallback) {
        Endpoint endpoint = foundMap.get(endpointId);
        if (endpoint == null) {
            Log.e(TAG, String.format("onConnectionResult error: endpointId=%s unknown", endpointId));
            return ;
        }

        BertyLogger.d("BertySDK", "Connected to " + endpointId);

        // place in connected
        connectedMap.put(endpointId, endpoint);

        userConnectionCallback.onConnectionResult(endpointId, endpoint.getName(), true);
    }

    private void onHandleConnectionRequested(UserConnectionCallback userConnectionCallback, String endpointId, ConnectionInfo connectionInfo) {
        Log.i(TAG, String.format("onConnectionRequested called: userName=%s userId=%s", connectionInfo.getEndpointName(), endpointId));

        // check if connection is incoming or not
        if (connectionInfo.isIncomingConnection()) {
            Log.d(TAG, "Incoming Connection");

            if (foundMap.get(endpointId) == null) {
                Log.d(TAG, "Incoming connection adding user");
                foundMap.put(endpointId, new Endpoint(endpointId, connectionInfo.getEndpointName()));

                userConnectionCallback.onConnectionRequested(connectionInfo.getEndpointName(), endpointId, true);
            } else {
                Log.d(TAG, "Duplicate connection - accept connection");
            }

        } else {
            // Connection is not incoming
            Log.d(TAG, "Not incoming connection");
        }

        // check for the endpoint and accept
        if (foundMap.get(endpointId) != null) {

            Log.d(TAG, "Connection is here you should accept");

            userConnectionCallback.onConnectionRequested(connectionInfo.getEndpointName(), endpointId, false);
        }
    }

    /**
     * Stop sharing.
     */
    public void stopSharing() {
        mConnectionsClient.stopAdvertising();
    }


    /**
     * Connect to.
     *
     * @param userName               the user name
     * @param userId                 the user id
     * @param userConnectionCallback the user connection callback
     */
    public void connectTo(final String userName, final String userId, final UserConnectionCallback userConnectionCallback, final UserRequestCallback userRequestCallback) {
        mConnectionsClient.requestConnection(userName, userId, new ConnectionLifecycleCallback() {
            @Override
            public void onConnectionInitiated(@NonNull String endpointId, @NonNull ConnectionInfo connectionInfo) {
                onHandleConnectionRequested(userConnectionCallback, endpointId, connectionInfo);
//                userConnectionCallback.onConnectionRequested(connectionInfo.getEndpointName(), endpointId, connectionInfo.isIncomingConnection());
            }


            @Override
            public void onConnectionResult(final String endpointId, ConnectionResolution result) {
                switch (result.getStatus().getStatusCode()) {
                    case ConnectionsStatusCodes.STATUS_OK: {
                        handleConnectedToEndpoint(endpointId, userConnectionCallback);
                        BertyLogger.d("BertySDK", "Connected to " + endpointId);
                        break;
                    }
                    case ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED:
                    default: {
                        handleRejectedConnection(endpointId, userConnectionCallback);
                        BertyLogger.d("BertySDK", "Failed to connect to " + endpointId);
                    }
                }
            }

            @Override
            public void onDisconnected(@NonNull String endpointId) {
                handleOnDisconnected(userConnectionCallback, endpointId);
            }
        }).addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                BertyLogger.d("BertySDK", "Connection Requested0");
                userRequestCallback.onConnectionRequested(true, userName, userId, 0);
            }
        }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
                BertyLogger.d("BertySDK", "Fail to request 0 " + e.toString());

                if (e.getMessage() != null) {
                    int getCode = Integer.parseInt(e.getMessage().replaceAll("[^0-9]", ""));
                    userRequestCallback.onConnectionRequested(false, userName, userId, getCode);
                } else {
                    userRequestCallback.onConnectionRequested(false, userName, userId, 0);
                }

            }
        });
    }

    private void handleOnDisconnected(UserConnectionCallback userConnectionCallback, String endpointId) {
        // Remove endpoint to make sure!
        disconnectFrom(endpointId);
        Log.d(TAG, "Disconnected from endpoint 100%");

        // Remove endpoint from connected
        Endpoint endpoint = connectedMap.get(endpointId);

        if (endpoint != null) {
            connectedMap.remove(endpointId);
        } else {
            Log.e(TAG, String.format("onDisconnected error: endpointId=%s not found", endpointId));
        }

        // Remove from found also
        if (foundMap.get(endpointId) != null) {
            foundMap.remove(endpointId);
        }

        userConnectionCallback.onDisconnected(endpointId, endpoint.getName());
    }


    /**
     * Accept connection.
     *
     * @param userId              the user id
     * @param userMessageCallback the user message callback
     */
    public void acceptConnection(final String userId, final UserMessageCallback userMessageCallback, final UserAcceptCallback userAcceptCallback) {
        mConnectionsClient.acceptConnection(userId, new PayloadCallback() {
            @Override
            public void onPayloadReceived(@NonNull String s, @NonNull Payload payload) {
                if (payload.getType() == Payload.Type.FILE) {
                    incomingFiles.put(payload.getId(), payload);
                    BertyLogger.d("BertySDK", "Payload File incoming ");
                } else {
                    try {
                        byte[] message = payload.asBytes();
                        userMessageCallback.onMessageReceived(s, message);
                    } catch (Exception e) {
                        BertyLogger.e("BertySDK", "Payload Received Error " + e.toString());
                    }
                }
            }

            @Override
            public void onPayloadTransferUpdate(@NonNull String s, @NonNull PayloadTransferUpdate payloadTransferUpdate) {
                if (payloadTransferUpdate.getStatus() == PayloadTransferUpdate.Status.SUCCESS) {
                    Payload payload = incomingFiles.remove(payloadTransferUpdate.getPayloadId());
                    BertyLogger.d("BertySDK", "Payload Success ");
                    if (payload != null) {
                        if (payload.getType() == Payload.Type.FILE) {
                            BertyLogger.d("BertySDK", "Payload File Success");
                            BertyLogger.d("BertySDK", "Payload File Length " + payload.asFile().getSize());
                            BertyLogger.d("BertySDK", "Payload File Bytes " + payload.asBytes());


                            File payloadFile = payload.asFile().asJavaFile();

                            if (payloadFile != null) {
                                BertyLogger.d("BertySDK", "Payload Not null");
                            } else {
                                BertyLogger.d("BertySDK", "Payload null");
                            }

                            userMessageCallback.onFileReceived(userId, payload.asFile().asJavaFile());
                        }
                    }
                } else if (payloadTransferUpdate.getStatus() == PayloadTransferUpdate.Status.IN_PROGRESS) {
                    BertyLogger.d("BertySDK", "Payload In transfer " + payloadTransferUpdate.getBytesTransferred() + " out of " + payloadTransferUpdate.getTotalBytes());
                }
            }
        }).addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                BertyLogger.d("BertySDK", "Accepted Connection Success0");
                userAcceptCallback.onConnectionAccepted(true, userId, 0);
            }
        }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
                BertyLogger.d("BertySDK", "Fail to accept0 " + e.toString());
                if (e.getMessage() != null) {
                    int getCode = Integer.parseInt(e.getMessage().replaceAll("[^0-9]", ""));
                    userAcceptCallback.onConnectionAccepted(false, userId, getCode);
                } else {
                    userAcceptCallback.onConnectionAccepted(false, userId, 0);
                }
            }
        });

    }

    /**
     * Disconnect from all.
     */
    public void rejectConnection(String endpointId) {
        mConnectionsClient.rejectConnection(endpointId);
    }

    /**
     * Disconnect from all.
     */
    public void disconnectFromAll() {
        mConnectionsClient.stopAllEndpoints();
    }


    /**
     * Disconnect from.
     *
     * @param userId the user id
     */
    public void disconnectFrom(String userId) {
        mConnectionsClient.disconnectFromEndpoint(userId);
    }

    /**
     * Send message.
     *
     * @param userId  the user id
     * @param message the message
     */
    public void sendMessage(String userId, final byte[] message) {
        try {
            mConnectionsClient.sendPayload(userId, Payload.fromBytes(message)).addOnSuccessListener(new OnSuccessListener<Void>() {
                @Override
                public void onSuccess(Void aVoid) {
                    BertyLogger.d("BertySDK", "Message sent successfully");
                }
            });
        } catch (Exception e) {
            BertyLogger.d("BertySDK", "Message sent failed");
        }
    }

    /**
     * Send file.
     *
     * @param userId the user id
     * @param file   the file
     */
    public void sendFile(String userId, File file) {
        BertyLogger.e("BertySDK", "File to be sent to " + userId + " , file size " + file.length());
        try {
            mConnectionsClient.sendPayload(userId, Payload.fromFile(file)).addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    BertyLogger.e("BertySDK", "File sending failed" + e.getMessage() + " : " + e.getCause() + " : " + Arrays.toString(e.getStackTrace()));
                }
            }).addOnSuccessListener(new OnSuccessListener<Void>() {
                @Override
                public void onSuccess(Void aVoid) {
                    BertyLogger.d("BertySDK", "File sending");

                }
            });
        } catch (Exception e) {
            BertyLogger.e("BertySDK", "File sent failed" + e.getMessage() + " : " + e.getCause() + " : " + Arrays.toString(e.getStackTrace()));
        }
    }

    /**
     *
     * @param userId
     * @return
     */
    public Endpoint getConnectedUser(String userId) {
        return connectedMap.get(userId);
    }

    /**
     *
     * @param userId
     * @param endpoint
     */
    public void putConnectedUser(String userId, Endpoint endpoint) {
        connectedMap.put(userId, endpoint);
    }

    /**
     *
     * @param name
     * @return
     */
    public Endpoint getEndpointFromName(String name) {
        String id;

        for (Endpoint endpoint: connectedMap.values()) {
            if (endpoint.getName().equals(name)) {
                return endpoint;
            }
        }
        return null;
    }
}
