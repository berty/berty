package tech.berty.gobridge.nearbydriver.lifecycle;

import androidx.annotation.Keep;

/**
 * The type User search callback.
 */
@Keep
public abstract class UserSearchCallback {
    /**
     * Instantiates a new User search callback.
     */
    public UserSearchCallback() {
    }

    /**
     * On user found.
     *
     * @param userName the user name
     * @param userId   the user id
     */
    public abstract void onUserFound(String userName, String userId);

    /**
     * On user lost.
     *
     * @param userId the user id
     */
    public abstract void onUserLost(String userId);
}
