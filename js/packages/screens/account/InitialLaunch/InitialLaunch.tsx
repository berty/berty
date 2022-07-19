import React from 'react'

import { LoaderDots } from '@berty/components/LoaderDots'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { ScreenFC, useNavigation } from '@berty/navigation'

import { initialLaunch } from './initialLaunch.effect'

export const InitialLaunch: ScreenFC<'Account.InitialLaunch'> = () => {
	const { reset } = useNavigation()

	React.useEffect(() => {
		const f = async () => {
			const navObject = await initialLaunch()
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
