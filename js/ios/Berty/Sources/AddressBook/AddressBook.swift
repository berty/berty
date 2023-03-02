//
//  AddressBook.swift
//  Berty
//
//  Created by Guillaume Louvigny on 23/02/2023.
//

import Foundation
import Contacts

struct AddressBookContact: Codable {
  var givenName: String
  var middleName: String
  var familyName: String
  var namePrefix: String
  var nameSuffix: String
  var emailAddresses: [String]
  var phoneNumbers: [String]
}

enum AddressBookError: Error {
  case permission
}
extension AddressBookError: LocalizedError {
  public var errorDescription: String? {
    switch self {
    case .permission:
      return NSLocalizedString(
              "user has not granted access to their address book",
              comment: ""
      )
    }
  }
}

func getAllContactsPriv() throws -> [AddressBookContact] {
  let store = CNContactStore()

  do {
    let keysToFetch = [
      CNContactEmailAddressesKey,
      CNContactPhoneNumbersKey,
      CNContactFamilyNameKey,
      CNContactGivenNameKey,
      CNContactMiddleNameKey,
      CNContactNamePrefixKey,
      CNContactNameSuffixKey
    ] as [CNKeyDescriptor]
    let req = CNContactFetchRequest(keysToFetch: keysToFetch)
    var contacts = [] as [AddressBookContact]

    try store.enumerateContacts(with: req) { contact, _ in
      var phoneNumbers = [] as [String]
      var emailAddresses = [] as [String]

      for emailAddress in contact.emailAddresses {
        emailAddresses.append(emailAddress.value as String)
      }

      for phoneNumber in contact.phoneNumbers {
        phoneNumbers.append(phoneNumber.value.stringValue)
      }

      contacts.append(AddressBookContact(
              givenName: contact.givenName,
              middleName: contact.middleName,
              familyName: contact.familyName,
              namePrefix: contact.namePrefix,
              nameSuffix: contact.nameSuffix,
              emailAddresses: emailAddresses,
              phoneNumbers: phoneNumbers))
    }

    return contacts
  } catch {
    print("Failed to fetch contacts, error: \(error)")
    // Handle the error.
  }

  throw AddressBookError.permission

}

@objc(AddressBook)
class AddressBook: NSObject {
  @objc func getAllContacts(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      let contacts = try getAllContactsPriv()
      let encoder = JSONEncoder()
      let data = try encoder.encode(contacts)

      resolve(String(data: data, encoding: .utf8)!)
    } catch {
      reject("address_book_failure", error.localizedDescription, error)
    }
  }

  @objc func getDeviceCountry(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(NSLocale.current.regionCode)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }
}
