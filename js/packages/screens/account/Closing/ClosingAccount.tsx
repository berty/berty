import React from 'react'

import { StreamWithProgress } from '@berty/components/account'
import { useAppDispatch } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useMountEffect } from '@berty/store'
import { closeAccount } from '@berty/utils/accounts'

export const ClosingAccount: ScreenFC<'Account.Closing'> = ({
	route: {
		params: { callback },
	},
}) => {
	const dispatch = useAppDispatch()

	useMountEffect(() => {
		const f = async () => {
			await closeAccount(dispatch)
			callback()
		}

		f()
	})

	return (
		<>
			<StreamWithProgress />
		</>
	)
}
