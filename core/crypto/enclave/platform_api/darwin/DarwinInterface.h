#ifndef DarwinInterface_h
#define DarwinInterface_h

#import <Foundation/Foundation.h>

NSData *generateKeyPairWithinEnclave(const char *goKeyId);
NSData *generateKeyPairWithoutEnclave(const char *goKeyId, int type);
bool deleteKeyPairFromKeychain(const char *goKeyId);

NSData *decryptCiphertextUsingPrivateKey(const char *goKeyID, NSData *ciphertext, int type);
// NSData *signDataUsingPrivateKey(const char *goKeyID, NSData *data);

// TMP functions for testing
NSData *encryptPlaintextUsingPublicKey(const char *goKeyId, const char *goPlaintext, int type);
// bool verifySignatureUsingPublicKey(NSString *goKeyID, NSData *data, NSData *signature);

#endif /* DarwinInterface_h */
