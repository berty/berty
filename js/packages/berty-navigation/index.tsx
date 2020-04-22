// TODO: create /api/js-internal/bertychatnavigation.proto and generate this file

import React, { useMemo, useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import * as Stories from '@berty-tech/berty-storybook'
import {
	useNavigation as useReactNavigation,
	NavigationProp,
	CommonActions,
	useLinking,
	NavigationContainer as ReactNavigationContainer,
} from '@react-navigation/native'
import {
	createBottomTabNavigator,
	BottomTabNavigationProp,
	BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import { berty } from '@berty-tech/api'
import { Chat as ChatHooks } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'

export namespace ScreenProps {
	export namespace Onboarding {
		export type GetStarted = {}
		export type SelectMode = {}
		export type Performance = {}
		export type Privacy = {}
	}
	export namespace Main {
		export type ContactRequest = { route: { params: berty.chatmodel.IContact } }
		export type GroupRequest = {
			route: {
				params: berty.chatmodel.IConversation & {
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup
				}
			}
		}
		export type ScanRequest = {}
		export type Scan = { route: { params: berty.chatmodel.IContact } }

		export type ListModal = {}
		export type Search = {}
		export type RequestSent = {}
		export namespace CreateGroup {
			export type CreateGroup = {}
			export type CreateGroup2 = {}
			export type CreateGroup3 = {}
		}
	}
	export namespace Chat {
		export type List = {}
		export type One2One = { route: { params: { convId: string } } }
		export type Group = {
			route: {
				params: berty.chatmodel.IConversation & {
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup
				}
			}
		}
		export type Settings = { route: { params: berty.chatmodel.IConversation } }
		export type One2OneSettings = { route: { params: berty.chatmodel.IContact } }
		export type GroupSettings = { route: { params: berty.chatmodel.IConversation } }
	}
	export namespace Settings {
		export type Home = {}
		export type MyBertyId = {}
		export type EditProfile = {}
		export type AppUpdates = {}
		export type Help = {}
		export type Mode = {}
		export type BlockedContacts = {}
		export type Notifications = {}
		export type Bluetooth = {}
		export type AboutBerty = {}
		export type TermsOfUse = {}
		export type DevTools = {}
	}
}

export namespace Routes {
	export enum Root {
		Tabs = 'Tabs',
	}
	export enum Onboarding {
		GetStarted = 'Onboarding.GetStarted',
		SelectMode = 'Onboarding.SelectMode',
		Performance = 'Onboarding.Performance',
		Privacy = 'Onboarding.Privacy',
	}
	export enum Main {
		List = 'Main.List',
		ContactRequest = 'Main.ContactRequest',
		GroupRequest = 'Main.GroupRequest',
		ScanRequest = 'Main.ScanRequest',
		Scan = 'Main.Scan',
		ListModal = 'Main.ListModal',
		Search = 'Main.Search',
		RequestSent = 'Main.RequestSent',
	}
	export enum CreateGroup {
		CreateGroup1 = 'Main.CreateGroup1',
		CreateGroup2 = 'Main.CreateGroup2',
		CreateGroup3 = 'Main.CreateGroup3',
	}
	export enum Chat {
		One2One = 'Chat.One2One',
		Group = 'Chat.Group',
		Settings = 'Chat.Settings',
		One2OneSettings = 'Chat.One2OneSettings',
		GroupSettings = 'Group.GroupSettings',
	}
	export enum Settings {
		Home = 'Settings.Home',
		MyBertyId = 'Settings.MyBertyId',
		EditProfile = 'Settings.EditProfile',
		AppUpdates = 'Settings.AppUpdates',
		Help = 'Settings.Help',
		Mode = 'Settings.Mode',
		BlockedContacts = 'Settings.BlockedContacts',
		Notifications = 'Settings.Notifications',
		Bluetooth = 'Settings.Bluetooth',
		AboutBerty = 'Settings.AboutBerty',
		TermsOfUse = 'Settings.TermsOfUse',
		DevTools = 'Settings.DevTools',
	}
	export enum Modals {
		SendContactRequest = 'SendContactRequest',
	}
}

const createNavigateFunc = <TParams extends {} | undefined = {}>(
	navigate: NavigationProp<any>['navigate'],
	route: string,
) => (params?: TParams) => navigate(route, params)

const createNavigation = ({
	navigate,
	goBack,
	dispatch,
}: NavigationProp<any> | BottomTabNavigationProp<any>) => {
	return {
		dispatch: (action: any) => dispatch(action),
		goBack: () => goBack(),
		reset: (type: string) => {
			if (type === 'Onboarding') {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Onboarding.GetStarted }],
					}),
				)
				dispatch(CommonActions.navigate(Routes.Main.List))
			} else {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.List }],
					}),
				)
				dispatch(CommonActions.navigate(Routes.Onboarding.GetStarted))
			}
		},
		navigate: {
			onboarding: {
				getStarted: createNavigateFunc(navigate, Routes.Onboarding.GetStarted),
				selectMode: createNavigateFunc(navigate, Routes.Onboarding.SelectMode),
				performance: createNavigateFunc(navigate, Routes.Onboarding.Performance),
				privacy: createNavigateFunc(navigate, Routes.Onboarding.Privacy),
			},
			main: {
				list: createNavigateFunc(navigate, Routes.Main.List),
				contactRequest: createNavigateFunc<berty.chatmodel.IContact>(
					navigate,
					Routes.Main.ContactRequest,
				),
				groupRequest: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Main.GroupRequest,
				),
				scanRequest: createNavigateFunc(navigate, Routes.Main.ScanRequest),
				scan: createNavigateFunc(navigate, Routes.Main.Scan),

				listModal: createNavigateFunc(navigate, Routes.Main.ListModal),
				search: createNavigateFunc(navigate, Routes.Main.Search),
				requestSent: createNavigateFunc(navigate, Routes.Main.RequestSent),
				createGroup: {
					createGroup1: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup1),
					createGroup2: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup2),
					createGroup3: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroup3),
				},
			},
			chat: {
				one2One: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.One2One),
				group: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.Group),
				settings: createNavigateFunc<berty.chatmodel.IConversation>(navigate, Routes.Chat.Settings),
				one2OneSettings: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Chat.One2OneSettings,
				),
				groupSettings: createNavigateFunc<berty.chatmodel.IConversation>(
					navigate,
					Routes.Chat.GroupSettings,
				),
			},
			settings: {
				home: createNavigateFunc(navigate, Routes.Settings.Home),
				myBertyId: createNavigateFunc(navigate, Routes.Settings.MyBertyId),
				editProfile: createNavigateFunc(navigate, Routes.Settings.EditProfile),
				appUpdates: createNavigateFunc(navigate, Routes.Settings.AppUpdates),
				help: createNavigateFunc(navigate, Routes.Settings.Help),
				mode: createNavigateFunc(navigate, Routes.Settings.Mode),
				blockedContacts: createNavigateFunc(navigate, Routes.Settings.BlockedContacts),
				notifications: createNavigateFunc(navigate, Routes.Settings.Notifications),
				bluetooth: createNavigateFunc(navigate, Routes.Settings.Bluetooth),
				aboutBerty: createNavigateFunc(navigate, Routes.Settings.AboutBerty),
				termsOfUse: createNavigateFunc(navigate, Routes.Settings.TermsOfUse),
				devTools: createNavigateFunc(navigate, Routes.Settings.DevTools),
			},
		},
	}
}

export const useNavigation = () => {
	const reactNav = useReactNavigation()
	return useMemo(() => createNavigation(reactNav), [reactNav])
}

const FakeStack = createNativeStackNavigator()
export const FakeNavigation: React.FC = ({ children }) => {
	return (
		<FakeStack.Navigator screenOptions={{ headerShown: false }}>
			<FakeStack.Screen name='Fake'>{() => children}</FakeStack.Screen>
		</FakeStack.Navigator>
	)
}

const ModalsStack = createNativeStackNavigator()
export const ModalsNavigation: React.FC = () => (
	<ModalsStack.Navigator screenOptions={{ headerShown: false }}>
		<ModalsStack.Screen
			name={Routes.Modals.SendContactRequest}
			component={Stories.Modals.SendContactRequest}
			options={{
				stackPresentation: 'transparentModal',
				stackAnimation: 'fade',
			}}
		/>
	</ModalsStack.Navigator>
)

const CreateGroupStack = createNativeStackNavigator()
export const CreateGroupNavigation: React.FC<BottomTabBarProps> = () => {
	const [members, setMembers] = useState([] as chat.contact.Entity[])
	const setMember = (contact: chat.contact.Entity) => {
		if (members.find((member) => member.id === contact.id)) {
			return
		}
		setMembers([...members, contact])
	}
	const removeMember = (id: string) => {
		const filtered = members.filter((member) => member.id !== id)
		if (filtered.length !== members.length) {
			setMembers(filtered)
		}
	}

	return (
		<CreateGroupStack.Navigator screenOptions={{ headerShown: false }}>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup2}
				options={{ stackPresentation: 'transparentModal' }}
			>
				{() => (
					// should use setParams ? maybe, tis weird
					<Stories.Main.CreateGroup2
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup3}
				options={{ stackPresentation: 'transparentModal' }}
			>
				{() => <Stories.Main.CreateGroup3 members={members} onRemoveMember={removeMember} />}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={Routes.CreateGroup.CreateGroup1}
				options={{ stackPresentation: 'transparentModal' }}
			>
				{() => (
					<Stories.Main.CreateGroup
						members={members}
						onRemoveMember={removeMember}
						onSetMember={setMember}
					/>
				)}
			</CreateGroupStack.Screen>
			<CreateGroupStack.Screen
				name={'Modals'}
				component={ModalsNavigation}
				options={{ stackPresentation: 'transparentModal', stackAnimation: 'fade' }}
			/>
		</CreateGroupStack.Navigator>
	)
}

const SearchStack = createNativeStackNavigator()
export const SearchNavigation: React.FC<BottomTabBarProps> = () => (
	<SearchStack.Navigator screenOptions={{ headerShown: false }}>
		<SearchStack.Screen name={Routes.Main.Search} component={Stories.Main.Search} />
		<SearchStack.Screen
			name={'Modals'}
			component={ModalsNavigation}
			options={{ stackPresentation: 'transparentModal', stackAnimation: 'fade' }}
		/>
	</SearchStack.Navigator>
)

const TabStack = createBottomTabNavigator()
export const TabNavigation: React.FC = () => {
	return (
		<TabStack.Navigator
			tabBar={({ state }) => <Stories.Main.Footer selected={state.routes[state.index].name} />}
		>
			<TabStack.Screen name={Routes.Main.List} component={Stories.Main.List} />
			<TabStack.Screen name={Routes.Main.Search} component={SearchNavigation} />
			<TabStack.Screen name={Routes.Settings.Home} component={Stories.Settings.Home} />
		</TabStack.Navigator>
	)
}

// TODO: fix navigation with switchNavigator
const NavigationStack = createNativeStackNavigator()
export const Navigation: React.FC = () => {
	const length = ChatHooks.useAccountLength()
	return (
		<NavigationStack.Navigator
			initialRouteName={length >= 1 ? Routes.Root.Tabs : Routes.Onboarding.GetStarted}
			screenOptions={{ headerShown: false }}
		>
			<NavigationStack.Screen
				name={Routes.Main.ContactRequest}
				component={Stories.Main.ContactRequest}
				options={{
					stackPresentation: 'transparentModal',
					stackAnimation: 'fade',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Main.GroupRequest}
				component={Stories.Main.GroupRequest}
				options={{
					stackPresentation: 'transparentModal',
					stackAnimation: 'fade',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen name={Routes.Main.ScanRequest} component={Stories.Main.ScanRequest} />
			<NavigationStack.Screen
				name={Routes.Main.Scan}
				component={Stories.Main.Scan}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen name={Routes.Chat.One2One} component={Stories.Chat.Chat} />
			<NavigationStack.Screen name={Routes.Chat.Group} component={Stories.Chat.ChatGroup} />
			<NavigationStack.Screen name={Routes.Chat.Settings} component={Stories.Chat.ChatSettings} />
			<NavigationStack.Screen
				name={Routes.Chat.One2OneSettings}
				component={Stories.Chat.ContactChatSettings}
			/>
			<NavigationStack.Screen
				name={Routes.Chat.GroupSettings}
				component={Stories.Chat.GroupChatSettings}
			/>

			<NavigationStack.Screen
				name={Routes.Main.ListModal}
				component={Stories.Main.ListModal}
				options={{
					stackPresentation: 'transparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Main.RequestSent}
				component={Stories.Main.RequestSent}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen
				name={Routes.CreateGroup.CreateGroup2}
				component={CreateGroupNavigation}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen name={Routes.Root.Tabs} component={TabNavigation} />
			<NavigationStack.Screen
				name={Routes.Settings.MyBertyId}
				component={Stories.Settings.MyBertyId}
				options={{ stackPresentation: 'transparentModal' }}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.EditProfile}
				component={Stories.Settings.EditProfile}
				options={{
					stackPresentation: 'transparentModal',
					contentStyle: { backgroundColor: 'transparent' },
				}}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AppUpdates}
				component={Stories.Settings.AppUpdates}
			/>
			<NavigationStack.Screen name={Routes.Settings.Help} component={Stories.Settings.Help} />
			<NavigationStack.Screen name={Routes.Settings.Mode} component={Stories.Settings.Mode} />
			<NavigationStack.Screen
				name={Routes.Settings.BlockedContacts}
				component={Stories.Settings.BlockedContacts}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Notifications}
				component={Stories.Settings.Notifications}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.Bluetooth}
				component={Stories.Settings.Bluetooth}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.AboutBerty}
				component={Stories.Settings.AboutBerty}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.TermsOfUse}
				component={Stories.Settings.TermsOfUse}
			/>
			<NavigationStack.Screen
				name={Routes.Settings.DevTools}
				component={Stories.Settings.DevTools}
			/>
			<NavigationStack.Screen
				name={'Modals'}
				component={ModalsNavigation}
				options={{ stackPresentation: 'transparentModal', stackAnimation: 'fade' }}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.GetStarted}
				component={Stories.Onboarding.GetStarted}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.SelectMode}
				component={Stories.Onboarding.SelectMode}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.Performance}
				component={Stories.Onboarding.Performance}
			/>
			<NavigationStack.Screen
				name={Routes.Onboarding.Privacy}
				component={Stories.Onboarding.Privacy}
			/>
		</NavigationStack.Navigator>
	)
}

export const NavigationContainer: React.FC = ({ children }) => {
	const ref = React.useRef()

	const { getInitialState } = useLinking(ref, {
		prefixes: ['berty://'],
		config: {
			['Modals']: {
				screens: {
					[Routes.Modals.SendContactRequest]: ':uriData',
				},
			},
		},
	})

	const [isReady, setIsReady] = React.useState(false)
	const [initialState, setInitialState] = React.useState()

	React.useEffect(() => {
		Promise.race([
			getInitialState(),
			new Promise((resolve) =>
				// Timeout in 150ms if `getInitialState` doesn't resolve
				// Workaround for https://github.com/facebook/react-native/issues/25675
				setTimeout(resolve, 150),
			),
		])
			.catch((e) => {
				console.error(e)
			})
			.then((state) => {
				if (state !== undefined) {
					setInitialState(state)
				}

				setIsReady(true)
			})
	}, [getInitialState])

	if (!isReady) {
		return null
	}

	return (
		<ReactNavigationContainer initialState={initialState} ref={ref}>
			{children}
		</ReactNavigationContainer>
	)
}

export default Navigation
