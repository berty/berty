import { Icon } from '@ui-kitten/components'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { getSource } from '@berty/utils/protocol/attachments'

export const FileMessage: React.FC<{
	medias: beapi.messenger.IMedia[]
	onLongPress: () => void
	isHighlight: boolean
}> = ({ medias, onLongPress, isHighlight }) => {
	const colors = useThemeColor()
	const protocolClient = useSelector(selectProtocolClient)

	const [, setSource] = useState('')
	const [isLoading, setLoading] = useState(false)
	const [isDownloaded] = useState(false)
	const { margin } = useStyles()

	useEffect(() => {
		if (!protocolClient || !medias[0].cid) {
			return
		}
		getSource(protocolClient, medias[0].cid)
			.then(setSource)
			.catch(e => console.error('failed to get picture message image:', e))
	}, [protocolClient, medias])

	return (
		<TouchableOpacity
			style={[
				{ flexDirection: 'row' },
				isHighlight && {
					shadowColor: colors.shadow,
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.44,
					shadowRadius: 10.32,
					elevation: 16,
				},
			]}
			onLongPress={onLongPress}
			onPress={() => setLoading(true)}
		>
			<Icon
				name='file'
				height={20}
				width={20}
				fill={isHighlight ? colors['background-header'] : colors['secondary-text']}
			/>
			<UnifiedText
				numberOfLines={1}
				style={[
					{
						fontStyle: 'italic',
						textDecorationLine: 'underline',
					},
					isHighlight && {
						textDecorationColor: colors['background-header'],
						color: colors['background-header'],
					},
				]}
			>
				{medias[0].filename}
			</UnifiedText>
			{(isDownloaded || isLoading) && (
				<UnifiedText style={[margin.left.tiny]}>
					({isDownloaded ? 'Downloaded' : 'Downloading'})
				</UnifiedText>
			)}
		</TouchableOpacity>
	)
}
