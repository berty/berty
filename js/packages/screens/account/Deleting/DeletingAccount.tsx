import React from 'react'

import { Unary } from '@berty/components/account'
import { useDeleteAccount } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useMountEffect } from '@berty/store'

export const DeletingAccount: ScreenFC<'Account.Deleting'> = () => {
	const deleteAccount = useDeleteAccount()

	useMountEffect(() => {
		const f = async () => {
			await deleteAccount()
		}
		f()
	})

	return <Unary>Deleting account...</Unary>
}
