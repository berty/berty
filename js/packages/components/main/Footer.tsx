import React from 'react'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { Messenger } from '@berty-tech/hooks'
import { useNavigation, Routes } from '@berty-tech/navigation'

export const Footer: React.FC<{ selected: string }> = ({ selected }) => {
	const { navigate } = useNavigation()
	const client = Messenger.useClient()
	return (
		<SharedFooter
			left={{
				icon: 'search-outline',
				// onPress: navigate.main.search,
				selected: selected === Routes.Main.Search,
				disabled: true,
				onPress: () => {},
			}}
			center={
				selected === Routes.Main.Home
					? {
							icon: 'plus-outline',
							onPress: navigate.main.listModal,
							selected: true,
					  }
					: {
							icon: 'bubble',
							iconPack: 'custom',
							onPress: navigate.main.home,
							selected: false,
					  }
			}
			right={{
				seed: client?.accountPk,
				onPress: navigate.settings.home,
				selected: selected === Routes.Settings.Home,
				selectedElemSize: 30,
				elemSize: 24,
			}}
		/>
	)
}
