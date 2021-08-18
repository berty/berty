import React from 'react'
import { StatusBar } from 'react-native'
import { Translation } from 'react-i18next'
import { useNavigation, RouteProp } from '@react-navigation/native'

import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext, useNotificationsInhibitor, useThemeColor } from '@berty-tech/store/hooks'
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
			{t => (
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
	const checkNotificationPermission = route?.params?.checkNotificationPermission
	useNotificationsInhibitor(() => true)
	const { goBack } = useNavigation()
	const { persistentOptions, setPersistentOption } = useMsgrContext()
	const colors = useThemeColor()

	const handleComplete = async () => {
		goBack()

		if (checkNotificationPermission) {
			const notificationStatus = await checkPermissions('notification', {
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
				checkPermissions('notification')
			}
		}
	}

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
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
