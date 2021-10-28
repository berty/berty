package tech.berty.gobridge;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;

import android.util.Base64;
import android.content.SharedPreferences;
import android.content.Context;
import android.security.keystore.StrongBoxUnavailableException;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import bertybridge.NativeKeystoreDriver;

public class KeystoreDriver implements NativeKeystoreDriver {
    private final Context ctx;
    private static final int encodingFlags = Base64.URL_SAFE & Base64.NO_WRAP & Base64.NO_PADDING;

    public KeystoreDriver(Context ctx) {
        this.ctx = ctx;
    }

    public byte[] get(String key) throws Exception {
        String value = getSecureSharedPreferences().getString(key, null);
        if (value == null) {
          throw new FileNotFoundException(key + " has not been set");
        }
        return Base64.decode(value, encodingFlags);
    }

	public void put(String key, byte[] data) throws Exception {
        String b64Data = Base64.encodeToString(data, encodingFlags);
        getSecureSharedPreferences().edit().putString(key, b64Data).commit();
    }

    private SharedPreferences getSecureSharedPreferences() throws GeneralSecurityException, IOException {
        return EncryptedSharedPreferences.create(
            "secret_shared_prefs",
            MasterKey.DEFAULT_MASTER_KEY_ALIAS,
            this.ctx,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
    }
}
