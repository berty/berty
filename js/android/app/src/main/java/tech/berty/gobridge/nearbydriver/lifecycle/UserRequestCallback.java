package tech.berty.gobridge.nearbydriver.lifecycle;

import androidx.annotation.Keep;

/**
 * The type User request callback.
 */
@Keep
public abstract class UserRequestCallback {


    /**
     * Instantiates a new User request callback.
     */
    public UserRequestCallback() { }


    /**
     * On connection requested.
     * @param success  the success
     * @param userName the user name
     * @param userId   the user id
     * @param errorCode
     */
    public abstract void onConnectionRequested(boolean success, String userName, String userId, int errorCode);
}
