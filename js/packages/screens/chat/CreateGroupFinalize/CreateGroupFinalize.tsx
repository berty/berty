import { Layout } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { CreateGroupMemberList } from '@berty/components'
import { bertyMethodsHooks, useAppDispatch, useAppSelector, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectInvitationListMembers } from '@berty/redux/reducers/groupCreationForm.reducer'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'

import { Content } from './components/Content'
import { Header } from './components/Header'

export const CreateGroupFinalize: ScreenFC<'Chat.CreateGroupFinalize'> = () => {
	const { reset } = useNavigation()
	const members = useAppSelector(selectInvitationListMembers)
	const dispatch = useAppDispatch()
	const colors = useThemeColor()
	const { call, error, done, reply, loading } = bertyMethodsHooks.useConversationCreate()

	React.useEffect(() => {
		if (!done) {
			return
		}

		if (error) {
			console.warn('Failed to create group:', error)
		} else if (reply?.publicKey) {
			reset({
				index: 0,
				routes: [
					{
						name: 'Chat.Home',
					},
					{
						name: 'Chat.MultiMember',
						params: {
							convId: reply.publicKey,
						},
					},
				],
			})
		}
	}, [done, error, reset, reply, dispatch])

	const createGroup = React.useCallback(
		groupName =>
			call({ displayName: groupName, contactsToInvite: members.map(m => m.publicKey) as any }),
		[members, call],
	)

	return (
		<Layout style={[{ backgroundColor: colors['background-header'] }, styles.container]}>
			<IOSOnlyKeyboardAvoidingView behavior='position'>
				<CreateGroupMemberList />
				<View style={styles.main}>
					<Header />
					<Content loading={loading} createGroup={createGroup} />
				</View>
			</IOSOnlyKeyboardAvoidingView>
		</Layout>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	main: {
		backgroundColor: 'white',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
})
