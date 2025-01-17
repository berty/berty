package tech.berty.bertybridgeexpo

import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.IntentFilter
import android.content.res.Resources
import android.net.ConnectivityManager
import android.os.Build
import android.provider.CalendarContract.Instances.EVENT_ID
import android.util.Log
import bertybridge.Bertybridge
import bertybridge.Bridge
import bertybridge.PromiseBlock
import bertybridge.RemoteBridge
import bertybridge.ServiceClient
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable
import tech.berty.bertybridgeexpo.addressbook.AddressBook
import tech.berty.bertybridgeexpo.gobridge.ConnectivityDriver
import tech.berty.bertybridgeexpo.gobridge.GoBridgeAlreadyStartedError
import tech.berty.bertybridgeexpo.gobridge.GoBridgeConfigError
import tech.berty.bertybridgeexpo.gobridge.GoBridgeKeystoreNotStartedError
import tech.berty.bertybridgeexpo.gobridge.GoBridgeNotStartedError
import tech.berty.bertybridgeexpo.gobridge.GoBridgeStorageError
import tech.berty.bertybridgeexpo.gobridge.GoBridgeTempDirError
import tech.berty.bertybridgeexpo.gobridge.KeystoreDriver
import tech.berty.bertybridgeexpo.gobridge.KotlinPromiseBlock
import tech.berty.bertybridgeexpo.gobridge.Logger
import tech.berty.bertybridgeexpo.gobridge.MDNSLockerDriver
import tech.berty.bertybridgeexpo.gobridge.NetDriver
import tech.berty.bertybridgeexpo.gobridge.bledriver.BleInterface
import tech.berty.bertybridgeexpo.notification.NotificationService
import tech.berty.bertybridgeexpo.rootdir.RootDirModule
import java.io.File

enum class logLevel(val value: String) : Enumerable {
    debug("debug"),
    info("info"),
    warn("warn"),
    error("error"),
}

class logOpts : Record {
    @Field
    val level: logLevel? = null

    @Field
    val message: String? = null
}

class BertyBridgeExpoModule : Module() {
    private val TAG: String = "GoBridge"

    // protocol
    private var remoteBridge: RemoteBridge? = null
    private var serviceClient: ServiceClient? = null
    private var rootDir: File? = null
    private var tempDir: File? = null
    private var keystoreDriver: KeystoreDriver? = null
    private var addressBook: AddressBook? = null
    private var notificationService: NotificationService? = null

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('BertyBridgeExpo')` in JavaScript.
        Name("BertyBridgeExpo")

        // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
        Constants(
            "PI" to Math.PI
        )

        Events(EVENT_ID)

        OnCreate {
            val reactContext = appContext.reactContext!!

            try {
                keystoreDriver = KeystoreDriver(reactContext)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            rootDir = File(RootDirModule(reactContext).getRootDir())
            tempDir = File(reactContext.cacheDir.absolutePath + "/berty")
            addressBook = AddressBook(reactContext)
            notificationService = NotificationService(this@BertyBridgeExpoModule)
        }

        OnDestroy {
            try {
                if (bridgeMessenger != null) {
                    bridgeMessenger!!.close()
                }
                if (remoteBridge != null) {
                    remoteBridge!!.close()
                }
            } catch (e: CodedException) {
                Logger.e(TAG, "bridge close error", e)
            }
            bridgeMessenger = null
            remoteBridge = null
            serviceClient = null
        }

        AsyncFunction("initBridge") { promise: Promise ->
            Log.i("initBridge", "initBridge called")
            try {
                if (bridgeMessenger != null || remoteBridge != null || serviceClient != null) {
                    throw GoBridgeAlreadyStartedError()
                }

                if (keystoreDriver == null) {
                    throw GoBridgeKeystoreNotStartedError()
                }

                val reactContext = appContext.reactContext!!

                val config = Bertybridge.newBridgeConfig() ?: throw GoBridgeConfigError()

                // set net driver
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val inet = NetDriver()
                    config.setNetDriver(inet)
                }

                // set mdns locker driver
                val imdnslocker = MDNSLockerDriver(reactContext)
                config.setMDNSLocker(imdnslocker)

                // load and set user preferred language
                var tags: String? = null
                tags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    Resources.getSystem().configuration.locales.toLanguageTags()
                } else {
                    Resources.getSystem().configuration.locale.toLanguageTag()
                }
                config.setPreferredLanguages(tags)

                // set root dir
                config.setAppRootDir(rootDir!!.absolutePath)

                // set temp dir
                if (tempDir != null && !tempDir!!.exists()) {
                    if (!tempDir!!.mkdirs()) {
                        throw GoBridgeTempDirError()
                    }
                }
                config.setAndroidCacheDir(tempDir!!.absolutePath)

                // set ble driver
                val bleDriver: BleInterface = BleInterface(reactContext, true)
                config.setBleDriver(bleDriver)

                // set NearBy driver
                // BertyNearbyDriver NBDriver = new BertyNearbyDriver(reactContext);
                // config.setNBDriver(NBDriver);

                // set native keystore driver
                config.setKeystoreDriver(keystoreDriver)

                val connectivityDriver = ConnectivityDriver(reactContext!!)
                reactContext!!.registerReceiver(
                    connectivityDriver,
                    IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION)
                )
                reactContext!!.registerReceiver(
                    connectivityDriver,
                    IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED)
                )
                config.setConnectivityDriver(connectivityDriver)

                bridgeMessenger = Bertybridge.newBridge(config)
                serviceClient =
                    bridgeMessenger // bridgeMessenger implements ServiceClient interface

                Logger.useBridge(bridgeMessenger)

                promise.resolve(true)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        Function("log") { opts: logOpts ->
            if (opts.message != null) {
                val level = opts.level ?: "INFO"

                // log
                Logger.log(
                    Logger.LogLevel.fromString(level.toString()),
                    "react-native",
                    opts.message
                )
            }
        }

        AsyncFunction("initBridgeRemote") { address: String, promise: Promise ->
            try {
                if (remoteBridge != null || bridgeMessenger != null || serviceClient != null) {
                    throw GoBridgeAlreadyStartedError()
                }

                if (keystoreDriver == null) {
                    throw GoBridgeKeystoreNotStartedError()
                }

                val config = Bertybridge.newRemoteBridgeConfig() ?: throw GoBridgeConfigError()

                remoteBridge = Bertybridge.newRemoteBridge(address, config)
                serviceClient = remoteBridge // remoteBridge implements ServiceClient interface
                promise.resolve(true)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        AsyncFunction("connectService") { serviceName: String, address: String, promise: Promise ->
            try {
                if (remoteBridge == null) {
                    throw GoBridgeNotStartedError()
                }

                remoteBridge!!.connectService(serviceName, address)
                promise.resolve(true)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        AsyncFunction("closeBridge") { promise: Promise ->
            try {
                if (bridgeMessenger != null) {
                    bridgeMessenger!!.close()
                    bridgeMessenger = null
                }
                if (remoteBridge != null) {
                    remoteBridge!!.close()
                    remoteBridge = null
                }
                serviceClient = null
                promise.resolve(true)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        AsyncFunction("invokeBridgeMethod") { method: String, b64message: String, promise: Promise ->
            try {
                if (serviceClient == null) {
                    throw GoBridgeNotStartedError()
                }

                val promiseBlock: PromiseBlock = KotlinPromiseBlock(promise)
                serviceClient!!.invokeBridgeMethodWithPromiseBlock(
                    promiseBlock,
                    method,
                    b64message
                )
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        AsyncFunction("getProtocolAddr") { promise: Promise ->
            try {
                if (bridgeMessenger == null) {
                    throw GoBridgeNotStartedError()
                }
                promise.resolve(null)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        AsyncFunction("clearStorage") { promise: Promise ->
            try {
                if (rootDir != null && rootDir!!.exists()) {
                    if (!deleteRecursive(rootDir!!)) {
                        throw GoBridgeStorageError()
                    }
                }
                if (tempDir != null && tempDir!!.exists()) {
                    if (!deleteRecursive(tempDir!!)) {
                        throw GoBridgeStorageError()
                    }
                }
                promise.resolve(true)
            } catch (err: CodedException) {
                promise.reject(err)
            }
        }

        // AddressBook methods

        AsyncFunction("getDeviceCountry") { promise: Promise ->
            addressBook?.getDeviceCountry(promise);
        }


        AsyncFunction("getAllContacts") { promise: Promise ->
            addressBook?.getAllContacts(promise);
        }

        // PushToken

        AsyncFunction("request") { promise: Promise ->
            notificationService?.request(promise)
        }
    }

    private fun deleteRecursive(fileOrDirectory: File): Boolean {
        if (fileOrDirectory.isDirectory) {
            for (child in fileOrDirectory.listFiles()) {
                if (!deleteRecursive(child)) {
                    return false
                }
            }
        }
        return fileOrDirectory.delete()
    }

    fun getReactContext(): Context {
        return appContext.reactContext!!
    }

    companion object {
        var bridgeMessenger: Bridge? = null
            private set
    }
}
