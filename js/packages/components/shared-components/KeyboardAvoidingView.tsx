import React, { useState } from 'react'
import {
	KeyboardAvoidingView as KeyboardAvoiding,
	KeyboardAvoidingViewProps,
	Platform,
	StatusBar,
} from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'

import { useMusicPlayer } from '@berty-tech/music-player'

import { HEIGHT_OF_PLAYER } from './StickyMusicPlayer'
import { useStyles } from '@berty-tech/styles'

interface CustomKeyboardAvoidingViewProps extends KeyboardAvoidingViewProps {
	bottomFixedViewPadding?: number
}

export const KeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({
	bottomFixedViewPadding = 0,
	...props
}) => {
	const {
		player: { player },
	} = useMusicPlayer()
	const [{}, { scaleHeight }] = useStyles()
	const headerHeight = useHeaderHeight()

	const [initialMode] = useState(!!player)

	const defaultAndroidStatusBarHeight = 24
	let offset = (headerHeight + bottomFixedViewPadding) * scaleHeight

	if (
		Platform.OS === 'android' &&
		StatusBar.currentHeight &&
		StatusBar.currentHeight > defaultAndroidStatusBarHeight
	) {
		offset += StatusBar.currentHeight - defaultAndroidStatusBarHeight
	}

	if (Platform.OS === 'android' && initialMode !== !!player) {
		if (player) {
			offset += HEIGHT_OF_PLAYER * 2
		} else {
			offset -= HEIGHT_OF_PLAYER
		}
	} else if (player) {
		offset += HEIGHT_OF_PLAYER
	}

	return <KeyboardAvoiding {...props} keyboardVerticalOffset={offset} />
}
