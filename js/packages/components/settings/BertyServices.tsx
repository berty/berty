import React from 'react'
import { StatusBar, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	servicesAuthViaDefault,
	useAccountServices,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'

import SwiperCard from '../onboarding/SwiperCard'
import OnboardingWrapper from '../onboarding/OnboardingWrapper'
import { useSelector } from 'react-redux'
import { selectProtocolClient } from '@berty-tech/redux/reducers/ui.reducer'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty-tech/redux/reducers/persistentOptions.reducer'
import { useAppDispatch } from '@berty-tech/react-redux'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
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
										dispatch(
											setPersistentOption({
												type: PersistentOptionsKeys.Configurations,
												payload: {
													...persistentOptions.configurations,
													replicate: {
														...persistentOptions.configurations.replicate,
														state: 'added',
													},
												},
											}),
										)
										goBack()
									} catch (e) {
										console.log(e)
									}
								},
						  }
				}
				skip={{
					text: t('settings.berty-services.skip'),
					onPress: () => {
						next()
					},
				}}
			/>
		</View>
	)
}

export const BertyServices: ScreenFC<'Settings.BertyServices'> = ({ navigation: { goBack } }) => {
	useNotificationsInhibitor(() => true)
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
				<ServicesAuthBody
					next={() => {
						dispatch(
							setPersistentOption({
								type: PersistentOptionsKeys.Configurations,
								payload: {
									...persistentOptions.configurations,
									replicate: {
										...persistentOptions.configurations.replicate,
										state: 'skipped',
									},
								},
							}),
						)
						goBack()
					}}
				/>
			</View>
		</OnboardingWrapper>
	)
}

export default BertyServices
