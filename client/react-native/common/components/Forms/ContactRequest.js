import React from 'react'
import { TextInput, View, Button, Alert, StyleSheet } from 'react-native'
import { commit } from '../../relay'
import { Flex, Text } from '../Library'
import { mutations } from '../../graphql'

const fields = {
  id: '',
  email: '',
  phone: '',
}

const handleRequestButton = () => {
  let body = `
    Contact request sent:
    Berty ID = ${fields['id']}
    Email Adress = ${fields['email']}
    Phone number = ${fields['phone']}
  `
  console.log(body)
  Alert.alert(
    'Request',
    body,
    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
    { cancelable: false }
  )
  commit(mutations.ContactRequest, { id: fields['id'] })
}

export const Input = props => (
  <View>
    <Text bold>{props.label}</Text>
    <TextInput
      onChangeText={text => {
        fields[props.state] = text
      }}
      style={styles.input}
      placeholder={props.placeholder}
      textContentType={props.type}
    />
  </View>
)

export const ContactRequest = () => (
  <Flex.Grid>
    <Input
      label='Berty ID'
      placeholder='Please enter a Berty ID ...'
      type='username'
      state='id'
    />
    <Input
      label='Email address'
      placeholder='Please enter an email address ...'
      type='emailAddress'
      state='email'
    />
    <Input
      label='Phone number'
      placeholder='Please enter a phone number ...'
      type='telephoneNumber'
      state='phone'
    />
    <Button title='Request' onPress={handleRequestButton} />
  </Flex.Grid>
)

export default ContactRequest

const styles = StyleSheet.create({
  contactView: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    width: 350,
    height: 30,
    fontSize: 20,
    marginTop: 5,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
