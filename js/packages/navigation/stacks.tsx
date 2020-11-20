import React, { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
// import { createStackNavigator } from '@react-navigation/stack'
import * as RawComponents from '@berty-tech/components'
import mapValues from 'lodash/mapValues'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { Routes } from './types'
// import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { isClosing, MessengerAppState } from '@berty-tech/store/context'
import { dispatch, navigate } from '@berty-tech/navigation/rootRef'

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
			navigation.navigate('Modals', {
				screen: 'ManageDeepLink',
				params: { type: 'link', value: url },
			})
		}
	}, [url, error, navigation])

	return null
}

let Components: typeof RawComponents

// @ts-ignore
Components = mapValues(RawComponents, (SubComponents) =>
	mapValues(SubComponents, (Component: React.FC) => (props: any) => (
		<>
			<DeepLinkBridge />
			<Component {...props} />
		</>
	)),
)

const ModalsStack = createNativeStackNavigator()
export const ModalsNavigation: React.FC = () => (
	<ModalsStack.Navigator
		screenOptions={{
			headerShown: false,
			stackPresentation: 'containedTransparentModal',
			contentStyle: { backgroundColor: 'transparent' },
			stackAnimation: 'fade',
		}}
	>
		<ModalsStack.Screen
			name={Routes.Modals.DeleteAccount}
			component={Components.Modals.DeleteAccount}
		/>
		<ModalsStack.Screen
			name={Routes.Modals.ManageDeepLink}
			component={Components.Modals.ManageDeepLink}
		/>
		<ModalsStack.Screen name={Routes.Modals.AddBetabot} component={Components.Modals.AddBetabot} />
	</ModalsStack.Navigator>
)
const CreateGroupStack = createNativeStackNavigator()
export const CreateGroupNavigation: React.FC = () => {
	const [members, setMembers] = useState([] as any[])
	const setMember = (contact: any) => {
		if (members.find((member) => member.publicKey === contact.publicKey)) {
			return
		}
		setMembers([...members, contact])
	}
	const removeMember = (id: string) => {
		const filtered = members.filter((member) => member.publicKey !== id)
		if (filtered.length !== members.length) {
			setMembers(filtered)
		}
	}

	return (
		<CreateGroupStack.Navigator screenOptions={{ headerShown: false }}>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroupAddMembers}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
					stackAnimation: 'none',
				}}
			>
				{() => (
					// should use setParams ? maybe, tis weird
					<Components.Main.CreateGroupAddMembers
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroupFinalize}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
					stackAnimation: 'none',
				}}
			>
				{() => (
					<Components.Main.CreateGroupFinalize members={members} onRemoveMember={removeMember} />
				)}
			</CreateGroupStack.Screen>
		</CreateGroupStack.Navigator>
	)
}

const NavigationStack = createNativeStackNavigator()
export const Navigation: React.FC = () => {
	const context = useMsgrContext()

	useEffect(() => {
		if (context.appState === MessengerAppState.Closed || isClosing(context.appState)) {
			dispatch(
				CommonActions.reset({
					routes: [{ name: Routes.Onboarding.AccountSelector }],
				}),
			)
		}

		switch (context.appState) {
			case MessengerAppState.GetStarted:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Onboarding.GetStarted }],
					}),
				)
				return

			case MessengerAppState.OnBoarding:
				navigate(Routes.Onboarding.CreateAccount, {})
				return

			case MessengerAppState.Ready:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Root.Tabs, params: { screen: Routes.Main.Home } }],
					}),
				)
				return
		}
	}, [context.appState])

	return (
		<NavigationStack.Navigator
			initialRouteName={
				context.appState === MessengerAppState.Ready
					? Routes.Root.Tabs
					: Routes.Onboarding.AccountSelector
			}
			screenOptions={{
				headerShown: false,
			}}
		>
			<NavigationStack.Screen
				name={Routes.Main.ContactRequest}
				component={Components.Main.ContactRequest}
				options={{
					stackPresentation: 'containedTransparentModal',
					stackAnimation: 'fade',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Scan}
				component={Components.Main.Scan}
				options={{
					stackPresentation: 'containedTransparentModal',
					stackAnimation: 'none',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen name={Routes.Chat.OneToOne} component={Components.Chat.OneToOne} />
			<NavigationStack.Screen name={Routes.Chat.Group} component={Components.Chat.MultiMember} />
			<NavigationStack.Screen
				name={Routes.Chat.OneToOneSettings}
				component={Components.Chat.OneToOneSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.ContactSettings}
				component={Components.Chat.ContactSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberSettings}
				component={Components.Chat.MultiMemberSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.MultiMemberQR}
				component={Components.Chat.MultiMemberQR}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.ReplicateGroupSettings}
				component={Components.Chat.ReplicateGroupSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Main.HomeModal}
				component={Components.Main.HomeModal}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Main.RequestSent}
				component={Components.Main.RequestSent}
				options={{ stackPresentation: 'containedModal' }}
			/>
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroupAddMembers}
				component={CreateGroupNavigation}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
					stackAnimation: 'none',
				}}
			/>
			<NavigationStack.Screen name={Routes.Root.Tabs} component={Components.Main.Home} />
			<NavigationStack.Screen
				name={Routes.Settings.MyBertyId}
				component={Components.Settings.MyBertyId}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.EditProfile}
				component={Components.Settings.EditProfile}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen name={Routes.Settings.Home} component={Components.Settings.Home} />
			<NavigationStack.Screen
				name={Routes.Settings.AppUpdates}
				component={Components.Settings.AppUpdates}
			/>
			<NavigationStack.Screen name={Routes.Settings.Help} component={Components.Settings.Help} />
			<NavigationStack.Screen
				name={Routes.Settings.FakeData}
				component={Components.Settings.FakeData}
			/>
			<NavigationStack.Screen name={Routes.Settings.Mode} component={Components.Settings.Mode} />
			<NavigationStack.Screen
				name={Routes.Settings.BlockedContacts}
				component={Components.Settings.BlockedContacts}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Notifications}
				component={Components.Settings.Notifications}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Bluetooth}
				component={Components.Settings.Bluetooth}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.ServicesAuth}
				component={Components.Settings.ServicesAuth}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AboutBerty}
				component={Components.Settings.AboutBerty}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.TermsOfUse}
				component={Components.Settings.TermsOfUse}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevTools}
				component={Components.Settings.DevTools}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AddDevConversations}
				component={Components.Settings.AddDevConversations}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.SystemInfo}
				component={Components.Settings.SystemInfo}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.IpfsWebUI}
				component={Components.Settings.IpfsWebUI}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevText}
				component={Components.Settings.DevText}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.NetworkMap}
				component={Components.Settings.NetworkMap}
			/>
			<NavigationStack.Screen
				name={'Modals'}
				component={ModalsNavigation}
				options={{
					stackPresentation: 'containedTransparentModal',
					contentStyle: { backgroundColor: 'transparent' },
					stackAnimation: 'fade',
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.AccountSelector}
				component={Components.Onboarding.AccountSelector}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.GetStarted}
				component={Components.Onboarding.GetStarted}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.CreateAccount}
				component={Components.Onboarding.CreateAccount}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.ServicesAuth}
				component={Components.Onboarding.ServicesAuth}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.SetupFinished}
				component={Components.Onboarding.SetupFinished}
			/>
		</NavigationStack.Navigator>
	)
}
