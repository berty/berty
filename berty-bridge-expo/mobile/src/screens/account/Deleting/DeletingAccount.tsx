import React from 'react'
import { useTranslation } from 'react-i18next'

import { CenteredTextScreen } from '@berty/components/account'
import { useDeleteAccount } from '@berty/hooks'
import { ScreenFC, useRouteParams } from '@berty/navigation'

export const DeletingAccount: ScreenFC<'Account.Deleting'> = () => {
	const { selectedAccount } = useRouteParams('Account.Deleting')
	const deleteAccount = useDeleteAccount()
	const { t } = useTranslation()

	React.useEffect(() => {
		const f = async () => {
			await deleteAccount(selectedAccount)
		}
		f()
	}, [deleteAccount, selectedAccount])

	return <CenteredTextScreen>{t('account.deleting')}</CenteredTextScreen>
}
