#ifndef DarwinInterface_h
#define DarwinInterface_h

#import <Foundation/Foundation.h>

bool generateKeyPairWithinEnclave(const char *goKeyId);
NSData *getPublicKeyX963Representation(const char *goKeyID);
bool deleteKeyPairFromKeychain(const char *goKeyId);

NSData *decryptCiphertextUsingPrivateKey(const char *goKeyID, NSData *ciphertext);
NSData *signDataUsingPrivateKey(const char *goKeyID, NSData *data);

// TMP functions for testing purpose
NSData *encryptPlaintextUsingPublicKey(const char *goKeyId, const char *goPlaintext);
bool verifySignatureUsingPublicKey(const char *goKeyID, NSData *data, NSData *signature);

#endif /* DarwinInterface_h */
