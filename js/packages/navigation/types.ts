import React from 'react'
import { PermissionStatus } from 'react-native-permissions'

import beapi from '@berty-tech/api'
import { StackScreenProps } from '@react-navigation/stack'

export type ScreensParams = {
	// Onboarding

	'Onboarding.GetStarted': undefined
	'Onboarding.CreateAccount': undefined
	'Onboarding.SetupFinished': undefined
	'Onboarding.AdvancedSettings': undefined
	'Onboarding.WebViews': { url: string }

	// Main

	'Main.Home': undefined
	'Main.ContactRequest': { contactId: string }
	'Main.Scan': undefined
	'Main.Permissions': {
		permissionType: 'p2p' | 'audio' | 'notification' | 'camera'
		permissionStatus: PermissionStatus
		navigateNext: keyof ScreensParams
		onComplete?: () => Promise<void>
	}

	// Create group

	'Main.CreateGroupAddMembers': undefined
	'Main.CreateGroupFinalize': undefined

	// Chat

	'Chat.OneToOne': { convId: string; scrollToMessage?: string | null }
	'Chat.Group': { convId: string; scrollToMessage?: string | null }
	'Chat.OneToOneSettings': { convId: string }
	'Chat.ContactSettings': { contactId: string }
	'Group.MultiMemberSettings': { convId: string }
	'Group.MultiMemberSettingsAddMembers': { convPK: string }
	'Chat.MultiMemberQR': { convId: string }
	'Chat.ReplicateGroupSettings': { convId: string }
	'Chat.SharedMedias': { convPk: string }

	// Settings

	'Settings.Home': undefined
	'Settings.MyBertyId': undefined
	'Settings.AppUpdates': undefined
	'Settings.Help': undefined
	'Settings.Mode': undefined
	'Settings.ServicesAuth': undefined
	'Settings.AboutBerty': undefined
	'Settings.TermsOfUse': undefined
	'Settings.DevTools': undefined
	'Settings.IpfsWebUI': undefined
	'Settings.SystemInfo': undefined
	'Settings.FakeData': undefined
	'Settings.AddDevConversations': undefined
	'Settings.DevText': { text: string }
	'Settings.NetworkMap': undefined
	'Settings.ThemeEditor': undefined
	'Settings.DeleteAccount': undefined
	'Settings.Roadmap': undefined
	'Settings.Faq': undefined
	'Settings.ReplicationServices': undefined

	// Modals

	'Modals.ManageDeepLink': {
		type: 'qr' | 'link'
		value: string
	}
	'Modals.ImageView': {
		images: (beapi.messenger.IMedia & { uri?: string })[]
		previewOnly?: boolean
	}
}

export type ScreenProps<T extends keyof ScreensParams> = StackScreenProps<ScreensParams, T>

export type ScreenFC<T extends keyof ScreensParams> = React.FC<ScreenProps<T>>
