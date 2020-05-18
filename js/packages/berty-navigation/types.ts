import { berty } from '@berty-tech/api'

export namespace ScreenProps {
	export namespace Onboarding {
		export type GetStarted = {}
		export type SelectMode = {}
		export type Performance = {}
		export type Privacy = {}
	}
	export namespace Main {
		export type ContactRequest = { route: { params: { contactId: string } } }
		export type GroupRequest = { route: { params: { convId: string } } }
		export type ScanRequest = {}
		export type Scan = { route: { params: { contactId: string } } }

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
		export type Group = { route: { params: { convId: string } } }
		export type Settings = { route: { params: { convId: string } } }
		export type One2OneSettings = { route: { params: { convId: string } } }
		export type GroupSettings = { route: { params: { convId: string } } }
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
		DeleteAccount = 'DeleteAccount',
	}
}
