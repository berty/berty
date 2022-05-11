import React from 'react'

import { StreamWithProgress } from '@berty/components/account'
import { useAppDispatch } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { setSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { importAccount, refreshAccountList } from '@berty/utils/accounts'

export const ImportingAccount: ScreenFC<'Account.Importing'> = ({
	route: {
		params: { filePath },
	},
}) => {
	const dispatch = useAppDispatch()

	React.useEffect(() => {
		const f = async () => {
			const resp = await importAccount(filePath, dispatch)
			if (!resp) {
				throw new Error('no account returned')
			}

			if (!resp.accountMetadata?.accountId) {
				throw new Error('no account id returned')
			}

			await refreshAccountList()
			dispatch(setSelectedAccount(resp.accountMetadata.accountId))
		}

		f()
	}, [dispatch, filePath])

	return (
		<>
			<StreamWithProgress />
		</>
	)
}
