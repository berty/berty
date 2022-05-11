import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { EventEmitterContext } from '@berty/contexts/eventEmitter.context'
import { useAccount, useAppDispatch, useAppSelector, useConversationsDict } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectIsNewAccount,
	selectSelectedAccount,
	selectStreamInProgress,
} from '@berty/redux/reducers/ui.reducer'
import { useMessengerClient, useMountEffect } from '@berty/store'
import { openAccount } from '@berty/utils/accounts'

import { StreamWithProgress } from '../../../components/account/StreamWithProgress'
import { openClients } from './openClients.effect'
import { prepareAccount } from './prepareAccount.effect'

export const OpeningAccount: ScreenFC<'Account.Opening'> = () => {
	// necessary to update state of messengerClient value
	const [clientsOpened, setClientsOpened] = React.useState<boolean>(false)
	const dispatch = useAppDispatch()
	const { navigate } = useNavigation()
	const eventEmitter = useContext(EventEmitterContext)

	const messengerClient = useMessengerClient()
	const conversations = useConversationsDict()
	const account = useAccount()

	const streamProgress = useAppSelector(selectStreamInProgress)
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const isNewAccount = useAppSelector(selectIsNewAccount)

	useMountEffect(() => {
		const f = async () => {
			// open account
			await openAccount(selectedAccount, dispatch)

			// opening messenger and protocol clients
			await openClients(eventEmitter, dispatch)

			setClientsOpened(true)
		}

		f()
	})

	useEffect(() => {
		const f = async () => {
			// prepare account, like close convos, update clients datas
			await prepareAccount(
				isNewAccount,
				messengerClient,
				selectedAccount,
				account,
				conversations,
				dispatch,
				navigate,
			)
		}
		if (clientsOpened) {
			setClientsOpened(false)
			f()
		}
	}, [
		account,
		clientsOpened,
		conversations,
		dispatch,
		isNewAccount,
		messengerClient,
		navigate,
		selectedAccount,
	])

	return (
		<>
			{streamProgress ? (
				<StreamWithProgress />
			) : (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<UnifiedText>
						Opening account stream done, opening messenger/protocol clients and preparing account...
					</UnifiedText>
				</View>
			)}
		</>
	)
}
