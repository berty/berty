import ImagePicker from 'react-native-image-picker'
import { Alert, Platform } from 'react-native'

export let defaultOptions
export let choosePicture

if (['ios', 'android'].some(_ => _ === Platform.OS)) {
  defaultOptions = {
    title: 'Select a picture',
  }

  choosePicture = (options = defaultOptions) =>
    new Promise(resolve =>
      ImagePicker.showImagePicker(this.imagePickerOptions, response => {
        if (response.didCancel) {
          resolve({ uri: response.uri })
          return
        }
        if (response.error) {
          Alert.alert(
            'An unexpected error occured :(',
            response.error.toString()
          )
          console.error(response.error)
          return
        }
        if (response.customButton) {
          return
        }
        resolve({ uri: response.uri })
      })
    )
}

if (Platform.OS === 'web') {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  const fReader = new FileReader()
  choosePicture = event =>
    new Promise((resolve, reject) => {
      event.preventDefault()
      input.onchange = () => {
        fReader.readAsDataURL(input.files[0])
        fReader.onloadend = event => resolve({ uri: event.target.result })
      }
      input.click()
    })
}
