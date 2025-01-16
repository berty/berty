package tech.berty.bertybridgeexpo.gobridge
import expo.modules.kotlin.exception.CodedException

class GoBridgeNotStartedError : CodedException("BridgeNotStarted", "bridge is not instantiated", null)
class GoBridgeAlreadyStartedError : CodedException("BridgeAlreadyStarted", "bridge is already instantiated", null)
class GoBridgeKeystoreNotStartedError : CodedException("KeystoreNotStarted", "keystoreDriver is not instantiated", null)
class GoBridgeConfigError : CodedException("BridgeConfig", "Cannot instantiate BridgeConfig", null)
class GoBridgeTempDirError : CodedException("TempDir", "tempdir directory creation failed", null)
class GoBridgeCoreEOF : CodedException("EOF", "EOF", null)
class GoBridgeStorageError : CodedException("StorageError", "Cannot delete directory", null)
