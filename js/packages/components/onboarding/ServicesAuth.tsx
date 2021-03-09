import React from 'react'
import { StatusBar } from 'react-native'
import { Translation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

import { servicesAuthViaDefault, useAccountServices } from '@berty-tech/store/services'
import { useMsgrContext, useNotificationsInhibitor } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import { RouteProp } from '@react-navigation/native'
import { useStyles } from '@berty-tech/styles'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMsgrContext()
	const accountServices = useAccountServices() || []
	const { goBack } = useNavigation()

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

										goBack()
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

export const ServicesAuth: React.FC<{ route: RouteProp<any, any> }> = () => {
	useNotificationsInhibitor(() => true)
	const { goBack } = useNavigation()
	const { persistentOptions, setPersistentOption } = useMsgrContext()
	const [{ color }] = useStyles()

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

					goBack()
				}}
			/>
		</OnboardingWrapper>
	)
}

export default ServicesAuth
