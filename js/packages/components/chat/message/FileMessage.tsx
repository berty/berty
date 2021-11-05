import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import RNFS from 'react-native-fs'

import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { getSource } from '../../utils'

import { NativeModules } from 'react-native'
const { RootDir } = NativeModules

export const FileMessage: React.FC<{
	medias: any
	onLongPress: () => void
	isHighlight: boolean
}> = ({ medias, onLongPress, isHighlight }) => {
	const colors = useThemeColor()
	const { protocolClient } = useMsgrContext()
	const [source, setSource] = useState('')
	const [isLoading, setLoading] = useState(false)
	const [isDownloaded, setDownloaded] = useState(false)
	const [{ margin }] = useStyles()

	useEffect(() => {
		if (!protocolClient) {
			return
		}
		getSource(protocolClient, medias[0].cid)
			.then(src => {
				setSource(src)
			})
			.catch(e => console.error('failed to get picture message image:', e))
	}, [protocolClient, medias])

	return (
		<TouchableOpacity
			style={[
				{
					flexDirection: 'row',
				},
				isHighlight && {
					shadowColor: colors.shadow,
					shadowOffset: {
						width: 0,
						height: 8,
					},
					shadowOpacity: 0.44,
					shadowRadius: 10.32,
					elevation: 16,
				},
			]}
			onLongPress={onLongPress}
			onPress={() => {
				setLoading(true)
				RNFS.writeFile(`${await RootDir.get()}/${medias[0].filename}`, source, 'base64')
					.then(() => {
						setDownloaded(true)
						setLoading(false)
					})
					.catch(err => console.log(err))
			}}
		>
			<Icon
				name='file'
				height={20}
				width={20}
				fill={isHighlight ? colors['background-header'] : colors['secondary-text']}
			/>
			<Text
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
			</Text>
			{(isDownloaded || isLoading) && (
				<Text style={[margin.left.tiny]}>({isDownloaded ? 'Downloaded' : 'Downloading'})</Text>
			)}
		</TouchableOpacity>
	)
}
