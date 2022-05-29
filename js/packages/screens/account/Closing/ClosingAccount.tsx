import React from 'react'

import { StreamProgress } from '@berty/components/account'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { useAppDispatch } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { closeAccount } from '@berty/utils/accounts'

export const ClosingAccount: ScreenFC<'Account.Closing'> = ({
	route: {
		params: { callback },
	},
}) => {
	const dispatch = useAppDispatch()

	React.useEffect(() => {
		const f = async () => {
			await closeAccount(dispatch)
			callback()
		}

		f()
	}, [callback, dispatch])

	return (
		<>
			<StatusBarPrimary />
			<StreamProgress />
		</>
	)
}
