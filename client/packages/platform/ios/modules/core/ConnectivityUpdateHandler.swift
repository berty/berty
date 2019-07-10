//
//  ConnectivityUpdateHandler.swift
//  Berty
//
//  Created by Antoine Eddi on 4/5/19.
//  Copyright © 2019 Berty Technologies. All rights reserved.
//

import Foundation
import CoreBluetooth
import CoreTelephony
import Core

class ConnectivityUpdateHandler: NSObject {
  var reachability: Reachability!
  var centralManager: CBCentralManager!

  enum State: Int {
    case son  = 1 // "on" is too short: must be at least 3 char long according to linter
    case soff = 2
  }

  enum NetType: Int {
    case unknown  = 0
    case wifi     = 1
    // Ignore Ethernet on iOS
    // Ignore Bluetooth on iOS
    case cellular = 4
  }

  enum CellType: Int {
    case unknown = 0
    case none    = 1
    case cell2G  = 2
    case cell3G  = 3
    case cell4G  = 4
  }

  struct ConnectivityUpdate: Codable {
    var internet: Int
    var network: Int
    var cellular: Int
  }

  override init() {
    super.init()

    self.centralManager = CBCentralManager(delegate: self, queue: nil)
    self.reachability = Reachability()!

    self.setupHandler()
  }

  func setupHandler() {
    reachability.whenReachable = { reachability in
      if reachability.connection == .wifi {
        self.wifiConnected()
      } else if reachability.connection == .cellular {
        self.cellularConnected()
      }
    }

    reachability.whenUnreachable = { _ in
      self.disconnected()
    }

    do {
      try reachability.startNotifier()
      } catch {
        logger.format("unable to start notifier", level: .error)
      }
  }

  func wifiConnected() {
    sendConnectivityUpdate(ConnectivityUpdate(
      internet: State.son.rawValue,
      network: NetType.wifi.rawValue,
      cellular: CellType.none.rawValue
    ))
  }

  func cellularConnected() {
    let networkInfo = CTTelephonyNetworkInfo()
    let carrierType = networkInfo.currentRadioAccessTechnology
    var cellType: CellType

    switch carrierType {
    case
    CTRadioAccessTechnologyGPRS?,
    CTRadioAccessTechnologyEdge?,
    CTRadioAccessTechnologyCDMA1x?:
      cellType = .cell2G
    case
    CTRadioAccessTechnologyWCDMA?,
    CTRadioAccessTechnologyHSDPA?,
    CTRadioAccessTechnologyHSUPA?,
    CTRadioAccessTechnologyCDMAEVDORev0?,
    CTRadioAccessTechnologyCDMAEVDORevA?,
    CTRadioAccessTechnologyCDMAEVDORevB?,
    CTRadioAccessTechnologyeHRPD?:
      cellType = .cell3G
    case CTRadioAccessTechnologyLTE?:
      cellType = .cell4G
    default:
      cellType = .unknown
    }

    sendConnectivityUpdate(ConnectivityUpdate(
      internet: State.son.rawValue,
      network: NetType.cellular.rawValue,
      cellular: cellType.rawValue
    ))
  }

  func disconnected() {
    sendConnectivityUpdate(ConnectivityUpdate(
      internet: State.soff.rawValue,
      network: NetType.unknown.rawValue,
      cellular: CellType.none.rawValue
    ))
  }

  func sendConnectivityUpdate(_ update: ConnectivityUpdate) {
    let encoder = JSONEncoder()

    do {
      let data = try encoder.encode(update)
      let jsonString = String(data: data, encoding: .utf8)!
      CoreUpdateConnectivityState(jsonString)
    } catch {
      logger.format("unable to encode ConnectivityUpdate to JSON", level: .error)
    }
  }
}

extension ConnectivityUpdateHandler: CBCentralManagerDelegate {

  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    switch central.state {
    case .poweredOn:
      CoreUpdateBluetoothState(State.son.rawValue)
    default:
      CoreUpdateBluetoothState(State.soff.rawValue)
    }
  }
}
