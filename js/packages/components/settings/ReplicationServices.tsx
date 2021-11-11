import React from 'react'
import { StatusBar } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	servicesAuthViaDefault,
	useAccountServices,
	PersistentOptionsKeys,
	useMessengerContext,
	useNotificationsInhibitor,
	useThemeColor,
	setCheckListItemDone,
} from '@berty-tech/store'

import SwiperCard from '../onboarding/SwiperCard'
import OnboardingWrapper from '../onboarding/OnboardingWrapper'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMessengerContext()
	const accountServices = useAccountServices() || []
	const { t }: any = useTranslation()
	const { goBack } = useNavigation()

	return (
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
								try {
									await servicesAuthViaDefault(ctx)
									await ctx.setPersistentOption({
										type: PersistentOptionsKeys.Configurations,
										payload: {
											...ctx.persistentOptions.configurations,
											replicate: {
												...ctx.persistentOptions.configurations.replicate,
												state: 'added',
											},
										},
									})
									await setCheckListItemDone(ctx, 'relay')
									goBack()
								} catch (e) {
									console.log(e)
								}
							},
					  }
			}
			skip={{
				text: t('onboarding.services-auth.skip'),
				onPress: async () => {
					await next()
				},
			}}
		/>
	)
}

export const ReplicationServices: ScreenFC<'Settings.ReplicationServices'> = ({
	navigation: { goBack },
}) => {
	useNotificationsInhibitor(() => true)
	const { persistentOptions, setPersistentOption } = useMessengerContext()
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<ServicesAuthBody
				next={async () => {
					await setPersistentOption({
						type: PersistentOptionsKeys.Configurations,
						payload: {
							...persistentOptions.configurations,
							replicate: {
								...persistentOptions.configurations.replicate,
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

export default ReplicationServices
