import React, { useCallback, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	Text as TextNative,
	TouchableOpacity,
	View,
} from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import {
	useAccount,
	useMessengerContext,
	useThemeColor,
	CheckListItem,
	CheckListProfileNotification,
	DefaultBertyTheme,
	DefaultDarkTheme,
	PersistentOptionsKeys,
} from '@berty-tech/store'
import i18n from '@berty-tech/berty-i18n'
import { languages } from '@berty-tech/berty-i18n/locale/languages'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { DropDownPicker } from '../shared-components/DropDownPicker'
import { AccountAvatar } from '../avatars'
import { EditProfile } from './EditProfile'
import logo from '../main/1_berty_picto.png'
import { UnreadCount } from '../main/home/UnreadCount'
import { readProfileNotification } from '../helpers'

const _verticalOffset = 30

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
	const { t }: any = useTranslation()
	const { navigate } = useNavigation()

	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSettingRow
				isScroll
				state={[
					{
						name: t('settings.help.updates-button'),
						icon: 'arrow-upward-outline',
						color: colors['background-header'],
						style: _styles.firstHeaderButton,
						onPress: () => navigate('Settings.AppUpdates'),
					},
					{
						name: t('settings.faq.title'),
						icon: 'question-mark-circle-outline',
						color: colors['secondary-background-header'],
						style: _styles.firstHeaderButton,
						onPress: () => navigate('Settings.Faq'),
					},
					{
						name: t('settings.home.header-right-button'),
						icon: 'settings-2-outline',
						color: colors['background-header'],
						style: _styles.firstHeaderButton,
						onPress: () => navigate('Settings.Mode'),
					},
					{
						name: t('settings.roadmap.title'),
						icon: 'calendar-outline',
						color: colors['background-header'],
						style: _styles.thirdHeaderButton,
						onPress: () => navigate('Settings.Roadmap'),
					},
				]}
			/>
		</View>
	)
}

const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const [{ row, border, padding }, { windowWidth, windowHeight, scaleHeight, scaleSize }] =
		useStyles()
	const colors = useThemeColor()
	const account = useAccount()
	const { navigate } = useNavigation()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, padding.top.small]}>
			<TouchableOpacity
				style={[
					border.radius.medium,
					padding.scale(20),
					padding.top.scale(40),
					{ backgroundColor: colors['main-background'] },
				]}
				onPress={() => navigate('Settings.MyBertyId')}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -73 }}>
						<AccountAvatar size={60 * scaleSize} />
					</View>
					<Text style={[_styles.headerNameText, { color: colors['main-text'] }]}>
						{account?.displayName || ''}
					</Text>
					<View style={[padding.top.scale(18 * scaleHeight)]}>
						{(account?.link && (
							<QRCode
								size={qrCodeSize}
								value={account.link}
								logo={logo}
								color={colors['background-header']}
								mode='circle'
								backgroundColor={colors['main-background']}
							/>
						)) ||
							null}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const TaskItem: React.FC<{ value: CheckListItem }> = ({ value }) => {
	const colors = useThemeColor()
	const [{ text, margin, padding }, { scaleSize }] = useStyles()
	const { t }: any = useTranslation()
	const [itemCollapsed, setItemCollapsed] = useState<boolean>(true)

	return (
		<View
			style={[
				padding.top.tiny,
				{
					flexDirection: 'row',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
				},
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 10 }}>
				{value?.done ? (
					<Icon
						name='checkmark-circle-2'
						fill={colors['background-header']}
						width={25 * scaleSize}
						height={25 * scaleSize}
					/>
				) : (
					<View
						style={{
							width: 21 * scaleSize,
							height: 21 * scaleSize,
							borderRadius: 21 * scaleSize,
							borderWidth: 2,
							borderColor: colors['background-header'],
							margin: 2 * scaleSize,
						}}
					/>
				)}
				<View style={{ flexDirection: 'column' }}>
					<TextNative
						style={[
							text.size.medium,
							margin.left.small,
							{ fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					>
						{t(value.title)}
					</TextNative>
					{!itemCollapsed ? (
						<TextNative
							style={[
								text.size.scale(13),
								margin.left.big,
								margin.vertical.small,
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t(value.desc)}
						</TextNative>
					) : null}
				</View>
			</View>
			<TouchableOpacity
				style={[{ alignItems: 'center', flex: 1 }]}
				onPress={() => setItemCollapsed(!itemCollapsed)}
			>
				<Icon
					name={itemCollapsed ? 'arrow-ios-downward' : 'arrow-ios-upward'}
					fill={colors['main-text']}
					height={20 * scaleSize}
					width={20 * scaleSize}
				/>
			</TouchableOpacity>
		</View>
	)
}

const CheckItems: React.FC<{ openModal: () => void }> = ({ openModal }) => {
	const ctx = useMessengerContext()
	const { navigate } = useNavigation()

	const tasks = useMemo(
		() => Object.entries(ctx.persistentOptions[PersistentOptionsKeys.CheckList]),
		[ctx.persistentOptions],
	)

	const handleCheckListItemPress = useCallback(
		(key: string, value: CheckListItem) => {
			switch (key) {
				case 'avatar':
					if (!value.done) {
						openModal()
					}
					return
				case 'relay':
					if (!value.done) {
						navigate('Settings.ReplicationServices')
					}
					return
				case 'contact':
					if (!value.done) {
						navigate('Main.Scan')
					}
					return
				case 'group':
					if (!value.done) {
						navigate('Main.CreateGroupAddMembers')
					}
					return
				case 'hidden-account':
					return
				case 'theme':
					if (!value.done) {
						navigate('Settings.ThemeEditor')
					}
					return
				case 'message':
					return
				case 'message-ble':
					return
				default:
					return
			}
		},
		[openModal, navigate],
	)
	return (
		<View>
			{!ctx.persistentOptions[PersistentOptionsKeys.CheckList].isCollapsed
				? tasks.map((value: [string, boolean | CheckListItem], key) => {
						const _value = value[1]
						return typeof _value === 'boolean' ? null : (
							<TouchableOpacity
								key={key}
								onPress={() => handleCheckListItemPress(value[0], _value)}
							>
								<TaskItem value={_value} />
							</TouchableOpacity>
						)
				  })
				: null}
		</View>
	)
}

const CheckList: React.FC<{ openModal: () => void }> = ({ openModal }) => {
	const colors = useThemeColor()
	const [{ text, padding, margin, border }, { scaleSize }] = useStyles()
	const ctx = useMessengerContext()
	const { t }: any = useTranslation()

	const tasks = useMemo(
		() => Object.entries(ctx.persistentOptions[PersistentOptionsKeys.CheckList]),
		[ctx.persistentOptions],
	)
	const tasksDone = useMemo(() => tasks.filter(value => value[1].done).length, [tasks])
	const notifs = useMemo(
		() =>
			ctx.persistentOptions[PersistentOptionsKeys.ProfileNotification][
				CheckListProfileNotification
			],
		[ctx.persistentOptions],
	)

	return (
		<View
			style={[
				margin.horizontal.medium,
				margin.top.medium,
				padding.medium,
				border.radius.medium,
				{ backgroundColor: colors['main-background'], flex: 1 },
			]}
		>
			<View>
				<View
					style={[
						!ctx.persistentOptions[PersistentOptionsKeys.CheckList].isCollapsed &&
							margin.bottom.small,
						{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' },
					]}
				>
					<View style={{ flexDirection: 'row', flex: 10 }}>
						<TextNative
							style={[
								text.size.scale(16),
								text.bold.medium,
								margin.right.scale(5),
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t('settings.home.check-list.title', { tasksDone, totalTasks: tasks.length })}
						</TextNative>
						<Icon
							name='checkmark-circle-2'
							fill={colors['background-header']}
							width={20 * scaleSize}
							height={20 * scaleSize}
						/>
					</View>

					<TouchableOpacity
						style={[{ alignItems: 'center', flex: 1 }]}
						onPress={async () => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.CheckList,
								payload: {
									...ctx.persistentOptions[PersistentOptionsKeys.CheckList],
									isCollapsed: !ctx.persistentOptions[PersistentOptionsKeys.CheckList].isCollapsed,
								},
							})
							await readProfileNotification(ctx, CheckListProfileNotification)
						}}
					>
						<Icon
							name={
								ctx.persistentOptions[PersistentOptionsKeys.CheckList].isCollapsed
									? 'arrow-downward'
									: 'arrow-upward'
							}
							fill={colors['main-text']}
							height={25 * scaleSize}
							width={25 * scaleSize}
						/>
					</TouchableOpacity>
					{notifs > 0 ? (
						<View
							style={{ position: 'absolute', right: -(22 * scaleSize), top: -(22 * scaleSize) }}
						>
							<UnreadCount value={notifs} />
						</View>
					) : null}
				</View>
			</View>
			<CheckItems openModal={openModal} />
		</View>
	)
}

const HomeBodySettings: React.FC = () => {
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const ctx = useMessengerContext()
	const { t }: any = useTranslation()
	const enableNotif = ctx.persistentOptions.notifications.enable

	const items: any = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))

	items.push({ label: 'Debug', value: 'cimode' })
	return (
		<View style={[flex.tiny, padding.horizontal.medium, padding.bottom.small]}>
			<ButtonSetting
				name={t('settings.home.app-network-button.title')}
				icon='options-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigate('Settings.NetworkConfig')}
			>
				{/* TODO bullet point in button */}
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
				name={t('settings.home.notifications-button.title')}
				icon='bell-outline'
				iconColor={colors['background-header']}
				state={{
					value: enableNotif
						? t('settings.home.notifications-button.tag-enabled')
						: t('settings.home.notifications-button.tag-disabled'),
					color: enableNotif ? colors['background-header'] : colors['secondary-text'],
					bgColor: enableNotif ? colors['positive-asset'] : `${colors['negative-asset']}40`,
				}}
				onPress={() => navigate('Settings.Notifications')}
			/>
			<ButtonSetting
				name={t('settings.home.bluetooth-button.title')}
				icon='bluetooth-outline'
				iconColor={colors['background-header']}
				onPress={() => navigate('Settings.Bluetooth')}
			/>
			<ButtonSetting
				name={t('settings.home.dark-mode-button')}
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
				name={t('settings.devtools.theme-editor')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigate('Settings.ThemeEditor')}
			/>
			<ButtonSetting
				name={t('settings.home.header-center-button')}
				icon='options-2-outline'
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigate('Settings.DevTools')}
			/>
		</View>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const [openModal, setOpenModal] = useState(false)
	const account = useAccount()
	const [{ row, margin, text, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const { setOptions } = useNavigation()

	React.useLayoutEffect(() => {
		setOptions({
			headerRight: ({ tintColor }: any) => (
				<TouchableOpacity
					onPress={() => setOpenModal(true)}
					style={{
						flexDirection: 'row',
						alignContent: 'center',
						alignItems: 'center',
						justifyContent: 'flex-end',
						paddingVertical: 5 * scaleSize,
					}}
				>
					<Text style={[{ color: tintColor }, margin.right.small, text.size.medium]}>
						{t('settings.home.edit-profile')}
					</Text>
					<Icon
						name='edit-outline'
						width={25 * scaleSize}
						height={25 * scaleSize}
						fill={tintColor}
					/>
				</TouchableOpacity>
			),
		})
	})

	React.useEffect(() => {
		if (openModal) {
			setOptions({
				headerShown: false,
			})
		} else {
			setOptions({
				headerShown: true,
			})
		}
	})

	return (
		<>
			<View style={{ backgroundColor: colors['main-background'], flex: 1 }}>
				<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
				{account == null ? (
					<ActivityIndicator size='large' style={[row.center]} />
				) : (
					<ScrollView
						bounces={false}
						nestedScrollEnabled
						contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
						showsVerticalScrollIndicator={false}
					>
						<View
							style={[
								{ backgroundColor: colors['background-header'] },
								border.radius.bottom.medium,
								margin.bottom.scale(_verticalOffset),
							]}
						>
							<View style={{ bottom: -_verticalOffset }}>
								<HomeHeaderAvatar />
								<CheckList openModal={() => setOpenModal(true)} />
								<HomeHeaderGroupButton />
							</View>
						</View>
						<HomeBodySettings />
					</ScrollView>
				)}
			</View>
			{openModal && <EditProfile closeModal={() => setOpenModal(false)} />}
		</>
	)
}
