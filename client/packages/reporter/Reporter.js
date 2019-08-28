import { Platform } from 'react-native'

const Reporter = {
  menu: () => console.warn(`Reporter.menu not implemented on ${Platform.OS}`),
  feedback: () =>
    console.warn(`Reporter.feedback not implemented on ${Platform.OS}`),
  question: () =>
    console.warn(`Reporter.question not implemented on ${Platform.OS}`),
  bug: () => console.warn(`Reporter.bug not implemented on ${Platform.OS}`),
  crash: () => console.warn(`Reporter.crash not implemented ${Platform.OS}`),
}

export default Reporter
