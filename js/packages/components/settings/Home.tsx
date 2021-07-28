import React from 'react'
import { ActivityIndicator, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { Translation, useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount, useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import {
	DefaultBertyTheme,
	DefaultDarkTheme,
	PersistentOptionsKeys,
} from '@berty-tech/store/context'
import i18n from '@berty-tech/berty-i18n'
import { DropDownPicker } from '@berty-tech/components/shared-components/DropDownPicker'
import { languages } from '@berty-tech/berty-i18n/locale/languages'

import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
} from '../shared-components/SettingsButtons'
import HeaderSettings from '../shared-components/Header'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import logo from '../main/1_berty_picto.png'
import { AccountAvatar } from '../avatars'

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
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
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
								color: colors['background-header'],
								style: _styles.firstHeaderButton,
								onPress: () => navigate.settings.appUpdates(),
							},
							{
								name: t('settings.home.header-left-button'),
								icon: 'question-mark-circle-outline',
								color: colors['background-header'],
								style: _styles.firstHeaderButton,
								onPress: () => navigate.settings.help(),
							},
							{
								name: t('settings.home.header-right-button'),
								icon: 'settings-2-outline',
								color: colors['background-header'],
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
		{ row, margin, border, padding },
		{ windowWidth, windowHeight, scaleHeight, scaleSize },
	] = useStyles()
	const colors = useThemeColor()
	const account = useAccount()
	const navigation = useNavigation()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, margin.top.scale(30), padding.bottom.scale(70)]}>
			<TouchableOpacity
				style={[
					border.radius.medium,
					padding.scale(20),
					padding.top.scale(40),
					{ backgroundColor: colors['main-background'] },
				]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -73 }}>
						<AccountAvatar size={60 * scaleSize} />
					</View>
					<Text style={[_styles.headerNameText]}>{account?.displayName || ''}</Text>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{(account?.link && (
							<QRCode
								size={qrCodeSize}
								value={account.link}
								logo={logo}
								color={colors['background-header']}
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
	const [{ margin, flex, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={[flex.tiny]}>
			<View style={[{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }]}>
				<TouchableOpacity style={[flex.tiny]} onPress={() => navigation.goBack()}>
					<Icon
						name='arrow-back-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={colors['reverted-main-text']}
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
					<Text
						style={[{ color: colors['reverted-main-text'] }, margin.right.small, text.size.medium]}
					>
						{t('settings.home.edit-profile')}
					</Text>
					<Icon
						name='edit-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={colors['reverted-main-text']}
					/>
				</TouchableOpacity>
			</View>
			<HomeHeaderAvatar />
		</View>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, padding, text, margin, column }] = useStyles()
	const colors = useThemeColor()
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
						iconColor={colors['background-header']}
						onPress={() => navigation.navigate('Onboarding.ChoosePreset')}
						state={{
							value: isPrefMode
								? t('settings.mode.app-mode-button.performance-tag')
								: t('settings.mode.app-mode-button.privacy-tag'),
							color: colors['reverted-main-text'],
							bgColor: isPrefMode
								? colors['background-header']
								: colors['secondary-background-header'],
							stateIcon: isPrefMode ? 'flash-outline' : 'lock-outline',
							stateIconColor: colors['reverted-main-text'],
						}}
					>
						<Text
							style={[
								column.item.right,
								text.bold.small,
								text.size.tiny,
								margin.right.scale(60),
								isPrefMode
									? { color: colors['background-header'] }
									: { color: colors['secondary-background-header'] },
								margin.bottom.small,
							]}
						>
							{t('settings.mode.app-mode-button.description-tag')}
						</Text>
						<View style={[padding.right.small]}>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.first-bullet-point')}
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={
									isPrefMode ? colors['background-header'] : colors['secondary-background-header']
								}
								disabled
								styleText={{ color: colors['secondary-text'] }}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.second-bullet-point')}
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={
									isPrefMode ? colors['background-header'] : colors['secondary-background-header']
								}
								disabled
								styleText={{ color: colors['secondary-text'] }}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.third-bullet-point')}
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={
									isPrefMode ? colors['background-header'] : colors['secondary-background-header']
								}
								disabled
								styleText={{ color: colors['secondary-text'] }}
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
						iconColor={colors['background-header']}
						state={{
							value: enableNotif
								? t('settings.mode.notifications-button.tag-enabled')
								: t('settings.mode.notifications-button.tag-disabled'),
							color: enableNotif ? colors['background-header'] : colors['secondary-text'],
							bgColor: enableNotif ? colors['positive-asset'] : `${colors['negative-asset']}40`,
						}}
						onPress={() => navigation.navigate('Settings.Notifications')}
					/>
					<ButtonSetting
						name={t('settings.mode.bluetooth-button.title')}
						icon='bluetooth-outline'
						iconColor={colors['background-header']}
						onPress={() => navigation.navigate('Settings.Bluetooth')}
					/>
					<ButtonSetting
						name={t('settings.mode.dark-mode-button')}
						icon='moon-outline'
						iconColor={colors['background-header']}
						toggled
						varToggle={ctx.persistentOptions.themeColor.selected === DefaultDarkTheme}
						actionToggle={async () => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.ThemeColor,
								payload: {
									...ctx.persistentOptions.themeColor,
									selected:
										ctx.persistentOptions.themeColor.selected !== DefaultDarkTheme
											? DefaultDarkTheme
											: DefaultBertyTheme,
								},
							})
						}}
					/>
					<ButtonSetting
						name={t('settings.home.header-center-button')}
						icon='options-2-outline'
						iconColor={colors['alt-secondary-background-header']}
						onPress={() => navigation.navigate('Settings.DevTools')}
					/>
				</View>
			)}
		</Translation>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = useAccount()
	const [{ row, margin }] = useStyles()
	const colors = useThemeColor()
	const navigation = useNativeNavigation()

	return (
		<>
			<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				<SwipeNavRecognizer onSwipeRight={() => navigation.goBack()}>
					{account == null ? (
						<ActivityIndicator size='large' style={[row.center]} />
					) : (
						<ScrollView bounces={false} nestedScrollEnabled>
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
