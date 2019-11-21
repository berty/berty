import React from 'react'
import { SafeAreaView, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { RequestProps } from '../shared-props/User'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'

//
// Settings My Berty ID Vue
//

// Style
const _bertyIdStyles = StyleSheet.create({
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	bertyLayout: { borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2, marginRight: 60, bottom: 30 },
	bodyMarginTop: { marginTop: 90 / 2 },
	bodyContentMarginBottom: { marginBottom: 40 },
	scrollViewMaxHeight: {
		maxHeight: 300,
	},
	contentMinHeight: {
		minHeight: 300,
	},
})

const BertyIdHeader: React.FC<{}> = () => (
	<View>
		<View
			style={[
				styles.littleMarginTop,
				styles.center,
				styles.bgLightGrey,
				_bertyIdStyles.headerToggleBar,
				{ borderColor: colors.lightGrey },
			]}
		/>
		<View style={[styles.row, styles.padding, styles.spaceBetween, styles.alignItems]}>
			<Text style={[styles.fontFamily, styles.textWhite]} category='h4'>
				My Berty ID
			</Text>
			<Icon
				style={[styles.flex, styles.right]}
				name='person'
				width={40}
				height={40}
				fill={colors.white}
			/>
		</View>
	</View>
)

const BertyIdContent: React.FC<{}> = () => (
	<ScrollView
		style={[_bertyIdStyles.scrollViewMaxHeight]}
		contentContainerStyle={[styles.paddingVertical]}
	>
		<View style={[styles.justifyContent, styles.test, _bertyIdStyles.contentMinHeight]}>
			<Text style={styles.center}>Yo</Text>
		</View>
	</ScrollView>
)

const BertIdBody: React.FC<RequestProps> = ({ user }) => {
	return (
		<View
			style={[
				styles.bgWhite,
				styles.modalBorderRadius,
				styles.marginHorizontal,
				_bertyIdStyles.bodyMarginTop,
			]}
		>
			<RequestAvatar style={[styles.alignItems]} {...user} size={90} />
			<View
				style={[
					styles.bigPaddingLeft,
					styles.bigPaddingRight,
					_bertyIdStyles.bodyContentMarginBottom,
				]}
			>
				<TabBar tabType='contact' />
				<BertyIdContent />
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => (
	<TouchableOpacity
		style={[styles.end, styles.bgLightBlue, styles.shadow, _bertyIdStyles.bertyIdButton]}
	>
		<View style={[styles.flex, styles.spaceCenter]}>
			<Icon
				style={[styles.center]}
				name='share-outline'
				width={40}
				height={40}
				fill={colors.blue}
			/>
		</View>
	</TouchableOpacity>
)

export const MyBertyId: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex]}>
		<SafeAreaView>
			<View style={[styles.bgBlue, _bertyIdStyles.bertyLayout]}>
				<View style={[styles.absolute, styles.left, styles.right]}>
					<BertyIdHeader />
					<BertIdBody user={user} />
					<BertyIdShare />
				</View>
			</View>
		</SafeAreaView>
	</Layout>
)
