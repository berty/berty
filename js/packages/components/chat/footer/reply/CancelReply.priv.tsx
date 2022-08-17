import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { useAppDispatch } from '@berty/hooks'
import { removeActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'

import { ReplyMessageProps, ActiveReplyInteractionProps } from './interface'

export const CancelReplyPriv: React.FC<ReplyMessageProps & ActiveReplyInteractionProps> = ({
	convPK,
	activeReplyInteraction,
}) => {
	const dispatch = useAppDispatch()

	return (
		<TouchableOpacity onPress={() => dispatch(removeActiveReplyInteraction({ convPK }))}>
			<Icon
				name='plus'
				height={18}
				width={18}
				fill={activeReplyInteraction?.textColor}
				style={styles.icon}
			/>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	icon: { marginTop: 2, transform: [{ rotate: '45deg' }] },
})
