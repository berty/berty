import { PeerNetworkStatus } from '@berty/redux/reducers/messenger.reducer'

export interface MemberBarItem {
	networkStatus: PeerNetworkStatus
	publicKey: string | undefined
	alreadyConnected: boolean
}
