//
//  PromiseBlock.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 30/07/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import ExpoModulesCore
import Bertybridge

var promises: [PromiseBlock] = []
let promisesQueue = DispatchQueue(label: "tech.berty.ios.promises.queue")

// PromiseBlock aim to keep reference over promise object so go can play with
// until the promise is resolved
class PromiseBlock: NSObject, BertybridgePromiseBlockProtocol {

  var promise: Promise

  init(_ promise: Promise!) {
    self.promise = promise

    super.init()
    self.store()
  }

  func callResolve(_ reply: String?) {
    if let reply = reply {
        self.promise.resolve(reply)
    } else {
        self.promise.reject("CallResolve", "cannot resolve nil reply")
    }

    self.remove()
  }

  func callReject(_ error: Error?) {
    if let error = error {
        self.promise.reject(error)
    } else {
        self.promise.reject("CallReject", "cannot reject nil error")
    }

    self.remove()
  }

  func store() {
    promisesQueue.sync {
      promises.append(self)
    }
  }

  func remove() -> Void {
    promisesQueue.sync {
      promises = promises.filter { $0 !== self }
    }
  }
}
