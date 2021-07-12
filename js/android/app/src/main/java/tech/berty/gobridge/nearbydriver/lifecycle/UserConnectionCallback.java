package tech.berty.gobridge.nearbydriver.lifecycle;

import androidx.annotation.Keep;

/**
 * The type User connection callback.
 */
@Keep
public abstract class UserConnectionCallback {

        /**
         * Instantiates a new User connection callback.
         */
        public UserConnectionCallback() { }

        /**
         * On connection requested.
         *
         * @param userName          the user name
         * @param endpointId        the endpoint id
         * @param isIncomingRequest the is incoming request
         */
        public abstract void onConnectionRequested(String userName, String endpointId, boolean isIncomingRequest);

        /**
         *
         * @param userId
         * @param userName
         * @param isConnected
         */
        public abstract void onConnectionResult(String userId, String userName, boolean isConnected);

        /**
         * On disconnected.
         *
         * @param userId the user id
         * @param name
         */
        public abstract void onDisconnected(String userId, String name);
}
