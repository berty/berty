import { useMemo } from 'react'
import {
	useNavigation as useReactNavigation,
	NavigationProp,
	CommonActions,
} from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Routes, RouteProps, ScreenProps } from './types'

export type NavigateParams<R> = R extends RouteProps<infer T> ? T : never

const createNavigateFunc = <Route>(navigate: NavigationProp<any>['navigate'], route: string) => (
	params?: NavigateParams<Route>,
) => navigate(route, params)

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
				dispatch(CommonActions.navigate(Routes.Main.Home))
			} else {
				dispatch(
					CommonActions.reset({
						routes: [{ name: Routes.Main.Home }],
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
				home: createNavigateFunc<ScreenProps.Main.Home>(navigate, Routes.Main.Home),
				contactRequest: createNavigateFunc<ScreenProps.Main.ContactRequest>(
					navigate,
					Routes.Main.ContactRequest,
				),
				groupRequest: createNavigateFunc(navigate, Routes.Main.GroupRequest),
				scanRequest: createNavigateFunc(navigate, Routes.Main.ScanRequest),
				scan: createNavigateFunc<ScreenProps.Main.Scan>(navigate, Routes.Main.Scan),

				listModal: createNavigateFunc<ScreenProps.Main.HomeModal>(navigate, Routes.Main.HomeModal),
				search: createNavigateFunc(navigate, Routes.Main.Search),
				requestSent: createNavigateFunc(navigate, Routes.Main.RequestSent),
				createGroup: {
					createGroupAddMembers: createNavigateFunc(
						navigate,
						Routes.CreateGroup.CreateGroupAddMembers,
					),
					createGroupFinalize: createNavigateFunc(navigate, Routes.CreateGroup.CreateGroupFinalize),
				},
			},
			chat: {
				oneToOne: createNavigateFunc(navigate, Routes.Chat.OneToOne),
				group: createNavigateFunc(navigate, Routes.Chat.Group),
				settings: createNavigateFunc<ScreenProps.Chat.Settings>(navigate, Routes.Chat.Settings),
				oneToOneSettings: createNavigateFunc<ScreenProps.Chat.OneToOneSettings>(
					navigate,
					Routes.Chat.OneToOneSettings,
				),
				groupSettings: createNavigateFunc<ScreenProps.Chat.GroupSettings>(
					navigate,
					Routes.Chat.GroupSettings,
				),
				multiMemberQR: createNavigateFunc<ScreenProps.Chat.MultiMemberQR>(
					navigate,
					Routes.Chat.MultiMemberQR,
				),
			},
			settings: {
				home: createNavigateFunc<ScreenProps.Settings.Home>(navigate, Routes.Settings.Home),
				myBertyId: createNavigateFunc<ScreenProps.Settings.MyBertyId>(
					navigate,
					Routes.Settings.MyBertyId,
				),
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
				systemInfo: createNavigateFunc(navigate, Routes.Settings.SystemInfo),
				network: createNavigateFunc<ScreenProps.Settings.Network>(
					navigate,
					Routes.Settings.Network,
				),
				ipfsWebUI: createNavigateFunc(navigate, Routes.Settings.IpfsWebUI),
				devText: createNavigateFunc<ScreenProps.Settings.DevText>(
					navigate,
					Routes.Settings.DevText,
				),
			},
			modals: {
				manageDeepLink: createNavigateFunc<ScreenProps.Modals.ManageDeepLink>(
					navigate,
					Routes.Modals.ManageDeepLink,
				),
			},
		},
	}
}

export const useNavigation = () => {
	const reactNav = useReactNavigation()
	return useMemo(() => createNavigation(reactNav), [reactNav])
}
