import React from 'react'
import GenericList from './GenericList'

const Mutuals = (props) => <GenericList onPress={() => props.navigation.navigate('contacts/add')} filter={{}} {...props} />

export default Mutuals
