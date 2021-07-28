//
//  EventEmitter.swift
//  Berty
//
//  Created by Antoine Eddi on 11/08/2021.
//

import Foundation

@objc(EventEmitter)
public class EventEmitter: RCTEventEmitter {
  @objc static var shared: EventEmitter?
  var hasListeners: Bool = false

  override init() {
      super.init()
      EventEmitter.shared = self
  }
  
  override public func startObserving() {
    hasListeners = true
  }

  override public func stopObserving() {
    hasListeners = false
  }
  
  @objc static public override func requiresMainQueueSetup() -> Bool {
      return false
  }

  override public func supportedEvents() -> [String]! {
      return [
          "onPushReceived"
      ]
  }
}
