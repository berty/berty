#import "DarwinInterface.h"

// Define label and tag for keychain entry
#define LABEL @"Berty Messaging Key"
#define tag(keyID) [[NSString stringWithUTF8String:keyID] dataUsingEncoding:NSUTF8StringEncoding]

// Define available encryption algorithms
#define RSA2048 1
#define ECC256  2

// Return key type and length corresponding value in Darwin API
#define keyType(type) (type == ECC256) ? kSecAttrKeyTypeECSECPrimeRandom : kSecAttrKeyTypeRSA
#define keyLength(type) (type == ECC256) ? @256 : @2048

// Return encryption algorithm corresponding value in Darwin API
#define encAlgoType(type) (type == ECC256) ? kSecKeyAlgorithmECIESEncryptionStandardX963SHA512AESGCM : kSecKeyAlgorithmRSAEncryptionOAEPSHA512

// Return signing algorithm corresponding value in Darwin API
#define signAlgoType(type) (type == ECC256) ? kSecKeyAlgorithmECDSASignatureMessageX962SHA512 : kSecKeyAlgorithmRSASignatureMessagePSSSHA512

// Generate a key pair and store the private key in the Secure Enclave.
// Stores only 256-bit elliptic curve private keys (no compatible with RSA).
// This Darwin feature is only available on specific hardware:
// - iOS devices with an Apple A7 or later A-series processor
// - MacBook Pro with a Touch Bar
// The binary need to be signed with a Developer ID certificate to enable this feature
NSData *generateKeyPairWithinEnclave(const char *goKeyID) {
    NSData *publicKeyData = NULL;
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
        return publicKeyData;
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
    } else {
        NSLog(@"Key with ID %s successfully generated within the enclave\n", goKeyID);
        publicKeyData = (__bridge NSData*)SecKeyCopyExternalRepresentation(publicKeyRef, &error);
        if (error) {
            NSLog(@"Error during copy of public key external representation");
            deleteKeyPairFromKeychain(goKeyID);
            CFRelease(error);
        }
        CFRelease(publicKeyRef);
        CFRelease(privateKeyRef);
    }

    CFRelease(access);
    [attributes release];

    return publicKeyData;
}

// Generate a key pair without the Secure Enclave feature, then store it in the keychain.
// Compatible with RSA and ECC.
NSData *generateKeyPairWithoutEnclave(const char *goKeyID, int type) {
    NSData *publicKeyData = NULL;
    CFErrorRef error = NULL;
    SecKeyRef privateKeyRef;
    SecKeyRef publicKeyRef;
    NSDictionary *attributes =
      @{(id)kSecAttrKeyType:        (id)CFBridgingRelease(keyType(type)),
        (id)kSecAttrKeySizeInBits:  keyLength(type),
        (id)kSecAttrIsPermanent:    @YES,
        (id)kSecAttrLabel:          LABEL,
        (id)kSecAttrApplicationTag: tag(goKeyID),
      };

    OSStatus status = SecKeyGeneratePair((__bridge CFDictionaryRef)attributes, &publicKeyRef, &privateKeyRef);

    if (status != errSecSuccess) {
        NSLog(@"Error during generation of key pair with id %s\n", goKeyID);
    } else {
        NSLog(@"Key with id %s successfully generated without the enclave\n", goKeyID);
        publicKeyData = (__bridge NSData*)SecKeyCopyExternalRepresentation(publicKeyRef, &error);
        if (error) {
            NSLog(@"Error during copy of public key external representation");
            deleteKeyPairFromKeychain(goKeyID);
            CFRelease(error);
        }
        CFRelease(publicKeyRef);
        CFRelease(privateKeyRef);
    }

    [attributes release];

    return publicKeyData;
}

// Delete the key pair corresponding to the keyID parameter from the keychain
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

// Retrieve private key ref from the keychain.
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

// Retrieve public key ref from the keychain.
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

// Decrypt ciphertext using private key and corresponding encryption algorithm (RSA or ECC)
NSData *decryptCiphertextUsingPrivateKey(const char *goKeyID, NSData *ciphertext, int type) {
    NSData *plaintext = NULL;
    CFErrorRef error = NULL;
    SecKeyRef privateKeyRef = getPrivateKeyFromKeychain(goKeyID);
    if (privateKeyRef) {
        bool canDecrypt = SecKeyIsAlgorithmSupported(privateKeyRef,
                                                     kSecKeyOperationTypeDecrypt,
                                                     encAlgoType(type));
        if (type == RSA2048 && [ciphertext length] != SecKeyGetBlockSize(privateKeyRef)) {
            NSLog(@"Error during text decryption using key with id %s: for RSA-2048/SHA512 ciphertext length must be equal to Key Block Size\n", goKeyID);
        } else if (canDecrypt) {
            plaintext = (__bridge NSData*)(SecKeyCreateDecryptedData(
                              privateKeyRef,
                              encAlgoType(type),
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

// TMP function for testing purpose
// Encrypt plaintext using public key and corresponding encryption algorithm (RSA or ECC)
NSData *encryptPlaintextUsingPublicKey(const char *goKeyID, const char *goPlaintext, int type) {
    NSString *plaintext = [NSString stringWithUTF8String:goPlaintext];
    CFErrorRef error = NULL;
    NSData *ciphertext = NULL;
    SecKeyRef publicKeyRef = getPublicKeyFromKeychain(goKeyID);
    if (publicKeyRef) {
        bool canEncrypt = SecKeyIsAlgorithmSupported(publicKeyRef,
                                                     kSecKeyOperationTypeEncrypt,
                                                     encAlgoType(type));
        if (type == RSA2048 && [plaintext length] > (SecKeyGetBlockSize(publicKeyRef) - 130)) {
            NSLog(@"Error during text encryption using key with id %s: RSA-2048/SHA512 can't encrypt more bytes than Key Block Size - 130\n", goKeyID);
        } else if (canEncrypt) {
            ciphertext = (__bridge NSData*)(SecKeyCreateEncryptedData(
                                                publicKeyRef,
                                                encAlgoType(type),
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

// Sign data using private key and corresponding signing algorithm (RSA or ECC)
NSData *signDataUsingPrivateKey(const char *goKeyID, NSData *data, int type) {
  	NSData* signature = NULL;
  	CFErrorRef error = NULL;
  	SecKeyRef privateKeyRef = getPrivateKeyFromKeychain(goKeyID);
    if (privateKeyRef) {
        bool canSign = SecKeyIsAlgorithmSupported(privateKeyRef,
                                                  kSecKeyOperationTypeSign,
                                                  signAlgoType(type));
        if (canSign) {
          	signature = (__bridge NSData*)(SecKeyCreateSignature(
                  					privateKeyRef,
                            signAlgoType(type),
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
// Verify signature using public key and corresponding signing algorithm (RSA or ECC)
bool verifySignatureUsingPublicKey(const char *goKeyID, NSData *data, NSData *signature, int type) {
    bool verification = false;
  	CFErrorRef error = NULL;
  	SecKeyRef publicKeyRef = getPublicKeyFromKeychain(goKeyID);
    if (publicKeyRef) {
      	bool canVerify = SecKeyIsAlgorithmSupported(publicKeyRef,
                                										kSecKeyOperationTypeVerify,
                                										signAlgoType(type));
        if (canVerify) {
          	verification = SecKeyVerifySignature(
                      							publicKeyRef,
                      							signAlgoType(type),
                      							(__bridge CFDataRef)signature,
                      							(__bridge CFDataRef)data,
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
