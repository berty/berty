import React from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar, View } from 'react-native'
import { useSelector } from 'react-redux'

import OnboardingWrapper from '@berty/components/onboarding/OnboardingWrapper'
import SwiperCard from '@berty/components/onboarding/SwiperCard'
import {
	useAccountServices,
	useAppDispatch,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { servicesAuthViaDefault } from '@berty/utils/remote-services/remote-services'

const ServicesAuthBody: React.FC<{ next: () => void }> = ({ next }) => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
	const accountServices = useAccountServices() || []
	const { t } = useTranslation()
	const { goBack } = useNavigation()
	const protocolClient = useSelector(selectProtocolClient)

	const getButton = () => {
		if (accountServices.length > 0) {
			return undefined
		}
		return {
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

	return (
		<View style={{ flex: 1 }}>
			<SwiperCard
				title={t('settings.berty-services.title')}
				desc={t('settings.berty-services.desc')}
				button={getButton()}
				skip={{
					text: t('settings.berty-services.skip'),
					onPress: () => next(),
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
