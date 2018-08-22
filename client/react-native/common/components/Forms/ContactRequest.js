import React, { Component } from 'react'
import {
  TextInput,
  Text,
  View,
  Button,
  Alert,
  StyleSheet
} from 'react-native'

var fields = {
  id: '',
  email: '',
  phone: ''
}

export default class ContactRequest extends Component {
  render = () => {
    return (
      <View style={styles.contactView}>
        <Input label='Berty ID' placeholder='Please enter a Berty ID ...' type='username' state='id' />
        <Input label='Email address' placeholder='Please enter an email address ...'  type='emailAddress' state='email' />
        <Input label='Phone number' placeholder='Please enter a phone number ...'  type='telephoneNumber' state='phone' />
        <Button
          title='Request'
          onPress={handleRequestButton}
        />
      </View>
    )
  }
}

class Input extends Component {
  render = () => {
    return (
      <View>
        <Text
          style={styles.label}
        >
          {this.props.label}
        </Text>
        <TextInput
          onChangeText={(text) => { fields[this.props.state] = text }}
          style={styles.input}
          placeholder={this.props.placeholder}
          textContentType={this.props.type}
        />
      </View>
    )
  }
}

function handleRequestButton () {
  let body =
  `
    Contact request sent:
    Berty ID = ${fields['id']}
    Email Adress = ${fields['email']}
    Phone number = ${fields['phone']}
  `
  console.log(body)
  Alert.alert(
    'Request',
    body,
    [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ],
    { cancelable: false }
  )
}

const styles = StyleSheet.create({
  contactView: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    width: 350,
    height: 30,
    fontSize: 20,
    marginTop: 5,
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  }
})
