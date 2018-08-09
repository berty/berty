#import "DarwinInterface.h"

#define LABEL @"Berty Messaging Key"
#define tag(keyID) [[NSString stringWithUTF8String:keyID] dataUsingEncoding:NSUTF8StringEncoding]

#define RSA2046 1
#define ECC256  2

bool generateKeyPairWithinEnclave(const char *goKeyID) {
  CFErrorRef error = NULL;
  SecAccessControlRef access = SecAccessControlCreateWithFlags(
    kCFAllocatorDefault,
    kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    kSecAccessControlPrivateKeyUsage,
    &error
  );
  if (error) {
    NSError *err = CFBridgingRelease(error);
    NSLog(@"Error during access control flags creation: %@\n", err);
    return false;
  }

  NSDictionary* attributes =
    @{(id)kSecAttrKeyType:        (id)kSecAttrKeyTypeECSECPrimeRandom,
      (id)kSecAttrKeySizeInBits:  @256,
      (id)kSecAttrTokenID:        (id)kSecAttrTokenIDSecureEnclave,
      (id)kSecPrivateKeyAttrs:
        @{(id)kSecAttrIsPermanent:    @YES,
          (id)kSecAttrLabel:          LABEL,
          (id)kSecAttrApplicationTag: tag(goKeyID),
          (id)kSecAttrAccessControl:  (__bridge id)access,
        },
    };

  SecKeyRef privateKeyRef = SecKeyCreateRandomKey((__bridge CFDictionaryRef)attributes, &error);

  if (!privateKeyRef) {
    NSError *err = CFBridgingRelease(error);
    NSLog(@"Error during secure enclave key registering: %@\n", err);
    return false;
  }

  NSLog(@"Key with ID %s successfully generated within the enclave\n", goKeyID);
  return true;
}

bool generateKeyPairWithoutEnclave(const char *goKeyID, int type) {
  NSString *keyID = [NSString stringWithUTF8String:goKeyID];
  CFErrorRef error = NULL;
  CFStringRef algo = (type == ECC256) ? kSecAttrKeyTypeECSECPrimeRandom : kSecAttrKeyTypeRSA;
  NSNumber *length = (type == ECC256) ? @256 : @2048;
  NSDictionary* attributes =
    @{(id)kSecAttrKeyType:        (id)CFBridgingRelease(algo),
      (id)kSecAttrKeySizeInBits:  length,
      (id)kSecPrivateKeyAttrs:
        @{(id)kSecAttrIsPermanent:    @YES,
          (id)kSecAttrLabel:          LABEL,
          (id)kSecAttrApplicationTag: tag(goKeyID),
        },
    };

  SecKeyRef privateKeyRef = SecKeyCreateRandomKey((__bridge CFDictionaryRef)attributes, &error);
  if (!privateKeyRef) {
    NSError *err = CFBridgingRelease(error);
    NSLog(@"Error during key pair generation: %@\n", err);
    return false;
  }

  NSLog(@"Key with id %s successfully generated without the enclave\n", goKeyID);
  return true;
}

bool deleteKeyPairFromKeychain(const char* goKeyID) {
  NSString *keyID = [NSString stringWithUTF8String:goKeyID];
  NSDictionary *query = @{(id)kSecClass:              (id)kSecClassKey,
                         (id)kSecAttrLabel:          LABEL,
                         (id)kSecAttrApplicationTag: tag(goKeyID),
                         (id)kSecReturnRef:          @YES,
  };
  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

  if (status != errSecSuccess) {
   NSLog(@"Error during deletion of key with id %@\n", keyID);
   return false;
  }

  NSLog(@"Key with id %@ successfully deleted from the keychain\n", keyID);
  return true;
}
