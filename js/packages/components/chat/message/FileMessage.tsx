import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import RNFS from 'react-native-fs'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { getSource } from '../../utils'

export const FileMessage: React.FC<{ medias: any }> = ({ medias }) => {
	const { client } = useMsgrContext()
	const [source, setSource] = useState('')
	const [isLoading, setLoading] = useState(false)
	const [isDownloaded, setDownloaded] = useState(false)
	const [{ margin }] = useStyles()

	useEffect(() => {
		if (!client) {
			return
		}
		getSource(client, medias[0].cid)
			.then((src) => {
				setSource(src)
			})
			.catch((e) => console.error('failed to get picture message image:', e))
	}, [client, medias])

	return (
		<TouchableOpacity
			style={{
				flexDirection: 'row',
			}}
			onPress={() => {
				setLoading(true)
				RNFS.copyFile(source, `${RNFS.DocumentDirectoryPath}/${medias[0].filename}`)
					.then(() => {
						setDownloaded(true)
						setLoading(false)
					})
					.catch((err) => console.log(err))
			}}
		>
			<Icon name='file' height={20} width={20} fill='#939FB6' />
			<Text
				style={{
					fontStyle: 'italic',
					textDecorationLine: 'underline',
				}}
			>
				{medias[0].filename}
			</Text>
			{(isDownloaded || isLoading) && (
				<Text style={[margin.left.tiny]}>({isDownloaded ? 'Downloaded' : 'Downloading'})</Text>
			)}
		</TouchableOpacity>
	)
}
