//
//  BridgeError.swift
//  Pods
//
//  Created by Rémi BARBERO on 13/11/2024.
//


struct BridgeError: LocalizedError {
    let value: String
    init(_ value: String)  {
        self.value = value
    }
    public var errorDescription: String? { return self.value }
}