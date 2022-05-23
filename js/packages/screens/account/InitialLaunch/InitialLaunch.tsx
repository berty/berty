import React from 'react'

import { LoaderDots } from '@berty/components/LoaderDots'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { ScreenFC, useNavigation } from '@berty/navigation'

import { initialLaunch } from './initialLaunch.effect'

export const InitialLaunch: ScreenFC<'Account.InitialLaunch'> = () => {
	const { navigate } = useNavigation()

	React.useEffect(() => {
		const f = async () => {
			const navObject = await initialLaunch()
			navigate(navObject.name, navObject.params)
		}

		f()
	}, [navigate])

	return (
		<>
			<StatusBarPrimary />
			<LoaderDots />
		</>
	)
}
