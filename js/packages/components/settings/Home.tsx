import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { Translation, useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'

import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
} from '../shared-components/SettingsButtons'
import HeaderSettings from '../shared-components/Header'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import logo from '../main/1_berty_picto.png'
import { AccountAvatar } from '../avatars'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import i18n from '@berty-tech/berty-i18n'
import { DropDownPicker } from '@berty-tech/components/shared-components/DropDownPicker'
import { languages } from '@berty-tech/berty-i18n/locale/languages'

const useStylesHome = () => {
	const [{ height, margin, padding, text }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(50),
	}
}

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding, color }] = useStyles()
	const { navigate } = useNavigation()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View
					style={[
						padding.horizontal.medium,
						padding.top.small,
						{ position: 'absolute', width: '100%', bottom: -40 },
					]}
				>
					<ButtonSettingRow
						state={[
							{
								name: t('settings.help.updates-button'),
								icon: 'arrow-upward-outline',
								color: color.red,
								style: _styles.firstHeaderButton,
								onPress: () => navigate.settings.appUpdates(),
							},
							{
								name: t('settings.home.header-left-button'),
								icon: 'question-mark-circle-outline',
								color: color.red,
								style: _styles.firstHeaderButton,
								onPress: () => navigate.settings.help(),
							},
							{
								name: t('settings.home.header-right-button'),
								icon: 'settings-2-outline',
								color: color.blue,
								style: _styles.thirdHeaderButton,
								onPress: () => navigate.settings.mode(),
							},
						]}
					/>
				</View>
			)}
		</Translation>
	)
}

const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const [
		{ row, margin, background, border, padding },
		{ windowWidth, windowHeight, scaleHeight, scaleSize },
	] = useStyles()
	const account = useAccount()
	const navigation = useNavigation()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, margin.top.scale(30), padding.bottom.scale(70)]}>
			<TouchableOpacity
				style={[background.white, border.radius.medium, padding.scale(20), padding.top.scale(40)]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View
						style={{
							position: 'absolute',
							top: -73,
						}}
					>
						<AccountAvatar size={60 * scaleSize} />
					</View>
					<Text style={[_styles.headerNameText]}>{account?.displayName || ''}</Text>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{(account?.link && (
							<QRCode
								size={qrCodeSize}
								value={account.link}
								logo={logo}
								color='#3845E0'
								mode='circle'
							/>
						)) ||
							null}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeHeader: React.FC = () => {
	const navigation = useNativeNavigation()
	const [{ color, margin, flex, text }, { scaleSize }] = useStyles()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={[flex.tiny]}>
			<View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }]}>
				<TouchableOpacity style={[flex.tiny]} onPress={() => navigation.goBack()}>
					<Icon
						name='arrow-back-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={color.white}
					/>
				</TouchableOpacity>
				<View style={[flex.big]} />
				<TouchableOpacity
					onPress={() => navigation.navigate('Settings.EditProfile')}
					style={{
						flexDirection: 'row',
						alignContent: 'center',
						alignItems: 'center',
						justifyContent: 'flex-end',
						paddingVertical: 5 * scaleSize,
					}}
				>
					<Text style={[{ color: color.white }, margin.right.small, text.size.medium]}>
						{t('settings.home.edit-profile')}
					</Text>
					<Icon
						name='edit-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={color.white}
					/>
				</TouchableOpacity>
			</View>
			<HomeHeaderAvatar />
		</View>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, color, padding, text, margin, column }] = useStyles()
	const navigation = useNativeNavigation()
	const ctx = useMsgrContext()
	const isPrefMode = ctx.persistentOptions.preset.value === 'performance'
	const enableNotif = ctx.persistentOptions.notifications.enable

	const items: any = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))

	items.push({ label: 'Debug', value: 'cimode' })
	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.horizontal.medium, padding.bottom.small]}>
					<ButtonSetting
						name={t('settings.mode.app-mode-button.title')}
						icon='options-outline'
						iconSize={30}
						iconColor={color.blue}
						// actionIcon='arrow-ios-forward'
						onPress={() => navigation.navigate('Onboarding.ChoosePreset')}
						state={{
							value: isPrefMode
								? t('settings.mode.app-mode-button.performance-tag')
								: t('settings.mode.app-mode-button.privacy-tag'),
							color: color.white,
							bgColor: isPrefMode ? color.blue : color.red,
							stateIcon: isPrefMode ? 'flash-outline' : 'lock-outline',
							stateIconColor: color.white,
						}}
					>
						<Text
							style={[
								column.item.right,
								text.bold.small,
								text.size.tiny,
								margin.right.scale(60),
								isPrefMode ? text.color.blue : text.color.red,
								margin.bottom.small,
							]}
						>
							{t('settings.mode.app-mode-button.description-tag')}
						</Text>
						<View style={[padding.right.small]}>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.first-bullet-point')}
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.second-bullet-point')}
								color='rgba(43,46,77,0.8)'
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.third-bullet-point')}
								color='rgba(43,46,77,0.8)'
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
						</View>
					</ButtonSetting>
					<DropDownPicker
						items={items}
						defaultValue={ctx.persistentOptions?.i18n.language}
						onChangeItem={async (item: any) => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.I18N,
								payload: {
									language: item.value,
								},
							})
							await i18n.changeLanguage(item.value)
						}}
					/>
					<ButtonSetting
						name={t('settings.mode.notifications-button.title')}
						icon='bell-outline'
						iconColor={color.blue}
						state={{
							value: enableNotif
								? t('settings.mode.notifications-button.tag-enabled')
								: t('settings.mode.notifications-button.tag-disabled'),
							color: enableNotif ? color.green : color.red,
							bgColor: enableNotif ? color.light.green : color.light.red,
						}}
						onPress={() => navigation.navigate('Settings.Notifications')}
					/>
					<ButtonSetting
						name={t('settings.mode.bluetooth-button.title')}
						icon='bluetooth-outline'
						iconColor={color.blue}
						onPress={() => navigation.navigate('Settings.Bluetooth')}
					/>
					<ButtonSetting
						name={t('settings.mode.dark-mode-button')}
						icon='moon-outline'
						iconColor={color.blue}
						toggled
						disabled
					/>
					<ButtonSetting
						name={t('settings.home.header-center-button')}
						icon='options-2-outline'
						iconColor={color.dark.grey}
						onPress={() => navigation.navigate('Settings.DevTools')}
					/>
				</View>
			)}
		</Translation>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = useAccount()
	const [{ flex, background, row, margin }] = useStyles()
	const navigation = useNativeNavigation()

	return (
		<>
			<View style={[flex.tiny, background.white]}>
				<StatusBar backgroundColor='#585AF1' barStyle='light-content' />
				<SwipeNavRecognizer
					// onSwipeUp={() => navigation.goBack()}
					// onSwipeLeft={() => navigation.goBack()}
					onSwipeRight={() => navigation.goBack()}
					// onSwipeDown={() => navigation.goBack()}
				>
					{account == null ? (
						<ActivityIndicator size='large' style={[row.center]} />
					) : (
						<ScrollView contentContainerStyle={{ paddingBottom: 30 }} bounces={false}>
							<View style={[margin.bottom.scale(20)]}>
								<HeaderSettings>
									<View>
										<HomeHeader />
										<HomeHeaderGroupButton />
									</View>
								</HeaderSettings>
							</View>
							<HomeBodySettings />
						</ScrollView>
					)}
				</SwipeNavRecognizer>
			</View>
		</>
	)
}
