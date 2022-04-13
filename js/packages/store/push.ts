import rnutil from '@berty/rnutil'
import { RESULTS } from 'react-native-permissions'
import {
	requestAndPersistPushToken,
	servicesAuthViaDefault,
	serviceTypes,
} from '@berty/store/services'
import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { PermissionType } from '@berty/rnutil/checkPermissions'

export const enablePushPermission = async (
	messengerClient: ServiceClientType<beapi.messenger.MessengerService>,
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService>,
	navigate: any,
) => {
	const account = await messengerClient.accountGet({})
	const hasKnownPushServer = account.account?.serviceTokens?.some(
		t => t.serviceType === serviceTypes.Push,
	)

	// Get or ask for permission
	const status = await rnutil.checkPermissions(PermissionType.notification)
	if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
		await new Promise(resolve =>
			rnutil.checkPermissions(PermissionType.notification, {
				navigate,
				navigateToPermScreenOnProblem: true,
				onComplete: () =>
					new Promise(subResolve => {
						subResolve()
						setTimeout(resolve, 800)
					}),
			}),
		)
	}

	// Persist push token if needed
	await requestAndPersistPushToken(protocolClient)

	// Register push server secrets if needed
	if (!hasKnownPushServer) {
		try {
			await servicesAuthViaDefault(protocolClient)
			await new Promise(r => setTimeout(r, 300))
		} catch (e) {
			console.warn('no push server known')
			throw new Error('no push server known')
		}
	}
}
