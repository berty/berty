import { NativeModule, requireNativeModule } from "expo";

import type { BertyBridgeExpoModuleEvents } from "./BertyBridgeExpo.types";

export enum GoLogLevel {
	debug = "debug",
	info = "info",
	error = "error",
	warn = "warn",
}

type GoLoggerOpts = {
	level: GoLogLevel;
	message: string;
};

declare class BertyBridgeExpoModule extends NativeModule<BertyBridgeExpoModuleEvents> {
	log(opts: GoLoggerOpts): void;
	initBridge(): Promise<void>;
	initBridgeRemote(address: string): Promise<void>;
	clearStorage(): Promise<void>;
	closeBridge(): Promise<void>;
	invokeBridgeMethod(method: string, b64message: string): Promise<string>;
	connectService(serviceName: string, address: string): Promise<void>;
	requestPushToken(): Promise<string>;
	startBackgroundService(title: string, text: string): Promise<void>;
	stopBackgroundService(): Promise<void>;
	isBackgroundServiceEnabled(): Promise<boolean>;
	setBackgroundServiceEnabled(enabled: boolean, title: string, text: string): Promise<void>;
	quitApp(): Promise<void>;
	isBluetoothEnabled(): Promise<boolean>;
	hasNetworkConnection(): Promise<boolean>;
	requestEnableBluetooth(): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<BertyBridgeExpoModule>("BertyBridgeExpo");
