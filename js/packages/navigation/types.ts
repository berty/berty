export type RouteProps<T> = { route: { params: T } }

export namespace ScreenProps {
	export namespace Onboarding {
		export type GetStarted = RouteProps<void>
		export type SelectMode = RouteProps<void>
		export type Performance = RouteProps<void>
		export type Privacy = RouteProps<void>
	}
	export namespace Main {
		export type Home = RouteProps<void>
		export type ContactRequest = RouteProps<{ contactId: string }>
		export type GroupRequest = RouteProps<{ convId: string }>
		export type Scan = RouteProps<void>
		export type HomeModal = RouteProps<void>
		export type Search = RouteProps<void>
		export type RequestSent = RouteProps<void>
		export namespace CreateGroup {
			export type CreateGroupAddMembers = RouteProps<void>
			export type CreateGroupFinalize = RouteProps<void>
		}
	}
	export namespace Chat {
		export type OneToOne = RouteProps<{ convId: string; scrollToMessage?: string }>
		export type Group = RouteProps<{ convId: string }>
		export type OneToOneSettings = RouteProps<{ convId: string }>
		export type ContactSettings = RouteProps<{ contactId: string }>
		export type MultiMemberSettings = RouteProps<{ convId: string }>
		export type MultiMemberQR = RouteProps<{ convId: string }>
	}
	export namespace Settings {
		export type Home = RouteProps<void>
		export type MyBertyId = RouteProps<void>
		export type EditProfile = RouteProps<void>
		export type AppUpdates = RouteProps<void>
		export type Help = RouteProps<void>
		export type Mode = RouteProps<void>
		export type BlockedContacts = RouteProps<void>
		export type Notifications = RouteProps<void>
		export type Bluetooth = RouteProps<void>
		export type AboutBerty = RouteProps<void>
		export type TermsOfUse = RouteProps<void>
		export type DevTools = RouteProps<void>
		export type Network = RouteProps<void>
		export type IpfsWebUI = RouteProps<void>
		export type SystemInfo = RouteProps<void>
		export type FakeData = RouteProps<void>
		export type DevText = RouteProps<{ text: string }>
	}
	export namespace Modals {
		export type ManageDeepLink = RouteProps<{ type: 'qr' | 'link'; value: string }>
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
		Home = 'Main.Home',
		ContactRequest = 'Main.ContactRequest',
		GroupRequest = 'Main.GroupRequest',
		Scan = 'Main.Scan',
		HomeModal = 'Main.HomeModal',
		Search = 'Main.Search',
		RequestSent = 'Main.RequestSent',
	}
	export enum CreateGroup {
		CreateGroupAddMembers = 'Main.CreateGroupAddMembers',
		CreateGroupFinalize = 'Main.CreateGroupFinalize',
	}
	export enum Chat {
		OneToOne = 'Chat.OneToOne',
		Group = 'Chat.Group',
		OneToOneSettings = 'Chat.OneToOneSettings',
		ContactSettings = 'Chat.ContactSettings',
		MultiMemberSettings = 'Group.MultiMemberSettings',
		MultiMemberQR = 'Chat.MultiMemberQR',
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
		SystemInfo = 'Settings.SystemInfo',
		Network = 'Settings.Network',
		IpfsWebUI = 'Settings.IpfsWebUI',
		DevText = 'Settings.DevText',
		FakeData = 'Settings.FakeData',
	}
	export enum Modals {
		SendContactRequest = 'SendContactRequest',
		DeleteAccount = 'DeleteAccount',
		ManageDeepLink = 'ManageDeepLink',
	}
}
