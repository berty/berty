import ImagePicker from 'react-native-image-picker'
import { Alert } from 'react-native'

export const defaultOptions = {
  title: 'Select a picture',
}

export const choosePicture = (options = defaultOptions) =>
  new Promise(resolve =>
    ImagePicker.showImagePicker(this.imagePickerOptions, response => {
      if (response.didCancel) {
        resolve({ uri: response.uri, data: response.data })
        return
      }
      if (response.error) {
        Alert.alert('An unexpected error occured :(', response.error.toString())
        console.error(response.error)
        return
      }
      if (response.customButton) {
        return
      }
      resolve({ uri: response.uri, data: response.data })
    })
  )
