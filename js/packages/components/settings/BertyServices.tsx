import React from 'react'
import { StatusBar, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	servicesAuthViaDefault,
	useAccountServices,
	PersistentOptionsKeys,
	useMessengerContext,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import { setChecklistItemDone } from '@berty-tech/redux/reducers/checklist.reducer'
import { useAppDispatch } from '@berty-tech/redux/react-redux'

import SwiperCard from '../onboarding/SwiperCard'
import OnboardingWrapper from '../onboarding/OnboardingWrapper'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const ctx = useMessengerContext()
	const accountServices = useAccountServices() || []
	const { t }: any = useTranslation()
	const { goBack } = useNavigation()
	const dispatch = useAppDispatch()

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
										dispatch(setChecklistItemDone({ key: 'berty-services' }))
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
