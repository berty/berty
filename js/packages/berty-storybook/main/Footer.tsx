import React from 'react'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { Chat } from '@berty-tech/hooks'
import { useNavigation, Routes } from '@berty-tech/berty-navigation'

export const Footer: React.FC<{ selected: string }> = ({ selected }) => {
	const { navigate } = useNavigation()
	const client = Chat.useClient()
	return (
		<SharedFooter
			left={{
				icon: 'search-outline',
				onPress: navigate.main.search,
				selected: selected === Routes.Main.Search,
			}}
			center={
				selected === Routes.Main.List
					? {
							icon: 'plus-outline',
							onPress: navigate.main.listModal,
							selected: true,
					  }
					: {
							icon: 'message-circle-outline',
							onPress: navigate.main.list,
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
