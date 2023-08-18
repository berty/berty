import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native'
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import { Icon } from '@ui-kitten/components'
import mapValues from 'lodash/mapValues'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useThemeColor } from '@berty/hooks'
import { selectHandledLink, setHandledLink } from '@berty/redux/reducers/ui.reducer'
import * as RawComponents from '@berty/screens'
import { initBridge } from '@berty/utils/bridge/bridge'

import { ScreensParams } from './types'

export const CustomTitleStyle: () => any = () => {
	const { text } = useStyles()

	return [
		text.size.large,
		{
			headerTitleStyle: {
				...text.bold,
			},
		},
	]
}

const ChatScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['main-background'],
		},
		headerTintColor: colors['main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

const BackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['background-header'],
		},
		headerTintColor: colors['reverted-main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

const AltBackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['alt-secondary-background-header'],
		},
		headerTintColor: colors['reverted-main-text'],
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		...additionalProps,
	}
}

const DeepLinkBridge: React.FC = React.memo(() => {
	const navigation = useNavigation<NavigationProp<ScreensParams>>()
	const dispatch = useAppDispatch()
	const handledLink = useSelector(selectHandledLink)

	useEffect(() => {
		const loadLink = async () => {
			const linkingUrl = await Linking.getInitialURL()
			if (linkingUrl) {
				dispatch(setHandledLink(linkingUrl))
			}

			const handleOpenUrl = (event: { url: string }) => {
				dispatch(setHandledLink(event.url))
			}

			Linking.addEventListener('url', handleOpenUrl)
		}

		loadLink()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (handledLink) {
			dispatch(setHandledLink(null))
			navigation.navigate('Chat.ManageDeepLink', { type: 'link', value: handledLink })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handledLink])

	return null
})

let Components: typeof RawComponents

// @ts-ignore
Components = mapValues(RawComponents, SubComponents =>
	mapValues(
		SubComponents,
		(Component: React.FC): React.FC =>
			React.memo(props => (
				<>
					{Platform.OS !== 'web' && !('OpeningAccount' in SubComponents) ? (
						<DeepLinkBridge />
					) : null}
					<Component {...props} />
				</>
			)),
	),
)

const NavigationStack = createNativeStackNavigator<ScreensParams>()

export const Navigation: React.FC = React.memo(() => {
	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()
	const { t } = useTranslation()
	const { dispatch } = useNavigation()
	const { reset } = useNavigation<NavigationProp<ScreensParams>>()

	return (
		<NavigationStack.Navigator
			initialRouteName='Account.SelectNode'
			screenOptions={{
				headerLeft:
					Platform.OS === 'web'
						? props => (
								<TouchableOpacity
									style={{ justifyContent: 'center' }}
									onPress={() => dispatch(CommonActions.goBack())}
								>
									<Icon name='arrow-back' width={24} height={24} fill={props.tintColor} />
								</TouchableOpacity>
						  )
						: undefined,
			}}
		>
			{/* Account */}
			<NavigationStack.Screen
				name='Account.SelectNode'
				initialParams={{
					init: true,
					action: async (external: boolean, address: string, port: string) => {
						const res = await initBridge(external, address, port)
						if (!res) {
							Alert.alert('bridge: init failed')
							return false
						}

						reset({
							index: 0,
							routes: [{ name: 'Account.GoToLogInOrCreate', params: { isCreate: false } }],
						})
						return true
					},
				}}
				component={Components.Account.SelectNode}
				options={{
					headerShown: false,
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Account.GoToLogInOrCreate'
				component={Components.Account.GoToLogInOrCreate}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name='Account.Creating'
				component={Components.Account.CreatingAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name='Account.Opening'
				component={Components.Account.OpeningAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name='Account.Closing'
				component={Components.Account.ClosingAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name='Account.Importing'
				component={Components.Account.ImportingAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name='Account.Deleting'
				component={Components.Account.DeletingAccount}
				options={{ headerShown: false }}
			/>
			{/* OnBoarding */}
			<NavigationStack.Screen
				name='Onboarding.GetStarted'
				component={Components.Onboarding.GetStarted}
				options={{ headerShown: false, title: t('onboarding.getstarted.screenTitle') }}
			/>
			<NavigationStack.Screen
				name='Onboarding.CreateAccount'
				component={Components.Onboarding.CreateAccount}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.getstarted.create-button'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name='Onboarding.SetupFinished'
				component={Components.Onboarding.SetupFinished}
				options={{ headerShown: false, title: t('onboarding.setup-finished.title') }}
			/>
			<NavigationStack.Screen
				name='Onboarding.CustomModeSettings'
				component={Components.Onboarding.CustomModeSettings}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name='Onboarding.WebViews'
				component={Components.Onboarding.WebViews}
				options={{
					title: t('onboarding.web-views.title'),
					headerTitle: () => <></>,
					headerBackTitle: '',
					headerTintColor: colors['main-text'],
				}}
			/>
			<NavigationStack.Screen
				name='Onboarding.DefaultMode'
				component={Components.Onboarding.DefaultMode}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.default-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			<NavigationStack.Screen
				name='Onboarding.CustomMode'
				component={Components.Onboarding.CustomMode}
				options={{
					headerStyle: {
						backgroundColor: colors['background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					headerBackTitleVisible: false,
					title: t('onboarding.custom-mode.summary.screenTitle'),
					headerTitle: () => <></>,
				}}
			/>
			{/* Chat */}
			<NavigationStack.Screen
				name='Chat.Home'
				component={Components.Chat.Home}
				options={{
					headerShown: false,
					title: t('main.home.title'),
				}}
			/>
			<NavigationStack.Screen
				name='Chat.ContactRequest'
				component={Components.Chat.ContactRequest}
				options={{
					headerShown: false,
					title: t('main.home.requests.title'),
				}}
			/>
			<NavigationStack.Screen
				name='Chat.Share'
				component={Components.Chat.ShareModal}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.CreateGroupAddMembers'
				component={Components.Chat.CreateGroupAddMembers}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.create-group.title'),
					headerRight: () => (
						<Icon
							name='users'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					presentation: 'formSheet',
					...CustomTitleStyle(),
				})}
			/>
			<NavigationStack.Screen
				name='Chat.CreateGroupFinalize'
				component={Components.Chat.CreateGroupFinalize}
				options={BackgroundHeaderScreenOptions({
					title: t('main.home.create-group.title'),
					headerRight: () => (
						<Icon
							name='users'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.OneToOne'
				component={Components.Chat.OneToOne}
				options={ChatScreenOptions({
					...CustomTitleStyle(),
				})}
			/>
			<NavigationStack.Screen
				name='Chat.MultiMember'
				component={Components.Chat.MultiMember}
				options={ChatScreenOptions({
					...ChatScreenOptions(),
				})}
			/>
			<NavigationStack.Screen
				name='Chat.OneToOneSettings'
				component={Components.Chat.OneToOneSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.ContactSettings'
				component={Components.Chat.ContactSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.one-to-one-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.MultiMemberSettings'
				component={Components.Chat.MultiMemberSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.SettingsMemberDetail'
				component={Components.Chat.SettingsMemberDetail}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-settings.title'),
					headerTitle: () => <></>,
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.MultiMemberQR'
				component={Components.Chat.MultiMemberQR}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-qr.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.MultiMemberSettingsAddMembers'
				component={Components.Chat.MultiMemberSettingsAddMembers}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.add-members.members'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Chat.ReplicateGroupSettings'
				component={Components.Chat.ReplicateGroupSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.replicate-group-settings.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			{/* Settings */}
			<NavigationStack.Screen
				name='Settings.Home'
				component={Components.Settings.SettingsHome}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},

					headerTintColor: colors['main-text'],
					headerBackTitleVisible: false,
					title: t('settings.home.title'),
				}}
			/>
			<NavigationStack.Screen
				name='Settings.Network'
				component={Components.Settings.Network}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					headerTintColor: colors['main-text'],
					headerBackTitleVisible: false,
					title: t('settings.network.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.Notifications'
				component={Components.Settings.Notifications}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.notifications.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.ContactAndConversations'
				component={Components.Settings.ContactAndConversations}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.contact-convs.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.Appearance'
				component={Components.Settings.Appearance}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.appearance.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.ThemeEditor'
				component={Components.Settings.ThemeEditor}
				options={{
					headerStyle: {
						backgroundColor: colors['alt-secondary-background-header'],
					},
					headerTintColor: colors['reverted-main-text'],
					title: t('settings.appearance.theme-editor.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.Accounts'
				component={Components.Settings.Accounts}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.accounts.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.LinkedIdentities'
				component={Components.Settings.LinkedIdentities}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.linked-identities.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.DirectorySearch'
				component={Components.Settings.DirectorySearch}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.directory-search.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.AboutBerty'
				component={Components.Settings.AboutBerty}
				options={{
					headerStyle: {
						backgroundColor: colors['secondary-background'],
					},
					title: t('settings.about.title'),
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Settings.MyBertyId'
				component={Components.Settings.MyBertyId}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.my-berty-ID.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.TermsOfUse'
				component={Components.Settings.TermsOfUse}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.about.terms-of-use'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.DeleteAccount'
				component={Components.Settings.DeleteAccount}
				options={{
					headerShown: false,
					presentation: 'formSheet',
					title: t('settings.accounts.delete-title'),
				}}
			/>
			<NavigationStack.Screen
				name='Settings.DevTools'
				component={Components.Settings.DevTools}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.devtools.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.FakeData'
				component={Components.Settings.FakeData}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.fake-data.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>

			<NavigationStack.Screen
				name='Settings.SystemInfo'
				component={Components.Settings.SystemInfo}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.system-info.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.AddDevConversations'
				component={Components.Settings.AddDevConversations}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.add-dev-conversations.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.IpfsWebUI'
				component={Components.Settings.IpfsWebUI}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.ipfs-webui.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.DevText'
				component={Components.Settings.DevText}
				options={AltBackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.Roadmap'
				component={Components.Settings.Roadmap}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.roadmap.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.Faq'
				component={Components.Settings.Faq}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.faq.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.PrivacyPolicy'
				component={Components.Settings.PrivacyPolicy}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.privacy-policy.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.CodeLicense'
				component={Components.Settings.CodeLicense}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.license.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name='Settings.Permissions'
				component={Components.Settings.Permissions}
				options={{
					headerShown: false,
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name='Chat.ManageDeepLink'
				component={Components.Chat.ManageDeepLink}
				options={{
					presentation: 'containedTransparentModal',
					animation: 'fade',
					headerShown: false,
				}}
			/>
		</NavigationStack.Navigator>
	)
})
