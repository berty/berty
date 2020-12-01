import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AttachmentImage from '../AttachmentImage'
import { RouteProps } from '@berty-tech/navigation'

export const Image: React.FC<RouteProps<{ cid: string }>> = ({
	route: {
		params: { cid },
	},
}) => {
	const { goBack } = useNavigation()
	return (
		<TouchableOpacity onPress={goBack} style={{ width: '100%', height: '100%' }}>
			<AttachmentImage
				notPressable
				cid={cid}
				style={{ width: '100%', height: '100%' }}
				resizeMode='contain'
			/>
		</TouchableOpacity>
	)
}
