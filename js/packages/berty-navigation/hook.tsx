import { berty } from '@berty-tech/api'
import React, { useMemo } from 'react'
import {
	useNavigation as useReactNavigation,
	NavigationProp,
	CommonActions,
} from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Routes } from './types'

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
				contactRequest: createNavigateFunc(navigate, Routes.Main.ContactRequest),
				groupRequest: createNavigateFunc(navigate, Routes.Main.GroupRequest),
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
				one2One: createNavigateFunc(navigate, Routes.Chat.One2One),
				group: createNavigateFunc(navigate, Routes.Chat.Group),
				settings: createNavigateFunc(navigate, Routes.Chat.Settings),
				one2OneSettings: createNavigateFunc(navigate, Routes.Chat.One2OneSettings),
				groupSettings: createNavigateFunc(navigate, Routes.Chat.GroupSettings),
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
