import BertyBridgeExpoModule from "./BertyBridgeExpoModule";

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

export interface GoBridgeInterface {
	log(opts: GoLoggerOpts): void;
	initBridge(): Promise<void>;
	initBridgeRemote(address: string): Promise<void>;
	clearStorage(): Promise<void>;
	closeBridge(): Promise<void>;
	invokeBridgeMethod(method: string, b64message: string): Promise<string>;
	connectService(serviceName: string, address: string): Promise<void>;
}

class GoBridge implements GoBridgeInterface {
	log(opts: GoLoggerOpts): void {
		return BertyBridgeExpoModule.log(opts);
	}

	initBridge(): Promise<void> {
		return BertyBridgeExpoModule.initBridge();
	}

	initBridgeRemote(address: string): Promise<void> {
		return BertyBridgeExpoModule.initBridgeRemote(address);
	}

	clearStorage(): Promise<void> {
		return BertyBridgeExpoModule.clearStorage();
	}

	closeBridge(): Promise<void> {
		return BertyBridgeExpoModule.closeBridge();
	}

	invokeBridgeMethod(method: string, b64message: string): Promise<string> {
		return BertyBridgeExpoModule.invokeBridgeMethod(method, b64message);
	}

	connectService(serviceName: string, address: string): Promise<void> {
		return BertyBridgeExpoModule.connectService(serviceName, address);
	}
}

const goBridge: GoBridgeInterface = new GoBridge();
export { goBridge as GoBridge };
