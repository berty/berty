import BertyBridgeExpoModule from "./BertyBridgeExpoModule";

interface PushTokenRequesterInterface {
	request(): Promise<string>;
}

class PushTokenRequester implements PushTokenRequesterInterface {
	async request(): Promise<string> {
		return BertyBridgeExpoModule.requestPushToken();
	}
}

const pushTokenRequester: PushTokenRequesterInterface =
	new PushTokenRequester();

export { pushTokenRequester as PushTokenRequester };
