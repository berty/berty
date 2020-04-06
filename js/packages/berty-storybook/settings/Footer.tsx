import React from 'react'
import { Footer as SharedFooter } from '../shared-components/Footer'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@react-navigation/native'

export const Footer: React.FC<{ currentRouteName: string }> = ({ currentRouteName }) => {
	const client = Chat.useClient()
	const navigation = useNavigation()
	console.log('currentRouteName', currentRouteName)
	let center, right
	if (currentRouteName === 'Settings') {
		center = {
			icon: 'message-circle-outline',
			onPress: () => navigation.navigate('Main'),
		}
		right = {
			seed: client?.accountPk,
			backgroundColor: 'blue',
			size: 50,
			elemSize: 35,
			onPress: () => navigation.navigate('Settings'),
		}
	} else {
		center = {
			icon: 'plus-outline',
			onPress: () => navigation.navigate('TransparentModals', { screen: 'Main.ListModal' }),
			backgroundColor: 'blue',
			size: 50,
			elemSize: 30,
			elemColor: 'white',
		}
		right = {
			seed: client?.accountPk,
			backgroundColor: 'white',
			onPress: () => navigation.navigate('Settings'),
			elemSize: 30,
		}
	}
	return (
		<SharedFooter
			left={{
				icon: 'search-outline',
				onPress: () => navigation.navigate('FullModals', { screen: 'Search' }),
			}}
			center={center}
			right={right}
			onLayout={() => {}}
		/>
	)
}
