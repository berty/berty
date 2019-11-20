import React, { useState } from 'react'
import { SafeAreaView, View, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { RequestProps, UserProps } from '../shared-props/User'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { TabBar } from '../shared-components/TabBar'

//
// Settings My Berty ID Vue
//

// Style
const _stylesBertyId = StyleSheet.create({
	bertyLayout: { height: '95%' },
	bertyId: { width: '90%', height: '70%', marginTop: 70 },
	bertyIdContent: { height: 300 },
	bertyIdAvatar: { bottom: 50 },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2 },
	bertyIdPaddingButton: { marginRight: 60, bottom: 30 },
})

const BertyIdHeader: React.FC<{}> = () => (
	<View style={[styles.padding, styles.margin, styles.spaceBetween, styles.row, styles.alignItems]}>
		<Text style={[styles.textWhite]} category='h3'>
			My Berty ID
		</Text>
		<Icon name='person' width={50} height={50} fill={colors.white} />
	</View>
)

const BertyIdAvatar: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.marginBottom]}>
		<CircleAvatar style={styles.centerItems} avatarUri={avatarUri} />
		<View style={[styles.center]}>
			<Text style={styles.paddingTop} category='s1'>
				{name}
			</Text>
		</View>
	</View>
)

const BertyIdContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginLeft, styles.bigMarginRight, styles.paddingBottom]}>
		<TabBar tabType='contact' />
		<View
			style={[
				styles.bigMarginTop,
				styles.margin,
				styles.justifyContent,
				styles.test,
				_stylesBertyId.bertyIdContent,
			]}
		>
			<Text style={styles.center}>Yo</Text>
		</View>
	</View>
)

const BertIdBody: React.FC<RequestProps> = ({ user }) => (
	<View style={[_stylesBertyId.bertyId, styles.bgWhite, styles.borderRadius, styles.center]}>
		<View style={[_stylesBertyId.bertyIdAvatar]}>
			<BertyIdAvatar {...user} />
			<BertyIdContent />
		</View>
	</View>
)

const BertyIdShare: React.FC<{}> = () => (
	<TouchableOpacity
		style={[
			_stylesBertyId.bertyIdButton,
			_stylesBertyId.bertyIdPaddingButton,
			styles.end,
			styles.bgLightBlue,
			styles.shadow,
		]}
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
	<Layout style={[styles.flex, styles.bgBlue]}>
		<SafeAreaView>
			{/* Draggable Container */}
			<View style={[styles.bgBlue, _stylesBertyId.bertyLayout]}>
				<BertyIdHeader />
				<BertIdBody user={user} />
				<BertyIdShare />
			</View>
			{/* */}
		</SafeAreaView>
	</Layout>
)
