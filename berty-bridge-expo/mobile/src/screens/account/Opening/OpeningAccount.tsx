import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { StreamProgress } from '@berty/components'
import { LoaderDots } from '@berty/components/LoaderDots'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectStreamProgress } from '@berty/redux/reducers/ui.reducer'
import { openAccount } from '@berty/utils/accounts'
import { openClients } from '@berty/utils/messenger/clients'

import { prepareAccount } from './prepareAccount.effect'

export const OpeningAccount: ScreenFC<'Account.Opening'> = ({
	route: {
		params: { selectedAccount, isNewAccount = false },
	},
}) => {
	const dispatch = useAppDispatch()
	const navigation = useNavigation()
	const { t } = useTranslation()

	const streamProgress = useAppSelector(selectStreamProgress)

	React.useEffect(() => {
		const f = async () => {
			// open account
			await openAccount(selectedAccount, dispatch)

			// opening messenger and protocol clients
			await openClients(dispatch)

			// call thunk function prepareAccount
			dispatch(prepareAccount({ navigation, t, selectedAccount, isNewAccount }))
		}

		f()
	}, [dispatch, isNewAccount, navigation, selectedAccount, t])

	return (
		<>
			<StatusBarPrimary />
			{streamProgress ? <StreamProgress /> : <LoaderDots />}
		</>
	)
}
