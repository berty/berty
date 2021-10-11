import Foundation
import Bertybridge

enum KeystoreDriverError: Error {
  case secItemAdd(String)
  case secItemCopyMatching(String)
}

extension KeystoreDriverError: CustomStringConvertible {
    public var description: String {
        switch self {
        case .secItemAdd(let desc):
          return "SecItemAdd failed: " + desc
        case .secItemCopyMatching(let desc):
          return "SecItemCopyMatching failed " + desc
        }
    }
}

public class KeystoreDriver: NSObject, BertybridgeNativeKeystoreDriverProtocol {
    public static var shared: KeystoreDriver = KeystoreDriver()
  
    public func put(_ key: String?, value: String?) throws {
      let valueData = value!.data(using: String.Encoding.utf8)!;
      let identifier = key!.data(using: String.Encoding.utf8)!
      let addquery: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                     kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
                                     kSecAttrGeneric as String: identifier,
                                     kSecAttrAccount as String: identifier,
                                     kSecAttrService as String: "NativeKeystore",
                                     kSecValueData as String: valueData]
      let status = SecItemAdd(addquery as CFDictionary, nil)
      guard status == errSecSuccess else {
        let errstr = SecCopyErrorMessageString(status, nil)! as String
        throw NSError(domain: "SecItemAdd failed: " + errstr, code: 0)
      }
    }

    public func get(_ key: String?, error: NSErrorPointer) -> String {
      let identifier = key!.data(using: String.Encoding.utf8)!
      let getquery: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                     kSecAttrGeneric as String: identifier,
                                     kSecAttrAccount as String: identifier,
                                     kSecAttrService as String: "NativeKeystore",
                                     kSecReturnData as String: kCFBooleanTrue!,
                                     kSecMatchLimit as String: kSecMatchLimitOne]
      var item: CFTypeRef?
      let status = SecItemCopyMatching(getquery as CFDictionary, &item)
      guard status == errSecSuccess else {
        let errstr = SecCopyErrorMessageString(status, nil)! as String
        error?.pointee = NSError(domain: "SecItemCopyMatching failed: " + errstr, code: 0)
        return ""
      }
      
      return String(bytes: item as! Data, encoding: String.Encoding.utf8)!
    }
}
