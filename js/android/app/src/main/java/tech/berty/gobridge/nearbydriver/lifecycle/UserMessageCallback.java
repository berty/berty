package tech.berty.gobridge.nearbydriver.lifecycle;


import androidx.annotation.Keep;

import java.io.File;

/**
 * The type User message callback.
 */
@Keep
public abstract class UserMessageCallback {
    /**
     * Instantiates a new User message callback.
     */
    public UserMessageCallback() {
    }

    /**
     * On message received.
     *
     * @param userId  the user id
     * @param message the message
     */
    public abstract void onMessageReceived(String userId, byte[] message);

    /**
     * On file received.
     *
     * @param userId the user id
     * @param file   the file
     */
    public abstract void onFileReceived(String userId, File file);
}
