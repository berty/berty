import React from 'react'

import { LoaderDots } from '@berty/components/LoaderDots'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { ScreenFC, useNavigation } from '@berty/navigation'

import { goToLogInOrCreate } from './goToLogInOrCreate.effect'

export const GoToLogInOrCreate: ScreenFC<'Account.GoToLogInOrCreate'> = () => {
	const { reset } = useNavigation()

	React.useEffect(() => {
		const f = async () => {
			const navObject = await goToLogInOrCreate()
			// Prevent user going back to the initial launch screen
			reset({
				index: 0,
				routes: [
					{
						name: navObject.name,
						params: navObject.params,
					},
				],
			})
		}

		f()
	}, [reset])

	return (
		<>
			<StatusBarPrimary />
			<LoaderDots />
		</>
	)
}
