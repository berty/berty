import React, { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import {
	createStackNavigator,
	HeaderStyleInterpolators,
	StackCardInterpolationProps,
	StackNavigationOptions,
	TransitionSpecs,
} from '@react-navigation/stack'
import mapValues from 'lodash/mapValues'

import * as RawComponents from '@berty-tech/components'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { MessengerAppState } from '@berty-tech/store/context'

import { Routes } from './types'
import { dispatch } from './rootRef'

const CustomTransitionOptions: StackNavigationOptions = {
	headerShown: false,
	gestureEnabled: true,
	gestureDirection: 'horizontal',
	transitionSpec: {
		open: TransitionSpecs.TransitionIOSSpec,
		close: TransitionSpecs.TransitionIOSSpec,
	},
	headerStyleInterpolator: HeaderStyleInterpolators.forFade,
	cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
		return {
			cardStyle: {
				transform: [
					{
						translateX: current.progress.interpolate({
							inputRange: [0, 1],
							outputRange: [layouts.screen.width, 0],
						}),
					},
					{
						scale: next
							? next.progress.interpolate({
									inputRange: [0, 1],
									outputRange: [1, 0.9],
							  })
							: 1,
					},
				],
			},
			overlayStyle: {
				opacity: current.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 0.5],
				}),
			},
		}
	},
}

const ModalScreenOptions: StackNavigationOptions = {
	headerShown: false,
	cardStyle: { backgroundColor: 'transparent' },
	transitionSpec: {
		open: TransitionSpecs.TransitionIOSSpec,
		close: TransitionSpecs.TransitionIOSSpec,
	},
	headerStyleInterpolator: HeaderStyleInterpolators.forFade,
	cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => {
		return {
			cardStyle: {
				opacity: current.progress,
			},
		}
	},
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
Components = mapValues(RawComponents, (SubComponents) =>
	mapValues(SubComponents, (Component: React.FC) => (props: any) => (
		<>
			<DeepLinkBridge />
			<Component {...props} />
		</>
	)),
)

const CreateGroupStack = createStackNavigator()
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
				options={ModalScreenOptions}
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
				options={ModalScreenOptions}
			>
				{() => (
					<Components.Main.CreateGroupFinalize members={members} onRemoveMember={removeMember} />
				)}
			</CreateGroupStack.Screen>
		</CreateGroupStack.Navigator>
	)
}

const NavigationStack = createStackNavigator()
export const Navigation: React.FC = () => {
	const context = useMsgrContext()

	useEffect(() => {
		switch (context.appState) {
			case MessengerAppState.Ready:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.Home }],
					}),
				)
				return
			case MessengerAppState.PreReady:
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Onboarding.SetupFinished }],
					}),
				)
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
				context.appState === MessengerAppState.Ready
					? Routes.Main.Home
					: Routes.Onboarding.GetStarted
			}
			screenOptions={CustomTransitionOptions}
		>
			<NavigationStack.Screen
				name={Routes.Main.ContactRequest}
				component={Components.Main.ContactRequest}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Scan}
				component={Components.Main.Scan}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Main.NetworkOptions}
				component={Components.Main.NetworkOptions}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Main.Permissions}
				component={Components.Main.Permissions}
				options={ModalScreenOptions}
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
				name={Routes.Chat.MultiMemberSettingsAddMembers}
				component={Components.Chat.MultiMemberSettingsAddMembers}
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
				name={Routes.Chat.SharedMedias}
				component={Components.Chat.SharedMedias}
			/>
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroupAddMembers}
				component={CreateGroupNavigation}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen name={Routes.Main.Home} component={Components.Main.Home} />
			<NavigationStack.Screen
				name={Routes.Settings.MyBertyId}
				component={Components.Settings.MyBertyId}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.EditProfile}
				component={Components.Settings.EditProfile}
				options={ModalScreenOptions}
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
				name={Routes.Onboarding.GetStarted}
				component={Components.Onboarding.GetStarted}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.ChoosePreset}
				component={Components.Onboarding.ChoosePreset}
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
			<NavigationStack.Screen
				name={Routes.Modals.DeleteAccount}
				component={Components.Modals.DeleteAccount}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Modals.ManageDeepLink}
				component={Components.Modals.ManageDeepLink}
				options={ModalScreenOptions}
			/>
			<NavigationStack.Screen
				name={Routes.Modals.ImageView}
				component={Components.Modals.ImageView}
				options={{ ...ModalScreenOptions, gestureEnabled: false }}
			/>
		</NavigationStack.Navigator>
	)
}
