import { NavigationProp } from '@react-navigation/native'

import beapi from '@berty/api'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { ScreensParams } from '@berty/navigation/types'

export interface SendingFilesProps {
	setSending: (sending: boolean) => void
	messengerClient: WelshMessengerServiceClient | null
	onClose: (value: beapi.messenger.IMedia[] | undefined) => Promise<void>
}

export interface HandlePressPermissionProps extends SendingFilesProps {
	navigate: NavigationProp<ScreensParams>['navigate']
}

export interface PrepareMediaAndSendProps extends SendingFilesProps {
	res: (beapi.messenger.IMedia & { uri?: string })[]
}
