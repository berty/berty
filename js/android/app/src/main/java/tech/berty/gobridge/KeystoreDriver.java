package tech.berty.gobridge;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;

import android.util.Log;
import android.util.LogPrinter;
import android.content.SharedPreferences;
import android.content.Context;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;

import bertybridge.NativeKeystoreDriver;

import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class KeystoreDriver implements NativeKeystoreDriver {
    private Context ctx;

    public KeystoreDriver(Context ctx) {
        this.ctx = ctx;
    }

    public String get(String key) throws Exception {
      String value = getSecureSharedPreferences().getString(key, null);
      if (value == null) {
        throw new FileNotFoundException(key + " has not been set");
      }
      return value;
    }

    public void put(String key, String value) throws Exception {
        getSecureSharedPreferences().edit().putString(key, value).commit();
    }

    private SharedPreferences getSecureSharedPreferences() throws GeneralSecurityException, IOException {
        return EncryptedSharedPreferences.create(
            "secret_shared_prefs",
            MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
            this.ctx,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
    }
}
