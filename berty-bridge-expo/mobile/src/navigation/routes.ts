// Mapping between the legacy React Navigation screen names and the Expo Router
// paths under app/. Generated alongside the app/ tree; keep the two in sync.

import { ScreensParams } from './types'

export const ROUTE_PATHS: Record<keyof ScreensParams, string> = {
	'Account.SelectNode': '/account/select-node',
	'Account.GoToLogInOrCreate': '/account/login-or-create',
	'Account.Creating': '/account/creating',
	'Account.Opening': '/account/opening',
	'Account.Closing': '/account/closing',
	'Account.Importing': '/account/importing',
	'Account.Deleting': '/account/deleting',
	'Onboarding.GetStarted': '/onboarding/get-started',
	'Onboarding.CreateAccount': '/onboarding/create-account',
	'Onboarding.SetupFinished': '/onboarding/setup-finished',
	'Onboarding.CustomModeSettings': '/onboarding/custom-mode-settings',
	'Onboarding.WebViews': '/onboarding/web-views',
	'Onboarding.DefaultMode': '/onboarding/default-mode',
	'Onboarding.CustomMode': '/onboarding/custom-mode',
	'Chat.Home': '/chat/home',
	'Chat.ContactRequest': '/chat/contact-request',
	'Chat.Share': '/chat/share',
	'Chat.CreateGroupAddMembers': '/chat/create-group-add-members',
	'Chat.CreateGroupFinalize': '/chat/create-group-finalize',
	'Chat.OneToOne': '/chat/one-to-one',
	'Chat.MultiMember': '/chat/multi-member',
	'Chat.OneToOneSettings': '/chat/one-to-one-settings',
	'Chat.ContactSettings': '/chat/contact-settings',
	'Chat.MultiMemberSettings': '/chat/multi-member-settings',
	'Chat.SettingsMemberDetail': '/chat/settings-member-detail',
	'Chat.MultiMemberQR': '/chat/multi-member-qr',
	'Chat.MultiMemberSettingsAddMembers': '/chat/multi-member-add-members',
	'Chat.ReplicateGroupSettings': '/chat/replicate-group-settings',
	'Chat.ManageDeepLink': '/chat/manage-deep-link',
	'Settings.Home': '/settings/home',
	'Settings.Network': '/settings/network',
	'Settings.Notifications': '/settings/notifications',
	'Settings.ContactAndConversations': '/settings/contact-and-conversations',
	'Settings.Appearance': '/settings/appearance',
	'Settings.ThemeEditor': '/settings/theme-editor',
	'Settings.Accounts': '/settings/accounts',
	'Settings.LinkedIdentities': '/settings/linked-identities',
	'Settings.DirectorySearch': '/settings/directory-search',
	'Settings.AboutBerty': '/settings/about-berty',
	'Settings.MyBertyId': '/settings/my-berty-id',
	'Settings.TermsOfUse': '/settings/terms-of-use',
	'Settings.DeleteAccount': '/settings/delete-account',
	'Settings.DevTools': '/settings/dev-tools',
	'Settings.FakeData': '/settings/fake-data',
	'Settings.SystemInfo': '/settings/system-info',
	'Settings.AddDevConversations': '/settings/add-dev-conversations',
	'Settings.IpfsWebUI': '/settings/ipfs-webui',
	'Settings.DevText': '/settings/dev-text',
	'Settings.Roadmap': '/settings/roadmap',
	'Settings.Faq': '/settings/faq',
	'Settings.PrivacyPolicy': '/settings/privacy-policy',
	'Settings.CodeLicense': '/settings/code-license',
	'Settings.Permissions': '/settings/permissions',
}

// Expo Router names its navigator routes after the file path under app/
// ('chat/one-to-one'); router hrefs use the leading slash.
export const toRouteName = (name: keyof ScreensParams): string => {
	const path = ROUTE_PATHS[name]
	if (!path) {
		throw new Error(`unknown route name: ${String(name)}`)
	}
	return path.replace(/^\//, '')
}

// Reverse lookup, for code that needs to reason about the active route using the
// legacy dotted names.
export const ROUTE_NAMES: Record<string, keyof ScreensParams> = Object.fromEntries(
	Object.entries(ROUTE_PATHS).map(([name, path]) => [path.replace(/^\//, ''), name]),
) as Record<string, keyof ScreensParams>
