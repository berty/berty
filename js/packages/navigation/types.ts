import React from 'react'
import { PermissionStatus } from 'react-native-permissions'

import beapi from '@berty/api'
import { StackScreenProps } from '@react-navigation/stack'
import { PermissionType } from '@berty/rnutil/checkPermissions'

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
	'Chat.BlePermission': {
		accept: () => Promise<void>
		deny: () => Promise<void>
	}
	'Chat.Share': undefined
	'Chat.Permissions': {
		permissionType: PermissionType
		permissionStatus: PermissionStatus
		navigateNext: keyof ScreensParams
		onComplete?: (() => Promise<void>) | (() => void)
	}

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
	'Chat.SharedMedias': { convPk: string }

	// Settings

	'Settings.ServicesAuth': undefined
	'Settings.AboutBerty': undefined
	'Settings.TermsOfUse': undefined
	'Settings.NetworkMap': undefined
	'Settings.Roadmap': undefined
	'Settings.Faq': undefined
	'Settings.PrivacyPolicy': undefined
	'Settings.BertyServices': undefined

	'Settings.Home': undefined
	'Settings.MyBertyId': undefined
	'Settings.Network': undefined
	'Settings.Notifications': undefined
	'Settings.ContactAndConversations': undefined
	'Settings.Appearance': undefined
	'Settings.DevicesAndBackup': undefined
	'Settings.Security': undefined
	'Settings.Accounts': undefined

	'Settings.DevTools': undefined
	'Settings.IpfsWebUI': undefined
	'Settings.ThemeEditor': undefined
	'Settings.DeleteAccount': undefined
	'Settings.SystemInfo': undefined
	'Settings.FakeData': undefined
	'Settings.AddDevConversations': undefined
	'Settings.DevText': { text: string }

	// Modals

	'Chat.ManageDeepLink': {
		type: 'qr' | 'link'
		value: string
	}
	'Modals.ImageView': {
		images: (beapi.messenger.IMedia & { uri?: string })[]
		previewOnly?: boolean
	}
}

type ScreenProps<T extends keyof ScreensParams> = StackScreenProps<ScreensParams, T>

export type ScreenFC<T extends keyof ScreensParams> = React.FC<ScreenProps<T>>
