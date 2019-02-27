import React from 'react'
import GenericList from './GenericList'

const Received = (props) => <GenericList onPress={() => props.navigation.navigate('contacts/add')} filter={{ filter: { status: 4 } }} {...props} ignoreMyself />

export default Received
