import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import RNFS from 'react-native-fs'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { getSource } from '../../utils'

export const FileMessage: React.FC<{
	medias: any
	onLongPress: () => void
	isHighlight: boolean
}> = ({ medias, onLongPress, isHighlight }) => {
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
			.then((src) => {
				setSource(src)
			})
			.catch((e) => console.error('failed to get picture message image:', e))
	}, [protocolClient, medias])

	return (
		<TouchableOpacity
			style={[
				{
					flexDirection: 'row',
				},
				isHighlight && {
					shadowColor: '#525BEC',
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
				RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${medias[0].filename}`, source, 'base64')
					.then(() => {
						setDownloaded(true)
						setLoading(false)
					})
					.catch((err) => console.log(err))
			}}
		>
			<Icon name='file' height={20} width={20} fill={isHighlight ? '#525BEC' : '#939FB6'} />
			<Text
				style={[
					{
						fontStyle: 'italic',
						textDecorationLine: 'underline',
					},
					isHighlight && {
						textDecorationColor: '#525BEC',
						color: '#525BEC',
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
