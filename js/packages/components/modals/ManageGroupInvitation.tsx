import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useNavigation } from '@berty-tech/navigation'

export const ManageGroupInvitation: React.FC = () => {
	const { navigate } = useNavigation()
	navigate.main.home()
	return <ActivityIndicator size='large' />
}
