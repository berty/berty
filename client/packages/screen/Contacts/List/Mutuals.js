import React from 'react'
import GenericList from './GenericList'

const Mutuals = props => {
  console.log('navigation', props.navigation)
  return (
    <GenericList
      {...props}
      onPress={() => props.navigation.navigate('contacts/add')}
      filter={{}}
    />
  )
}

export default Mutuals
