import React, { useMemo, useState } from 'react'
import { View, ScrollView, Vibration } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import DropDownPicker from 'react-native-dropdown-picker'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useAccount } from '@berty-tech/store/hooks'
import { serviceTypes, useAccountServices } from '@berty-tech/store/services'
import { useNavigation } from '@berty-tech/navigation'
import i18n from '@berty-tech/berty-i18n'
import { berty } from '@berty-tech/api/index.pb'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { languages } from '@berty-tech/berty-i18n/locale/languages'
import { Translation } from 'react-i18next'

//
// Mode
//

// Types
type BodyModeProps = {
	isMode: boolean
}

// Styles
const useStylesMode = () => {
	const [{ text, margin }] = useStyles()
	return {
		buttonListUnderStateText: [text.bold.small, text.size.tiny, margin.right.scale(60)],
		buttonSettingText: [text.bold.small, text.size.small, { color: 'rgba(43,46,77,0.8)' }], // TODO: Fix horizontal alignment
	}
}

const BodyMode: React.FC<BodyModeProps> = ({ isMode }) => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin, color, text, column }, { scaleSize }] = useStyles()
	const navigation = useReactNavigation()
	const account: berty.messenger.v1.Account = useAccount()
	const services = useAccountServices()
	const replicationServices = services.filter(
		(s: any) => s.serviceType === serviceTypes.Replication,
	)

	const ctx = useMsgrContext()
	const enableNotif = ctx.persistentOptions.notifications.enable

	const items = useMemo(() => {
		const items = Object.entries(languages).map(([key, attrs]) => ({
			label: attrs.localName,
			value: key,
		}))

		items.push({ label: 'Debug', value: 'cimode' })

		return items
	}, [])

	const currentLanguage = ctx.persistentOptions.i18n.language

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<DropDownPicker
				items={items}
				defaultValue={currentLanguage}
				containerStyle={[{ marginTop: 22, height: 60 }]}
				onChangeItem={async (item: any) => {
					await i18n.changeLanguage(item.value)
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.I18N,
						payload: {
							language: item.value,
						},
					})
				}}
			/>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconColor={color.blue}
				state={{
					value: enableNotif ? 'Enabled' : 'Disabled',
					color: enableNotif ? color.green : color.red,
					bgColor: enableNotif ? color.light.green : color.light.red,
				}}
				onPress={() => navigation.navigate('Settings.Notifications')}
			/>
			<ButtonSetting
				name='Bluetooth'
				icon='bluetooth-outline'
				iconColor={color.blue}
				onPress={() => navigation.navigate('Settings.Bluetooth')}
			/>
			<ButtonSetting
				name='Touch ID at launch'
				icon='info-outline'
				iconColor={color.blue}
				toggled
				varToggle={ctx.persistentOptions?.authenticate.touchID}
				actionToggle={async () =>
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.Auth,
						payload: {
							touchID: ctx.persistentOptions?.authenticate.touchID ? false : true,
							authenticated: true,
						},
					})
				}
			/>
			<ButtonSetting
				name='App mode'
				icon='options-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
				state={{
					value: isMode ? 'Performance' : 'Privacy',
					color: color.white,
					bgColor: isMode ? color.blue : color.red,
					stateIcon: isMode ? 'flash-outline' : 'lock-outline',
					stateIconColor: color.white,
				}}
				disabled
			>
				<Text
					style={[
						column.item.right,
						_styles.buttonListUnderStateText,
						isMode ? text.color.blue : text.color.red,
						margin.bottom.small,
					]}
				>
					Easy to use - All the features
				</Text>
				<View style={[padding.right.small]}>
					<ButtonSettingItem
						value='Receive push notifications'
						// color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
					/>
					<ButtonSettingItem
						value='Receive contact requests'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
					/>
					<ButtonSettingItem
						value='Local peer discovery (BLE & Multicast DNS)'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
					/>
				</View>
			</ButtonSetting>
			<ButtonSetting name='Dark mode' icon='moon-outline' iconColor={color.blue} toggled disabled />
			<ButtonSetting
				name='Receive contact requests'
				icon='person-done-outline'
				iconColor={color.blue}
				iconSize={30}
				toggled
				disabled
			/>
			<ButtonSetting
				name='External services'
				icon='cube-outline'
				iconColor={color.blue}
				iconSize={30}
				actionIcon='arrow-ios-forward'
				onPress={() => navigation.navigate('Settings.ServicesAuth')}
			/>
			<ButtonSetting
				name='Auto replicate'
				icon='cloud-upload-outline'
				iconColor={color.blue}
				actionIcon={
					// TODO: make toggle usable and use it
					replicationServices.length !== 0 && account.replicateNewGroupsAutomatically
						? 'toggle-right'
						: 'toggle-left-outline'
				}
				disabled={replicationServices.length === 0}
				onPress={async () => {
					if (replicationServices.length === 0) {
						return
					}

					await ctx.client.replicationSetAutoEnable({
						enabled: !account.replicateNewGroupsAutomatically,
					})
				}}
			/>
			<ButtonSetting
				name='Multicast DNS'
				icon='upload'
				iconColor={color.blue}
				iconSize={30}
				toggled
				disabled
			>
				<Text
					style={[
						_styles.buttonSettingText,
						text.color.grey,
						{ marginLeft: margin.left.big.marginLeft + 3 * scaleSize },
					]}
				>
					Local Peer discovery
				</Text>
			</ButtonSetting>
			<ButtonSetting
				name='Blocked contacts'
				icon='person-delete-outline'
				iconSize={30}
				iconColor={color.blue}
				state={{
					value: '3 blocked',
					color: color.blue,
					bgColor: color.light.blue,
				}}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Delete my account'
				icon='trash-2-outline'
				iconSize={30}
				iconColor={'red'}
				actionIcon='arrow-ios-forward'
				onPress={() => {
					Vibration.vibrate([1000, 250, 1000])
					navigation.navigate('Modals', {
						screen: 'DeleteAccount',
					})
				}}
			/>
		</View>
	)
}

export const Mode: React.FC<{}> = () => {
	const [isMode] = useState(true)
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()
	return (
		<Translation>
			{(t) => (
				<Layout style={[flex.tiny, background.white]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false} contentContainerStyle={[padding.bottom.scale(90)]}>
							<HeaderSettings
								title={t('settings.title')}
								desc={t('settings.title-description')}
								undo={goBack}
							/>
							<BodyMode isMode={isMode} />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
