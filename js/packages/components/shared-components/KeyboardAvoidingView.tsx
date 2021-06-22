import React, { useState } from 'react'
import {
	KeyboardAvoidingView as KeyboardAvoiding,
	KeyboardAvoidingViewProps,
	Platform,
	StatusBar,
} from 'react-native'

import { useMusicPlayer } from '@berty-tech/music-player'

import { HEIGHT_OF_PLAYER } from './StickyMusicPlayer'

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

	const [initialMode] = useState(!!player)

	const defaultAndroidStatusBarHeight = 24
	let offset = Platform.OS === 'android' ? bottomFixedViewPadding : 0

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
