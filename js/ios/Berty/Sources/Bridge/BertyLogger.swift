//
//  BertyLogger.swift
//  Berty
//
//  Created by u on 23/12/2022.
//

import os
import Bertybridge

public class BertyLogger {
    private static var bridge: BertybridgeBridge? = nil;

    public static func useBridge(_ bridge: BertybridgeBridge?) {
        BertyLogger.bridge = bridge
    }

    private static func log(_ level: (String, Int), _ message: String) {
        if (BertyLogger.bridge == nil) {
            os_log("[%s] %s", level.0, message)
            return
        }

      BertyLogger.bridge!.log(level.1, message: message)
    }

    public static func debug(_ message: String) {
        BertyLogger.log(("DEBUG", BertybridgeDebug), message)
    }

    public static func info(_ message: String) {
        BertyLogger.log(("INFO", BertybridgeInfo), message)
    }

    public static func warn(_ message: String) {
        BertyLogger.log(("WARN", BertybridgeWarn), message)
    }

    public static func error(_ message: String) {
        BertyLogger.log(("ERROR", BertybridgeError), message)
    }
}
