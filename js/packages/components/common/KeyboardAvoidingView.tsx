import React from 'react'
import { KeyboardAvoidingView as KeyboardAvoiding, KeyboardAvoidingViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMusicPlayer } from '@berty-tech/music-player'
import { HEIGHT_OF_PLAYER, MARGIN_FIX } from './StickyMusicPlayer'
export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = (props) => {
	const { top } = useSafeAreaInsets()
	const {
		player: { player },
	} = useMusicPlayer()

	return (
		<KeyboardAvoiding
			{...props}
			keyboardVerticalOffset={player ? HEIGHT_OF_PLAYER - top + MARGIN_FIX : 0}
		/>
	)
}
