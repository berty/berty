import { useHeaderHeight } from '@react-navigation/elements'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import beapi from '@berty/api'
import {
	DividerItem,
	MenuToggle,
	ItemSection,
	RendezvousAltDropdown,
	BootstrapAltDropdown,
	RelayAltDropdown,
} from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useAppDispatch, useSyncNetworkConfigOnScreenRemoved, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectBlePerm,
	selectEditedNetworkConfig,
	setCurrentNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import { checkProximityPermission } from '@berty/utils/permissions/checkPermissions'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'

const Proximity: React.FC = () => {
	const { navigate } = useNavigation()
	const { t } = useTranslation()
	const blePerm = useSelector(selectBlePerm)
	const networkConfig = useSelector(selectEditedNetworkConfig)
	const dispatch = useAppDispatch()

	return (
		<ItemSection>
			{Platform.OS !== 'web' && (
				<>
					<MenuToggle
						isToggleOn={
							blePerm === 'granted' &&
							networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
						}
						onPress={async () => {
							await checkProximityPermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['bluetoothLe'],
								navigate,
							})
						}}
					>
						{t('settings.network.ble-button')}
					</MenuToggle>
					<DividerItem />
				</>
			)}
			{Platform.OS === 'ios' && (
				<>
					<MenuToggle
						isToggleOn={
							blePerm === 'granted' &&
							networkConfig?.appleMultipeerConnectivity === beapi.account.NetworkConfig.Flag.Enabled
						}
						onPress={async () => {
							await checkProximityPermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['appleMultipeerConnectivity'],
								navigate,
							})
						}}
					>
						{t('settings.network.mc-button')}
					</MenuToggle>
					<DividerItem />
				</>
			)}
			{Platform.OS === 'android' && (
				<>
					<MenuToggle
						isToggleOn={
							blePerm === 'granted' &&
							networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
						}
						onPress={async () => {
							await checkProximityPermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['androidNearby'],
								navigate,
							})
						}}
					>
						{t('settings.network.nearby-button')}
					</MenuToggle>
					<DividerItem />
				</>
			)}
			<MenuToggle
				isToggleOn={networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				onPress={async () => {
					dispatch(
						setCurrentNetworkConfig({
							...networkConfig,
							mdns:
								networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
						}),
					)
				}}
			>
				{t('settings.network.mdns-button')}
			</MenuToggle>
		</ItemSection>
	)
}

const NetworkBody: React.FC = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const networkConfig = useSelector(selectEditedNetworkConfig)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				{/*
				<ItemSection>
					<ButtonSettingV2
						text={t('settings.network.memo-cell-button')}
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2
						text={t('settings.network.medias-cell-button')}
						toggle={{ enable: true }}
						disabled
					/>
				</ItemSection>
				*/}
				<Proximity />
				<ItemSection>
					<MenuToggle
						isToggleOn={networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient}
						onPress={async () => {
							dispatch(
								setCurrentNetworkConfig({
									...networkConfig,
									dht:
										networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
											? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
											: beapi.account.NetworkConfig.DHTFlag.DHTClient,
								}),
							)
						}}
					>
						{t('settings.network.dht-button')}
					</MenuToggle>
					<DividerItem />
					<RendezvousAltDropdown />
				</ItemSection>
				<ItemSection>
					<RelayAltDropdown />
					<DividerItem />
					<BootstrapAltDropdown />
				</ItemSection>
			</ScrollView>
		</View>
	)
}

export const Network: ScreenFC<'Settings.Network'> = () => {
	const headerHeight = useHeaderHeight()
	useSyncNetworkConfigOnScreenRemoved()

	return (
		<IOSOnlyKeyboardAvoidingView
			behavior='padding'
			keyboardVerticalOffset={headerHeight}
			style={[{ flex: 1 }]}
		>
			<NetworkBody />
		</IOSOnlyKeyboardAvoidingView>
	)
}
