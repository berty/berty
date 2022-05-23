import React from 'react'

import { CenteredTextScreen } from '@berty/components/account'
import { useDeleteAccount } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useMountEffect } from '@berty/store'

export const DeletingAccount: ScreenFC<'Account.Deleting'> = ({
	route: {
		params: { selectedAccount },
	},
}) => {
	const deleteAccount = useDeleteAccount()

	useMountEffect(() => {
		const f = async () => {
			await deleteAccount(selectedAccount)
		}
		f()
	})

	return <CenteredTextScreen>Deleting account...</CenteredTextScreen>
}
