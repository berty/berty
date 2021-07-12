import React from 'react'
import { StatusBar } from 'react-native'
import { Translation } from 'react-i18next'
import { useNavigation, RouteProp } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext, useNotificationsInhibitor } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import { checkPermissions } from '../utils'
import { RESULTS } from 'react-native-permissions'

const ServicesAuthBody: React.FC<{ next: () => void; handleComplete: () => void }> = ({
	next,
	handleComplete,
}) => {
	const ctx = useMsgrContext()
	const accountServices = useAccountServices() || []

	React.useEffect(() => {
		if (accountServices.length > 0) {
			next()
		}
	}, [next, accountServices.length])

	return (
		<Translation>
			{(t) => (
				<SwiperCard
					header={t('onboarding.services-auth.header')}
					label={t('onboarding.services-auth.recommended')}
					title={t('onboarding.services-auth.title')}
					description={t('onboarding.services-auth.desc')}
					button={
						accountServices.length > 0
							? undefined
							: {
									text: t('onboarding.services-auth.button'),
									onPress: async () => {
										await servicesAuthViaDefault(ctx)
										await ctx.setPersistentOption({
											type: PersistentOptionsKeys.Configurations,
											payload: {
												...ctx.persistentOptions.configurations,
												network: {
													...ctx.persistentOptions.configurations.network,
													state: 'added',
												},
											},
										})
										handleComplete()
									},
							  }
					}
					skip={{
						text: t('onboarding.notifications.skip'),
						onPress: next,
					}}
				/>
			)}
		</Translation>
	)
}

export const ServicesAuth: React.FC<{ route: RouteProp<any, any> }> = ({ route }) => {
	const checkP2POnly = route?.params?.checkP2POnly
	useNotificationsInhibitor(() => true)
	const { goBack } = useNavigation()
	const { persistentOptions, setPersistentOption } = useMsgrContext()
	const [{ color }] = useStyles()

	const handleComplete = async () => {
		goBack()

		const permissionsToCheck = []

		const p2pStatus = await checkPermissions(['p2p'], { isToNavigate: false })

		if (p2pStatus === RESULTS.GRANTED) {
			const state = true
			await setPersistentOption({
				type: PersistentOptionsKeys.BLE,
				payload: {
					enable: state,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.MC,
				payload: {
					enable: state,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.Nearby,
				payload: {
					enable: state,
				},
			})
		} else {
			permissionsToCheck.push('p2p')
		}

		if (!checkP2POnly) {
			const notificationStatus = await checkPermissions(['notification'], {
				isToNavigate: false,
			})
			if (notificationStatus === RESULTS.GRANTED) {
				await setPersistentOption({
					type: PersistentOptionsKeys.Configurations,
					payload: {
						...persistentOptions.configurations,
						notification: {
							...persistentOptions.configurations.notification,
							state: 'added',
						},
					},
				})
			} else {
				permissionsToCheck.push('notification')
			}
		}

		checkPermissions(permissionsToCheck)
	}

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={color.blue} barStyle='light-content' />
			<ServicesAuthBody
				next={async () => {
					await setPersistentOption({
						type: PersistentOptionsKeys.Configurations,
						payload: {
							...persistentOptions.configurations,
							network: {
								...persistentOptions.configurations.network,
								state: 'skipped',
							},
						},
					})
					handleComplete()
				}}
				handleComplete={handleComplete}
			/>
		</OnboardingWrapper>
	)
}

export default ServicesAuth
