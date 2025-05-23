import { PushTokenRequesterInterface } from './PushTokenRequesterInterface'

class NoopPushTokenRequester implements PushTokenRequesterInterface {
	request(): Promise<string> {
		return Promise.reject()
	}
}

export const PushTokenRequester: PushTokenRequesterInterface = new NoopPushTokenRequester()
