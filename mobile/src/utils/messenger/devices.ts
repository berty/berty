import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'

export const getDevicesForConversationAndMember = (
	client: ServiceClientType<beapi.messenger.MessengerService>,
	conversationPk: string | undefined | null,
	memberPk: string | undefined | null,
) => {
	if (!conversationPk || !memberPk) {
		return new Promise<beapi.messenger.IDevice[]>(resolve => {
			resolve([])
		})
	}

	return new Promise<beapi.messenger.IDevice[]>(resolve => {
		let devices = [] as beapi.messenger.IDevice[]
		let subStream: { stop: () => void } | null

		client
			?.listMemberDevices({ memberPk: memberPk, conversationPk: conversationPk })
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err) {
						return
					}

					if (!msg) {
						return
					}

					devices.push(msg.device!)
				})

				await stream.start()
			})
			.then(() => resolve(devices))

		return () => {
			if (subStream !== null) {
				subStream.stop()
			}
		}
	})
}
