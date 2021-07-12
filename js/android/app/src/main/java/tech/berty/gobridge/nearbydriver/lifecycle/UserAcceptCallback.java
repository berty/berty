package tech.berty.gobridge.nearbydriver.lifecycle;

import androidx.annotation.Keep;

/**
 * The type User accept callback.
 */
@Keep
public abstract class UserAcceptCallback {


    /**
     * Instantiates a new User accept callback.
     */
    public UserAcceptCallback() { }


    /**
     * On connection accepted.
     *  @param success the success
     * @param userId  the user id
     * @param getCode
     */
    public abstract void onConnectionAccepted(boolean success, String userId, int getCode);
}
