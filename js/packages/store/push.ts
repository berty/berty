import { requestNotifications, checkNotifications, RESULTS } from 'react-native-permissions'

class PushTokenSubscriber {
	protected token: Uint8Array | undefined
	protected subscribers: ((arg0: any) => void)[] = []
	protected errorSubscribers: ((err: Error) => void)[] = []

	onNew(token: Uint8Array) {
		this.token = token
		this.subscribers.forEach((sub) => {
			sub(token)
		})
	}

	onError(err: Error) {
		this.errorSubscribers.forEach((sub) => {
			sub(err)
		})
	}

	current(): Uint8Array | undefined {
		return this.token
	}

	async waitForToken(): Promise<Uint8Array> {
		return new Promise(async (resolve, reject) => {
			const notificationsStatus = await checkNotifications()
			if (notificationsStatus.status === RESULTS.BLOCKED) {
				reject(new Error('not authorized'))
				return
			}

			if (this.token !== undefined && this.token.length !== 0) {
				resolve(this.token)
				return
			}

			const resolver = (token: Uint8Array) => {
				this.removeListener(resolver)
				this.removeErrorListener(rejecter)
				resolve(token)
			}

			const rejecter = (err: Error) => {
				this.removeListener(resolver)
				this.removeErrorListener(rejecter)
				reject(err)
			}

			this.addListener(resolver)
			this.addErrorListener(rejecter)

			await requestNotifications(['alert', 'badge', 'sound'])
		})
	}

	addListener(arg0: (_: Uint8Array) => void) {
		this.subscribers.push(arg0)
	}

	removeListener(arg0: (_: Uint8Array) => void) {
		const index = this.subscribers.indexOf(arg0)
		if (index === -1) {
			return
		}

		this.subscribers.splice(index)
	}

	addErrorListener(arg0: (err: Error) => void) {
		this.errorSubscribers.push(arg0)
	}

	removeErrorListener(arg0: (err: Error) => void) {
		const index = this.errorSubscribers.indexOf(arg0)
		if (index === -1) {
			return
		}

		this.errorSubscribers.splice(index)
	}
}

export const tokenSubscriber = new PushTokenSubscriber()
