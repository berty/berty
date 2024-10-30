export interface PushTokenRequesterInterface {
	request(): Promise<string>
}
