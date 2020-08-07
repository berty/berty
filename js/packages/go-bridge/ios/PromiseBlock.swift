//
//  PromiseBlock.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 30/07/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

var promises: [PromiseBlock] = []
let promisesQueue = DispatchQueue(label: "tech.berty.ios.promises.queue")

// PromiseBlock aim to keep reference over promise object so go can play with
// until the promise is resolved
class PromiseBlock: NSObject, BertybridgePromiseBlockProtocol {

  var resolve: RCTPromiseResolveBlock
  var reject: RCTPromiseRejectBlock

  init(_ resolve: RCTPromiseResolveBlock!, _ reject: RCTPromiseRejectBlock!) {
    self.reject = reject
    self.resolve = resolve

    super.init()
    self.store()
  }

  func callResolve(_ reply: String?) {
    if let reply = reply {
        self.resolve(reply)
    } else {
        self.reject("CallResolve", "cannot resolve nil reply", nil)
    }

    self.remove()
  }

  func callReject(_ error: Error?) {
    if let error = error {
        self.reject("rejected", error.localizedDescription, error)
    } else {
        self.reject("CallReject", "cannot reject nil error", nil)
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
