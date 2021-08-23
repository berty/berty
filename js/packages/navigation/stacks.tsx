import React, { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import mapValues from 'lodash/mapValues'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import * as RawComponents from '@berty-tech/components'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { MessengerAppState } from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'

import { Routes } from './types'
import { dispatch } from './rootRef'

export const CustomTitleStyle: () => any = () => {
	const [{}, { scaleSize }] = useStyles()
	return {
		headerTitleStyle: {
			fontFamily: 'Open Sans',
			fontWeight: '700',
			fontSize: 25 * scaleSize,
		},
	}
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

const SecondaryBackgroundHeaderScreenOptions: (
	additionalProps?: NativeStackNavigationOptions,
) => NativeStackNavigationOptions = additionalProps => {
	const colors = useThemeColor()
	return {
		headerStyle: {
			backgroundColor: colors['secondary-background-header'],
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

function useLinking() {
	const [url, setUrl] = useState<string | null>(null)
	const [error, setError] = useState()

	async function initialUrl() {
		try {
			const linkingUrl = await Linking.getInitialURL()
			if (linkingUrl) {
				setUrl(linkingUrl)
			}
		} catch (ex) {
			setError(ex)
		}
	}

	useEffect(() => {
		function handleOpenUrl(ev: any) {
			setUrl(null)
			setUrl(ev.url)
		}

		// for initial render
		initialUrl().then(() => {
			Linking.addEventListener('url', handleOpenUrl)
		})

		return () => Linking.removeEventListener('url', handleOpenUrl)
	}, [])

	return [url, error]
}

const DeepLinkBridge: React.FC = () => {
	const navigation = useNavigation()
	const [url, error] = useLinking()

	useEffect(() => {
		if (url && !error && !(url as string).startsWith('berty://services-auth')) {
			navigation.navigate('ManageDeepLink', { type: 'link', value: url })
		}
	}, [url, error, navigation])

	return null
}

let Components: typeof RawComponents

// @ts-ignore
Components = mapValues(RawComponents, SubComponents =>
	mapValues(SubComponents, (Component: React.FC) => (props: any) => (
		<>
			<DeepLinkBridge />
			<Component {...props} />
		</>
	)),
)

const NavigationStack = createNativeStackNavigator()
export const Navigation: React.FC = () => {
	const context = useMsgrContext()
	const colors = useThemeColor()
	const [{}, { scaleSize }] = useStyles()
	const { t }: any = useTranslation()

	const [members, setMembers] = useState([] as any[])
	const setMember = (contact: any) => {
		if (members.find(member => member.publicKey === contact.publicKey)) {
			return
		}
		setMembers([...members, contact])
	}
	const removeMember = (id: string) => {
		const filtered = members.filter(member => member.publicKey !== id)
		if (filtered.length !== members.length) {
			setMembers(filtered)
		}
	}

	useEffect(() => {
		console.log('context app State', context.appState)
		switch (context.appState) {
			case MessengerAppState.Ready:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.Home }],
					}),
				)
				return
			case MessengerAppState.PreReady:
				dispatch(CommonActions.navigate('Onboarding.SetupFinished'))
				return
			case MessengerAppState.GetStarted:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Onboarding.GetStarted }],
					}),
				)
				return
		}
	}, [context.appState])

	return (
		<NavigationStack.Navigator
			initialRouteName={
				context.appState === MessengerAppState.GetStarted
					? Routes.Onboarding.GetStarted
					: Routes.Main.Home
			}
		>
			{/* OnBoarding */}
			<NavigationStack.Screen
				name={Routes.Onboarding.GetStarted}
				component={Components.Onboarding.GetStarted}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.ChoosePreset}
				component={Components.Onboarding.ChoosePreset}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.CreateAccount}
				component={Components.Onboarding.CreateAccount}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.ServicesAuth}
				component={Components.Onboarding.ServicesAuth}
				options={{ headerShown: false, presentation: 'formSheet' }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.SetupFinished}
				component={Components.Onboarding.SetupFinished}
				options={{ headerShown: false }}
			/>
			{/* Main */}
			<NavigationStack.Screen
				name={Routes.Main.Home}
				component={Components.Main.Home}
				options={{ headerShown: false }}
			/>
			<NavigationStack.Screen
				name={Routes.Main.ContactRequest}
				component={Components.Main.ContactRequest}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Scan}
				component={Components.Main.Scan}
				options={SecondaryBackgroundHeaderScreenOptions({
					title: t('main.scan.title'),
					headerRight: () => (
						<Icon
							name='qr'
							pack='custom'
							width={35 * scaleSize}
							height={35 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Main.NetworkOptions}
				component={Components.Main.NetworkOptions}
				options={{ headerShown: false, presentation: 'formSheet' }}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Permissions}
				component={Components.Main.Permissions}
				options={{ headerShown: false, presentation: 'formSheet' }}
			/>
			{/* CreateGroup */}
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroupAddMembers}
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
			>
				{() => (
					<Components.Main.CreateGroupAddMembers
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
			</NavigationStack.Screen>
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroupFinalize}
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
			>
				{() => (
					<Components.Main.CreateGroupFinalize members={members} onRemoveMember={removeMember} />
				)}
			</NavigationStack.Screen>
			{/* Chat */}
			<NavigationStack.Screen
				name={Routes.Chat.OneToOne}
				component={Components.Chat.OneToOne}
				options={ChatScreenOptions()}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.Group}
				component={Components.Chat.MultiMember}
				options={ChatScreenOptions()}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.OneToOneSettings}
				component={Components.Chat.OneToOneSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.ContactSettings}
				component={Components.Chat.ContactSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberSettings}
				component={Components.Chat.MultiMemberSettings}
				options={BackgroundHeaderScreenOptions({
					title: '',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberQR}
				component={Components.Chat.MultiMemberQR}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.multi-member-qr.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberSettingsAddMembers}
				component={Components.Chat.MultiMemberSettingsAddMembers}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.add-members.members'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.ReplicateGroupSettings}
				component={Components.Chat.ReplicateGroupSettings}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.replicate-group-settings.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.SharedMedias}
				component={Components.Chat.SharedMedias}
				options={BackgroundHeaderScreenOptions({
					title: t('chat.shared-medias.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			{/* Settings */}
			<NavigationStack.Screen
				name={Routes.Settings.Home}
				component={Components.Settings.Home}
				options={BackgroundHeaderScreenOptions({
					title: '',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.MyBertyId}
				component={Components.Settings.MyBertyId}
				options={BackgroundHeaderScreenOptions({
					title: 'My Berty ID',
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AppUpdates}
				component={Components.Settings.AppUpdates}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.updates.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Help}
				component={Components.Settings.Help}
				options={SecondaryBackgroundHeaderScreenOptions({
					title: t('settings.help.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AboutBerty}
				component={Components.Settings.AboutBerty}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.about.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.TermsOfUse}
				component={Components.Settings.TermsOfUse}
				options={BackgroundHeaderScreenOptions({
					title: 'Terms of use',
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Mode}
				component={Components.Settings.Mode}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.mode.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.NetworkMap}
				component={Components.Settings.NetworkMap}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.network-map.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.ServicesAuth}
				component={Components.Settings.ServicesAuth}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.services-auth.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DeleteAccount}
				component={Components.Settings.DeleteAccount}
				options={{
					headerShown: false,
					presentation: 'formSheet',
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.ChoosePreset}
				component={Components.Onboarding.ChoosePreset}
				options={SecondaryBackgroundHeaderScreenOptions({
					headerShown: false,
					presentation: 'formSheet',
					statusBarStyle: 'light',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Notifications}
				component={Components.Settings.Notifications}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.notifications.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Bluetooth}
				component={Components.Settings.Bluetooth}
				options={BackgroundHeaderScreenOptions({
					title: t('settings.bluetooth.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevTools}
				component={Components.Settings.DevTools}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.devtools.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.FakeData}
				component={Components.Settings.FakeData}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.fake-data.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.ThemeEditor}
				component={Components.Settings.ThemeEditor}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.theme-editor.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.SystemInfo}
				component={Components.Settings.SystemInfo}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.system-info.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AddDevConversations}
				component={Components.Settings.AddDevConversations}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.add-dev-conversations.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.IpfsWebUI}
				component={Components.Settings.IpfsWebUI}
				options={AltBackgroundHeaderScreenOptions({
					title: t('settings.ipfs-webui.title'),
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevText}
				component={Components.Settings.DevText}
				options={AltBackgroundHeaderScreenOptions({
					title: '',
					...CustomTitleStyle(),
					presentation: 'formSheet',
				})}
			/>

			{/* Modals */}
			<NavigationStack.Screen
				name={Routes.Modals.ManageDeepLink}
				component={Components.Modals.ManageDeepLink}
				options={{
					presentation: 'containedTransparentModal',
					animation: 'fade',
					headerShown: false,
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Modals.ImageView}
				component={Components.Modals.ImageView}
				options={{
					presentation: 'containedTransparentModal',
					headerShown: false,
				}}
			/>
		</NavigationStack.Navigator>
	)
}
