#ifndef DarwinInterface_h
#define DarwinInterface_h

#import <Foundation/Foundation.h>

// KeyPair generation works on iOS but don't work on macOS
// Created a thread on Apple Dev Forum: https://forums.developer.apple.com/message/327524
NSData *generateKeyPairWithinEnclave(const char *goKeyId);
NSData *generateKeyPairWithoutEnclave(const char *goKeyId, int type);
bool deleteKeyPairFromKeychain(const char *goKeyId);

NSData *decryptCiphertextUsingPrivateKey(const char *goKeyID, NSData *ciphertext, int type);
// Can't make sign/verify functions works properly
// Created a thread on Apple Dev Forum: https://forums.developer.apple.com/message/327521
NSData *signDataUsingPrivateKey(const char *goKeyID, NSData *data, int type);

// TMP functions for testing purpose
NSData *encryptPlaintextUsingPublicKey(const char *goKeyId, const char *goPlaintext, int type);
bool verifySignatureUsingPublicKey(const char *goKeyID, NSData *data, NSData *signature, int type);

#endif /* DarwinInterface_h */
