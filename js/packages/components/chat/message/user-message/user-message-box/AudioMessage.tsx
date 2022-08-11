import { Icon } from '@ui-kitten/components'
import React, { useMemo } from 'react'
import { View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useMusicPlayer } from '@berty/contexts/musicPlayer.context'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'

import { AudioPreviewPriv } from '../../audio/AudioPreview.priv'
import { AudioWrapperPriv } from '../../audio/AudioWrapper.priv'

interface AudioMessageProps {
	medias: Array<beapi.messenger.IMedia>
	isHighlight: boolean
	onLongPress: () => void
	isMine: boolean
}

export const AudioMessage: React.FC<AudioMessageProps> = props => {
	const colors = useThemeColor()
	const protocolClient = useSelector(selectProtocolClient)
	const { padding, border, margin } = useStyles()
	const { windowWidth } = useAppDimensions()
	const {
		player: globalPlayer,
		load: globalPlayerLoad,
		handlePlayPause,
		loading: globalPlayerLoading,
		playing: globalPlayerPlaying,
		currentTime,
	} = useMusicPlayer()
	const mediaCID = useMemo(() => props.medias[0].cid, [props.medias])
	const mimeType = (props.medias.length > 0 && props.medias[0].mimeType) || 'blob'

	const isCurrent = globalPlayer.metadata?.id === mediaCID
	const isPlaying = isCurrent && globalPlayerPlaying
	const loading = isCurrent && globalPlayerLoading === true

	const onPress = () => {
		if (
			globalPlayer.metadata?.id === props.medias[0].cid &&
			globalPlayer.player?.currentTime !== -1
		) {
			handlePlayPause()
		} else if (protocolClient && mediaCID) {
			globalPlayerLoad(mediaCID, mimeType)
		}
	}

	return (
		<AudioWrapperPriv isMine={props.isMine} onLongPress={props.onLongPress}>
			<View
				style={[
					styles.content,
					{
						backgroundColor: colors['background-header'],
						width: windowWidth - 100,
					},
					border.radius.big,
					props.isHighlight && {
						...styles.highlightContent,
						borderColor: colors['background-header'],
						shadowColor: colors.shadow,
					},
				]}
			>
				<TouchableOpacity
					onPress={onPress}
					disabled={loading}
					style={[
						padding.left.scale(10),
						border.radius.small,
						margin.left.small,
						margin.right.tiny,
						styles.button,
					]}
				>
					<View
						style={[
							padding.scale(7),
							isCurrent ? border.radius.scale(10) : border.radius.scale(12),
							{
								backgroundColor: `${colors['main-background']}80`,
								borderWidth: 1,
								borderColor: '#0000',
							},
							isCurrent && {
								borderColor: `${colors['reverted-main-text']}50`,
							},
						]}
					>
						{loading ? (
							<ActivityIndicator color={colors['reverted-main-text']} size={16} />
						) : (
							<Icon
								name={isPlaying ? 'pause' : 'play'}
								fill={colors['reverted-main-text']}
								height={16}
								width={16}
								pack='custom'
							/>
						)}
					</View>
				</TouchableOpacity>
				<AudioPreviewPriv media={props.medias[0]} currentTime={isCurrent ? currentTime : 0} />
			</View>
		</AudioWrapperPriv>
	)
}

const styles = StyleSheet.create({
	content: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 50,
		maxWidth: 400,
		flexDirection: 'row',
	},
	highlightContent: {
		borderWidth: 1,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.44,
		shadowRadius: 10.32,
		elevation: 16,
	},
	button: {
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
