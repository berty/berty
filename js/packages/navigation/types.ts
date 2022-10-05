import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { PermissionStatus } from 'react-native-permissions'

import { PermissionType } from '@berty/utils/permissions/permissions'

export type ScreensParams = {
	// Onboarding

	'Onboarding.GetStarted': undefined
	'Onboarding.CreateAccount': undefined
	'Onboarding.SetupFinished': undefined
	'Onboarding.CustomModeSettings': undefined
	'Onboarding.WebViews': { url: string }

	'Onboarding.DefaultMode': undefined
	'Onboarding.CustomMode': undefined

	// Main

	'Chat.Home': undefined
	'Chat.ContactRequest': { contactId: string }
	'Chat.Share': undefined

	// Create group

	'Chat.CreateGroupAddMembers': undefined
	'Chat.CreateGroupFinalize': undefined

	// Chat

	'Chat.OneToOne': { convId: string; scrollToMessage?: string | null }
	'Chat.Group': { convId: string; scrollToMessage?: string | null }
	'Chat.OneToOneSettings': { convId: string }
	'Chat.ContactSettings': { contactId: string }
	'Group.MultiMemberSettings': { convId: string }
	'Chat.MultiMemberSettingsAddMembers': { convPK: string }
	'Group.ChatSettingsMemberDetail': { convId: string; memberPk: string; displayName: string }
	'Chat.MultiMemberQR': { convId: string }
	'Chat.ReplicateGroupSettings': { convId: string }

	// Settings

	'Settings.AboutBerty': undefined
	'Settings.TermsOfUse': undefined
	'Settings.Roadmap': undefined
	'Settings.Faq': undefined
	'Settings.PrivacyPolicy': undefined

	'Settings.Home': undefined
	'Settings.MyBertyId': undefined
	'Settings.Network': undefined
	'Settings.Notifications': undefined
	'Settings.ContactAndConversations': undefined
	'Settings.Appearance': undefined
	'Settings.Accounts': undefined

	'Settings.DevTools': undefined
	'Settings.IpfsWebUI': undefined
	'Settings.ThemeEditor': undefined
	'Settings.DeleteAccount': undefined
	'Settings.SystemInfo': undefined
	'Settings.FakeData': undefined
	'Settings.AddDevConversations': undefined
	'Settings.DevText': { text: string }
	'Settings.Permissions': {
		permissionType: PermissionType
		status: PermissionStatus
		accept: () => Promise<void> | void
		deny: () => Promise<void> | void
	}

	// Modals

	'Chat.ManageDeepLink': {
		type: 'qr' | 'link'
		value: string
	}

	// Account

	'Account.InitialLaunch': undefined
	'Account.Opening': { selectedAccount: string; isNewAccount?: boolean }
	'Account.Creating': undefined
	// we know that it is a warning but it's ok since we don't persist the navigation state
	// https://reactnavigation.org/docs/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
	'Account.Closing': { callback: () => void }
	'Account.Importing': { filePath: string }
	'Account.Deleting': { selectedAccount: string }
}

type ScreenProps<T extends keyof ScreensParams> = StackScreenProps<ScreensParams, T>

export type ScreenFC<T extends keyof ScreensParams> = React.FC<ScreenProps<T>>
