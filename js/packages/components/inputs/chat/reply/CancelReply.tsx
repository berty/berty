import { Icon } from '@ui-kitten/components'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	removeActiveReplyInteraction,
	selectActiveReplyInteraction,
} from '@berty/redux/reducers/chatInputs.reducer'

import { ReplyMessageProps } from './interface'

export const CancelReply: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const dispatch = useAppDispatch()
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)
	return (
		<TouchableOpacity
			onPress={() => {
				dispatch(removeActiveReplyInteraction({ convPK }))
			}}
		>
			<Icon
				name='plus'
				height={18}
				width={18}
				fill={activeReplyInteraction?.textColor}
				style={{ marginTop: 2, transform: [{ rotate: '45deg' }] }}
			/>
		</TouchableOpacity>
	)
}
