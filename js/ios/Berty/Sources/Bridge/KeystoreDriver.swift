import Foundation
import Bertybridge
import Bertypush

enum KeystoreDriverError: Error {
    case groupID
}
extension KeystoreDriverError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .groupID:
            return NSLocalizedString(
                "unable to retrieve appGroupID key from Info.plist",
                comment: ""
            )
        }
    }
}

public class KeystoreDriver: NSObject, BertybridgeNativeKeystoreDriverProtocol, BertypushNativeKeystoreDriverProtocol {
  public static var shared: KeystoreDriver = KeystoreDriver()
  
  private func getAppGroupID() throws -> String {
    guard let appGroupID = Bundle.main.object(forInfoDictionaryKey: "appGroupID") as? String else {
      throw KeystoreDriverError.groupID
    }

    return appGroupID
  }

  public func put(_ key: String?, data: Data?) throws {
    try self.handleAppUninstallation()
    let identifier = key!.data(using: String.Encoding.utf8)!
    let addquery: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                   kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
                                   kSecAttrGeneric as String: identifier,
                                   kSecAttrAccount as String: identifier,
                                   kSecAttrService as String: "BertyNativeKeystore",
                                   kSecValueData as String: data!,
                                   kSecAttrAccessGroup as String: try getAppGroupID()]
    let status = SecItemAdd(addquery as CFDictionary, nil)
    guard status == errSecSuccess else {
      let errstr = SecCopyErrorMessageString(status, nil)! as String
      throw NSError(domain: "SecItemAdd failed: " + errstr, code: 0)
    }
  }
  
  public func get(_ key: String?) throws -> Data {
    try self.handleAppUninstallation()
    let identifier = key!.data(using: String.Encoding.utf8)!
    let getquery: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                   kSecAttrGeneric as String: identifier,
                                   kSecAttrAccount as String: identifier,
                                   kSecAttrService as String: "BertyNativeKeystore",
                                   kSecReturnData as String: kCFBooleanTrue!,
                                   kSecMatchLimit as String: kSecMatchLimitOne,
                                   kSecAttrAccessGroup as String: try getAppGroupID()]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(getquery as CFDictionary, &item)
    if status != errSecSuccess {
      let errstr = SecCopyErrorMessageString(status, nil)! as String
      throw NSError(domain: "SecItemCopyMatching failed: " + errstr, code: 0)
    }
    return item as! Data
  }

  private func handleAppUninstallation() throws {
    if let userDefaults = UserDefaults(suiteName: try getAppGroupID()) {
      if (!userDefaults.bool(forKey: "BertyNativeKeystoreIsAppInstalled")) {
        self.clearSecureKeyStore()
        userDefaults.set(true, forKey:"BertyNativeKeystoreIsAppInstalled")
        userDefaults.synchronize()
      }
    }
  }

  private func clearSecureKeyStore() {
      let secItemClasses = [
        kSecClassGenericPassword,
        kSecAttrGeneric,
        kSecAttrAccount,
        kSecClassKey,
        kSecAttrService
      ]
      for secItemClass in secItemClasses {
        let spec: [String: Any] = [kSecClass as String: secItemClass]
        SecItemDelete(spec as CFDictionary)
      }
  }
}
