import { Tabs } from './interfaces'

export const getTabList = (tabs: Tabs[]) => {
	const list = []

	for (const tab of tabs) {
		switch (tab.name) {
			case 'QR':
				list.push({
					key: 'qr',
					name: tab.name,
					icon: 'qr',
					iconPack: 'custom',
					buttonDisabled: tab.buttonDisabled,
				})
				break
			case 'Fingerprint':
				list.push({
					key: 'fingerprint',
					name: tab.name,
					icon: 'fingerprint',
					iconPack: 'custom',
					buttonDisabled: tab.buttonDisabled,
				})
				break
			case 'Info':
				list.push({
					key: 'info',
					name: tab.name,
					icon: 'info-outline',
					buttonDisabled: tab.buttonDisabled,
				})
				break
			case 'Devices':
				list.push({
					key: 'devices',
					name: tab.name,
					icon: 'smartphone',
					iconPack: 'feather',
					iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
					buttonDisabled: tab.buttonDisabled,
				})
				break
			default:
				break
		}
	}

	return list
}
