package tech.berty.bertybridgeexpo.gobridge;

import java.io.FileNotFoundException;
import java.security.KeyStore;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.content.SharedPreferences;
import android.content.Context;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

import bertybridge.NativeKeystoreDriver;

public class KeystoreDriver implements NativeKeystoreDriver {
    private final SecretKey secretKey;
    private final SharedPreferences sharedPreferences;

    private static final int encodingFlags = Base64.URL_SAFE & Base64.NO_WRAP & Base64.NO_PADDING;
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_SIZE = 12; // 96 bits, recommended for GCM
    private static final int TAG_LENGTH = 128;

    public KeystoreDriver(Context ctx) throws Exception {
        this.sharedPreferences = ctx.getSharedPreferences("secret_shared_prefs", Context.MODE_PRIVATE);
        this.secretKey = getOrCreateSecretKey();
    }

    public SecretKey getOrCreateSecretKey() throws Exception {
        final String alias = "berty_key_alias";
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);

        // Check if key already exists
        if (keyStore.containsAlias(alias)) {
            return ((SecretKey) keyStore.getKey(alias, null));
        }

        // If not, create it
        KeyGenParameterSpec keyGenParameterSpec = new KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(false) // Or true for extra security
            .build();

        KeyGenerator keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        );
        keyGenerator.init(keyGenParameterSpec);
        return keyGenerator.generateKey();
    }

    public static String encrypt(String plainText, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] iv = cipher.getIV(); // Retrieve the random IV the Cipher generated
        byte[] ciphertext = cipher.doFinal(plainText.getBytes("UTF-8"));

        // Combine IV and ciphertext for storage
        byte[] combined = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

        return Base64.encodeToString(combined, Base64.DEFAULT);
    }

    public static String decrypt(String base64CipherText, SecretKey key) throws Exception {
        byte[] combined = Base64.decode(base64CipherText, Base64.DEFAULT);
        byte[] iv = new byte[IV_SIZE];
        byte[] ciphertext = new byte[combined.length - IV_SIZE];

        System.arraycopy(combined, 0, iv, 0, IV_SIZE);
        System.arraycopy(combined, IV_SIZE, ciphertext, 0, ciphertext.length);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        byte[] plainText = cipher.doFinal(ciphertext);

        return new String(plainText, "UTF-8");
    }

    public byte[] get(String key) throws Exception {
        String encrypted = sharedPreferences.getString(key, null);
        if (encrypted == null) {
          throw new FileNotFoundException(key + " has not been set");
        }
        String decrypted = decrypt(encrypted, this.secretKey);
        return Base64.decode(decrypted, encodingFlags);
    }

	public void put(String key, byte[] data) throws Exception {
        String b64Data = Base64.encodeToString(data, encodingFlags);
        String encrypted = encrypt(b64Data, this.secretKey);
        sharedPreferences.edit().putString(key, encrypted).apply();
    }
}
