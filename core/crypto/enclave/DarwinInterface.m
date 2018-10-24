// +build darwin

#import "DarwinInterface.h"

// Define label and tag for keychain entry
#define LABEL @"Berty Messaging Key"
#define tag(keyID) [[NSString stringWithUTF8String:keyID] dataUsingEncoding:NSUTF8StringEncoding]

// Generates a key pair and stores the private key in the Secure Enclave.
// Stores only 256-bit elliptic curve private keys (incompatible with RSA).
// This Darwin feature is only available on specific hardware:
// - iOS devices with an Apple A7 or later A-series processor
// - MacBook Pro with a Touch Bar
// To enable this feature on macOS, the binary needs to be signed with a Developer ID certificate
// and the entitlements must contains Keychain Sharing capability
// See: https://forums.developer.apple.com/thread/107586#327834
bool generateKeyPairWithinEnclave(const char *goKeyID) {
    bool success;
    SecKeyRef privateKeyRef;
    SecKeyRef publicKeyRef;
    CFErrorRef error = NULL;
    SecAccessControlRef access = SecAccessControlCreateWithFlags(
                                    kCFAllocatorDefault,
                                    kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
                                    kSecAccessControlPrivateKeyUsage,
                                    &error
                                );
    if (error) {
        NSLog(@"Error during access control flags creation: %@\n", error);
        CFRelease(error);
        if (access) { CFRelease(access); };
        return false;
    }

    NSDictionary *attributes =
        @{(id)kSecAttrKeyType:        (id)kSecAttrKeyTypeECSECPrimeRandom,
        (id)kSecAttrKeySizeInBits:  @256,
        (id)kSecAttrTokenID:        (id)kSecAttrTokenIDSecureEnclave,
        (id)kSecAttrIsPermanent:    @YES,
        (id)kSecAttrLabel:          LABEL,
        (id)kSecAttrApplicationTag: tag(goKeyID),
        (id)kSecPrivateKeyAttrs:
            @{(id)kSecAttrAccessControl:  (__bridge id)access},
        };

    OSStatus status = SecKeyGeneratePair((__bridge CFDictionaryRef)attributes, &publicKeyRef, &privateKeyRef);

    if (status != errSecSuccess) {
        NSLog(@"Error during access control flags creation of key with ID %s\n", goKeyID);
        success = false;
    } else {
        NSLog(@"Key with ID %s successfully generated within the enclave\n", goKeyID);
        CFRelease(publicKeyRef);
        CFRelease(privateKeyRef);
        success = true;
    }

    CFRelease(access);
    [attributes release];

    return success;
}
// Retrieves private key ref from the keychain.
// If the private key is stored inside the Secure Enclave, you can't access
// to the key value, you can only use it through a reference to decrypt and sign.
SecKeyRef getPrivateKeyFromKeychain(const char *goKeyID) {
    SecKeyRef privateKeyRef;
    NSDictionary *query = @{(id)kSecClass:              (id)kSecClassKey,
                            (id)kSecAttrLabel:          LABEL,
                            (id)kSecAttrApplicationTag: tag(goKeyID),
                            (id)kSecAttrCanDecrypt:     @YES,
                            (id)kSecReturnRef:          @YES,
                            };

    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query,
                                            (CFTypeRef *)&privateKeyRef);

    [query release];
    if (status != errSecSuccess) {
        NSLog(@"Private key with id %s not found in keychain\n", goKeyID);
        if (privateKeyRef) { CFRelease(privateKeyRef); };
        return NULL;
    }

    return privateKeyRef;
}

// Retrieves public key ref from the keychain.
// If the private key is stored inside the Secure Enclave, you can still access
// to the corresponding public key value.
SecKeyRef getPublicKeyFromKeychain(const char *goKeyID) {
    SecKeyRef publicKeyRef;
    NSDictionary *query = @{(id)kSecClass:              (id)kSecClassKey,
                            (id)kSecAttrLabel:          LABEL,
                            (id)kSecAttrApplicationTag: tag(goKeyID),
                            (id)kSecAttrCanEncrypt:     @YES,
                            (id)kSecReturnRef:          @YES,
                            };

    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query,
                                            (CFTypeRef *)&publicKeyRef);

    [query release];
    if (status != errSecSuccess) {
        NSLog(@"Public key with id %s not found in keychain\n", goKeyID);
        if (publicKeyRef) { CFRelease(publicKeyRef); };
        return NULL;
    }

    return publicKeyRef;
}

// Retrieves public key ref from the keychain then returns its X9.63 representation.
// If the private key is stored inside the Secure Enclave, you can still access
// to the corresponding public key value.
NSData *getPublicKeyX963Representation(const char *goKeyID) {
    NSData *publicKeyData = NULL;
    CFErrorRef error = NULL;
    SecKeyRef publicKeyRef = getPublicKeyFromKeychain(goKeyID);

    if (publicKeyRef) {
        publicKeyData = (__bridge NSData*)SecKeyCopyExternalRepresentation(publicKeyRef, &error);
        if (error) {
            NSLog(@"Error during copy of public key external representation");
            CFRelease(error);
        }
        CFRelease(publicKeyRef);
    }

    return publicKeyData;
}

// Deletes the key pair corresponding to the keyID parameter from the keychain
bool deleteKeyPairFromKeychain(const char *goKeyID) {
    bool ret;
    NSDictionary *queryPub = @{(id)kSecClass:              (id)kSecClassKey,
                                (id)kSecAttrLabel:          LABEL,
                                (id)kSecAttrApplicationTag: tag(goKeyID),
                                (id)kSecAttrCanEncrypt:     @YES,
                                (id)kSecReturnRef:          @YES,
                                };
    NSDictionary *queryPriv = @{(id)kSecClass:              (id)kSecClassKey,
                                (id)kSecAttrLabel:          LABEL,
                                (id)kSecAttrApplicationTag: tag(goKeyID),
                                (id)kSecAttrCanDecrypt:     @YES,
                                (id)kSecReturnRef:          @YES,
                                };

    OSStatus statusPub = SecItemDelete((__bridge CFDictionaryRef)queryPub);
    OSStatus statusPriv = SecItemDelete((__bridge CFDictionaryRef)queryPriv);

    if (statusPub != errSecSuccess || statusPriv != errSecSuccess) {
        NSLog(@"Error during deletion of key pair with id %s\n", goKeyID);
        ret = false;
    } else {
        NSLog(@"Key pair with id %s successfully deleted from the keychain\n", goKeyID);
        ret = true;
    }

    [queryPub release];
    [queryPriv release];

    return ret;
}

// Decrypts ciphertext using private key
NSData *decryptCiphertextUsingPrivateKey(const char *goKeyID, NSData *ciphertext) {
    NSData *plaintext = NULL;
    CFErrorRef error = NULL;
    SecKeyRef privateKeyRef = getPrivateKeyFromKeychain(goKeyID);
    if (privateKeyRef) {
        bool canDecrypt = SecKeyIsAlgorithmSupported(privateKeyRef,
                                                    kSecKeyOperationTypeDecrypt,
                                                    kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM);
        if (canDecrypt) {
            plaintext = (__bridge NSData*)(SecKeyCreateDecryptedData(
                            privateKeyRef,
                            kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM,
                            (__bridge CFDataRef)ciphertext,
                            &error)
                        );


            if (!plaintext) {
                NSLog(@"Error during text decryption using key with id %s: %@\n", goKeyID, error);
                CFRelease(error);
            }
        } else {
            NSLog(@"Error during text decryption using key with id %s: wrong algorithm\n", goKeyID);
        }

        CFRelease(privateKeyRef);
    } else {
        NSLog(@"Can't find public key with id %s\n", goKeyID);
    }

    return plaintext;
}

// Signs data using private key
NSData *signDataUsingPrivateKey(const char *goKeyID, NSData *data) {
    NSData* signature = NULL;
    CFErrorRef error = NULL;
    SecKeyRef privateKeyRef = getPrivateKeyFromKeychain(goKeyID);
    if (privateKeyRef) {
        bool canSign = SecKeyIsAlgorithmSupported(privateKeyRef,
                                                kSecKeyOperationTypeSign,
                                                kSecKeyAlgorithmECDSASignatureMessageX962SHA512);
        if (canSign) {
            signature = (__bridge NSData*)(SecKeyCreateSignature(
                                            privateKeyRef,
                                            kSecKeyAlgorithmECDSASignatureMessageX962SHA512,
                                            (__bridge CFDataRef)data,
                                            &error)
                                        );

            if (!signature) {
                NSLog(@"Error during signature generation using key with id %s: %@\n", goKeyID, error);
                CFRelease(error);
            }
        } else {
            NSLog(@"Error during signature generation using key with id %s: wrong algorithm\n", goKeyID);
        }

        CFRelease(privateKeyRef);
    } else {
        NSLog(@"Can't find private key with id %s\n", goKeyID);
    }

    return signature;
}

// TMP function for testing purpose
// Encrypts plaintext using public key
NSData *encryptPlaintextUsingPublicKey(const char *goKeyID, const char *goPlaintext) {
    NSString *plaintext = [NSString stringWithUTF8String:goPlaintext];
    CFErrorRef error = NULL;
    NSData *ciphertext = NULL;
    SecKeyRef publicKeyRef = getPublicKeyFromKeychain(goKeyID);
    if (publicKeyRef) {
        bool canEncrypt = SecKeyIsAlgorithmSupported(publicKeyRef,
                                                    kSecKeyOperationTypeEncrypt,
                                                    kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM);
        if (canEncrypt) {
            ciphertext = (__bridge NSData*)(SecKeyCreateEncryptedData(
                                                publicKeyRef,
                                                kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM,
                                                (__bridge CFDataRef)[plaintext dataUsingEncoding:NSUTF8StringEncoding],
                                                &error)
                                            );


            if (!ciphertext) {
                NSLog(@"Error during text encryption using key with id %s: %@\n", goKeyID, error);
                CFRelease(error);
            }
        } else {
            NSLog(@"Error during text encryption using key with id %s: wrong algorithm\n", goKeyID);
        }

        CFRelease(publicKeyRef);
    } else {
        NSLog(@"Can't find public key with id %s\n", goKeyID);
    }

    [plaintext release];

    return ciphertext;
}

// TMP function for testing purpose
// Verifies signature using public key
bool verifySignatureUsingPublicKey(const char *goKeyID, NSData *data, NSData *signature) {
    bool verification = false;
    CFErrorRef error = NULL;
    SecKeyRef publicKeyRef = getPublicKeyFromKeychain(goKeyID);
    if (publicKeyRef) {
        bool canVerify = SecKeyIsAlgorithmSupported(publicKeyRef,
                                                    kSecKeyOperationTypeVerify,
                                                    kSecKeyAlgorithmECDSASignatureMessageX962SHA512);
        if (canVerify) {
            verification = SecKeyVerifySignature(
                                                publicKeyRef,
                                                kSecKeyAlgorithmECDSASignatureMessageX962SHA512,
                                                (__bridge CFDataRef)data,
                                                (__bridge CFDataRef)signature,
                                                &error
                                            );
            if (!verification) {
                NSLog(@"Error during signature verification using key with id %s: %@\n", goKeyID, error);
                CFRelease(error);
            }
        } else {
            NSLog(@"Error during signature verification using key with id %s: wrong algorithm\n", goKeyID);
        }

        CFRelease(publicKeyRef);
    } else {
        NSLog(@"Can't find public key with id %s\n", goKeyID);
    }

    return verification;
}
