import React from 'react'
import {
	SafeAreaView,
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'

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
	bodyMarginTop: { marginTop: 60 },
	bodyContent: { marginBottom: 40, paddingTop: 50 },
	scrollViewMaxHeight: {
		maxHeight: 400,
	},
	contentMinHeight: {
		minHeight: 400,
	},
})

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
			<View style={[styles.bigPaddingLeft, styles.bigPaddingRight, _bertyIdStyles.bodyContent]}>
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

const Screen = Dimensions.get('window')

const MyBertyIdComponent: React.FC<RequestProps> = ({ user }) => (
	<View style={{ height: Screen.height }}>
		<BertIdBody user={user} />
		<BertyIdShare />
	</View>
)

export const MyBertyId: React.FC<RequestProps> = ({ user }) => {
	const firstNotToggledPoint = Screen.height - 100
	const firstToggledPoint = 50

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[styles.flex]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							title: 'My Berty ID',
							titleColor: colors.white,
							icon: 'person',
							iconColor: colors.white,
							bgColor: colors.blue,
							maxHeight: Screen.height - 90,
						},
					]}
				>
					<MyBertyIdComponent user={user} />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}
