import React from 'react'
import { ScrollView, View, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useHeaderHeight } from '@react-navigation/elements'
import { useDispatch, useSelector } from 'react-redux'

import beapi from '@berty/api'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'
import { IOSOnlyKeyboardAvoidingView } from '@berty/rnutil/keyboardAvoiding'
import { checkBlePermission } from '@berty/rnutil/checkPermissions'
import {
	addToBootstrap,
	addToRendezvous,
	addToStaticRelay,
	modifyFromBootstrap,
	modifyFromRendezvous,
	modifyFromStaticRelay,
	removeFromBootstrap,
	removeFromRendezvous,
	removeFromStaticRelay,
	selectBlePerm,
	selectBootstrap,
	selectEditedNetworkConfig,
	selectRendezvous,
	selectStaticRelay,
	setCurrentNetworkConfig,
	toggleFromBootstrap,
	toggleFromRendezvous,
	toggleFromStaticRelay,
} from '@berty/redux/reducers/networkConfig.reducer'
import { useAppDispatch, useAppSelector, useSyncNetworkConfigOnScreenRemoved } from '@berty/hooks'

import { AccordionV2, AccordionAddItemV2, AccordionItemV2 } from '@berty/components/Accordion'
import { ModalProvider, useModal } from '@berty/components/providers/modal.provider'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const Proximity: React.FC = () => {
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()
	const blePerm = useSelector(selectBlePerm)
	const networkConfig = useSelector(selectEditedNetworkConfig)
	const dispatch = useAppDispatch()

	return (
		<Section>
			{Platform.OS !== 'web' && (
				<ButtonSettingV2
					text={t('settings.network.ble-button')}
					toggle={{
						enable: true,
						value:
							blePerm === 'granted' &&
							networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							await checkBlePermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['bluetoothLe'],
								navigate,
							})
						},
					}}
				/>
			)}
			{Platform.OS === 'ios' && (
				<ButtonSettingV2
					text={t('settings.network.mc-button')}
					toggle={{
						enable: true,
						value:
							blePerm === 'granted' &&
							networkConfig?.appleMultipeerConnectivity ===
								beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							await checkBlePermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['appleMultipeerConnectivity'],
								navigate,
							})
						},
					}}
				/>
			)}
			{Platform.OS === 'android' && (
				<ButtonSettingV2
					text={t('settings.network.nearby-button')}
					toggle={{
						enable: true,
						value:
							blePerm === 'granted' &&
							networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							await checkBlePermission({
								setNetworkConfig: async newConfig => {
									dispatch(setCurrentNetworkConfig(newConfig))
								},
								networkConfig,
								changedKey: ['androidNearby'],
								navigate,
							})
						},
					}}
				/>
			)}
			<ButtonSettingV2
				text={t('settings.network.mdns-button')}
				toggle={{
					enable: true,
					value: networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled,
					action: async () => {
						dispatch(
							setCurrentNetworkConfig({
								...networkConfig,
								mdns:
									networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled
										? beapi.account.NetworkConfig.Flag.Disabled
										: beapi.account.NetworkConfig.Flag.Enabled,
							}),
						)
					},
				}}
				last
			/>
		</Section>
	)
}

const NetworkBody: React.FC = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const networkConfig = useSelector(selectEditedNetworkConfig)
	const { show, hide } = useModal()
	const rendezvous = useAppSelector(selectRendezvous)
	const bootstrap = useAppSelector(selectBootstrap)
	const staticRelay = useAppSelector(selectStaticRelay)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				{/*
				<Section>
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
				</Section>
				*/}
				<Proximity />
				<Section>
					<ButtonSettingV2
						text={t('settings.network.dht-button')}
						toggle={{
							enable: true,
							value: networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient,
							action: async () => {
								dispatch(
									setCurrentNetworkConfig({
										...networkConfig,
										dht:
											networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
												? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
												: beapi.account.NetworkConfig.DHTFlag.DHTClient,
									}),
								)
							},
						}}
					/>
					<AccordionV2 title={t('settings.network.rdvp-button')}>
						{(rendezvous || []).map(({ alias, url, isEnabled, isEditable }, index) => (
							<AccordionItemV2
								key={`rendezvous-item-${index}`}
								toggle={isEnabled}
								value={alias}
								onToggleChange={() => dispatch(toggleFromRendezvous(url))}
								onPressModify={
									isEditable
										? () =>
												show(
													<AccordionEdit
														title={t('onboarding.custom-mode.settings.modals.edit.title.rdvp')}
														onEdit={data => {
															dispatch(modifyFromRendezvous({ url, changes: data }))
															hide()
														}}
														onDelete={() => {
															dispatch(removeFromRendezvous(url))
															hide()
														}}
														defaultAlias={alias}
														defaultUrl={url}
														alreadyExistingUrls={rendezvous
															.map(({ url }) => url)
															.filter((url): url is string => url !== undefined)}
														alreadyExistingAliases={rendezvous
															.map(({ alias }) => alias)
															.filter((alias): alias is string => alias !== undefined)}
													/>,
												)
										: undefined
								}
							/>
						))}
						<AccordionAddItemV2
							onPress={() =>
								show(
									<AccordionAdd
										title={t('onboarding.custom-mode.settings.modals.add.title.rdvp')}
										onSubmit={data => {
											dispatch(addToRendezvous(data))
											hide()
										}}
										alreadyExistingAliases={rendezvous
											.map(({ alias }) => alias)
											.filter((alias): alias is string => alias !== undefined)}
										alreadyExistingUrls={rendezvous
											.map(({ url }) => url)
											.filter((url): url is string => url !== undefined)}
									/>,
								)
							}
						/>
					</AccordionV2>
				</Section>
				<Section>
					<AccordionV2 title={t('settings.network.relay-button')}>
						{(staticRelay || []).map(({ alias, url, isEnabled, isEditable }, index) => (
							<AccordionItemV2
								key={`rendezvous-item-${index}`}
								toggle={isEnabled}
								value={alias}
								onToggleChange={() => dispatch(toggleFromStaticRelay(url))}
								onPressModify={
									isEditable
										? () =>
												show(
													<AccordionEdit
														title={t('onboarding.custom-mode.settings.modals.edit.title.relay')}
														onEdit={data => {
															dispatch(modifyFromStaticRelay({ url, changes: data }))
															hide()
														}}
														onDelete={() => {
															dispatch(removeFromStaticRelay(url))
															hide()
														}}
														defaultUrl={url}
														alreadyExistingUrls={staticRelay
															.map(({ url }) => url)
															.filter((url): url is string => url !== undefined)}
														defaultAlias={alias}
														alreadyExistingAliases={staticRelay
															.map(({ alias }) => alias)
															.filter((alias): alias is string => alias !== undefined)}
													/>,
												)
										: undefined
								}
							/>
						))}
						<AccordionAddItemV2
							onPress={() =>
								show(
									<AccordionAdd
										title={t('onboarding.custom-mode.settings.modals.add.title.relay')}
										onSubmit={data => {
											dispatch(addToStaticRelay(data))
											hide()
										}}
										alreadyExistingAliases={staticRelay
											.map(({ alias }) => alias)
											.filter((alias): alias is string => alias !== undefined)}
										alreadyExistingUrls={staticRelay
											.map(({ url }) => url)
											.filter((url): url is string => url !== undefined)}
									/>,
								)
							}
						/>
					</AccordionV2>
					<AccordionV2 title={t('settings.network.bootstrap-button')}>
						{(bootstrap || []).map(({ alias, url, isEnabled, isEditable }, index) => (
							<AccordionItemV2
								key={`rendezvous-item-${index}`}
								toggle={isEnabled}
								value={alias}
								onToggleChange={() => dispatch(toggleFromBootstrap(url))}
								onPressModify={
									isEditable
										? () =>
												show(
													<AccordionEdit
														title={t('onboarding.custom-mode.settings.modals.edit.title.bootstrap')}
														onEdit={data => {
															dispatch(modifyFromBootstrap({ url, changes: data }))
															hide()
														}}
														onDelete={() => {
															dispatch(removeFromBootstrap(url))
															hide()
														}}
														defaultAlias={alias}
														defaultUrl={url}
														alreadyExistingUrls={bootstrap
															.map(({ url }) => url)
															.filter((url): url is string => url !== undefined)}
														alreadyExistingAliases={bootstrap
															.map(({ alias }) => alias)
															.filter((alias): alias is string => alias !== undefined)}
													/>,
												)
										: undefined
								}
							/>
						))}
						<AccordionAddItemV2
							onPress={() =>
								show(
									<AccordionAdd
										title={t('onboarding.custom-mode.settings.modals.add.title.bootstrap')}
										onSubmit={data => {
											dispatch(addToBootstrap(data))
											hide()
										}}
										alreadyExistingAliases={bootstrap
											.map(({ alias }) => alias)
											.filter((alias): alias is string => alias !== undefined)}
										alreadyExistingUrls={bootstrap
											.map(({ url }) => url)
											.filter((url): url is string => url !== undefined)}
									/>,
								)
							}
						/>
					</AccordionV2>
				</Section>
			</ScrollView>
		</View>
	)
}

export const Network: ScreenFC<'Settings.Network'> = () => {
	const headerHeight = useHeaderHeight()
	useSyncNetworkConfigOnScreenRemoved()

	return (
		<ModalProvider>
			<IOSOnlyKeyboardAvoidingView
				behavior='padding'
				keyboardVerticalOffset={headerHeight}
				style={[{ flex: 1 }]}
			>
				<NetworkBody />
			</IOSOnlyKeyboardAvoidingView>
		</ModalProvider>
	)
}
