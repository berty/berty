//
//  EventEmitter.swift
//  Berty
//
//  Created by Antoine Eddi on 11/08/2021.
//

import Foundation

@objc public class EventEmitter: RCTEventEmitter {
  @objc public static var shared: EventEmitter?
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

  override public func supportedEvents() -> [String]! {
      return [
          "onPushReceived"
      ]
  }
}
