import React from 'react'

import { useTranslation } from 'react-i18next'
import { StatusBar, View } from 'react-native'
import { useSelector } from 'react-redux'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { selectProtocolClient } from '@berty-tech/redux/reducers/ui.reducer'
import {
	servicesAuthViaDefault,
	useAccountServices,
	PersistentOptionsKeys,
	useMessengerContext,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'

import OnboardingWrapper from '../onboarding/OnboardingWrapper'
import SwiperCard from '../onboarding/SwiperCard'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMessengerContext()
	const accountServices = useAccountServices() || []
	const { t }: any = useTranslation()
	const { goBack } = useNavigation()
	const protocolClient = useSelector(selectProtocolClient)

	return (
		<View style={{ flex: 1 }}>
			<SwiperCard
				title={t('settings.berty-services.title')}
				desc={t('settings.berty-services.desc')}
				button={
					accountServices.length > 0
						? undefined
						: {
								text: t('settings.berty-services.button'),
								onPress: async () => {
									try {
										await servicesAuthViaDefault(protocolClient)
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
										goBack()
									} catch (e) {
										console.log(e)
									}
								},
						  }
				}
				skip={{
					text: t('settings.berty-services.skip'),
					onPress: async () => {
						await next()
					},
				}}
			/>
		</View>
	)
}

export const BertyServices: ScreenFC<'Settings.BertyServices'> = ({ navigation: { goBack } }) => {
	useNotificationsInhibitor(() => true)
	const { persistentOptions, setPersistentOption } = useMessengerContext()
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
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
			</View>
		</OnboardingWrapper>
	)
}

export default BertyServices
