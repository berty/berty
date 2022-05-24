import React, { useContext } from 'react'

import { LoaderDots } from '@berty/components/LoaderDots'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { EventEmitterContext } from '@berty/contexts/eventEmitter.context'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectStreamProgress } from '@berty/redux/reducers/ui.reducer'
import { openAccount } from '@berty/utils/accounts'

import { StreamProgress } from '../../../components/account/StreamProgress'
import { openClients } from './openClients.effect'
import { prepareAccount } from './prepareAccount.effect'

export const OpeningAccount: ScreenFC<'Account.Opening'> = ({
	route: {
		params: { selectedAccount, isNewAccount = false },
	},
}) => {
	const dispatch = useAppDispatch()
	const { reset } = useNavigation()
	const eventEmitter = useContext(EventEmitterContext)

	const streamProgress = useAppSelector(selectStreamProgress)

	React.useEffect(() => {
		const f = async () => {
			// open account
			await openAccount(selectedAccount, dispatch)

			// opening messenger and protocol clients
			await openClients(eventEmitter, dispatch)

			dispatch(prepareAccount({ reset, selectedAccount, isNewAccount }))
		}

		f()
	}, [dispatch, eventEmitter, isNewAccount, reset, selectedAccount])

	return (
		<>
			<StatusBarPrimary />
			{streamProgress ? <StreamProgress /> : <LoaderDots />}
		</>
	)
}
