import { NativeModules } from 'react-native'

const { CoreModule } = NativeModules

export class Notifier {
  /*
   * Notify user via system notification service
   */
  static system(args = {}) {
    const { title = '', body = '', icon, sound, url } = args
    CoreModule.displayNotification(title, body, icon, sound, url)
  }

  /*
   * Notify user via internal app notification service
   */
  static internal() {
    console.warn('Notifier.internal not implemented')
  }
}
export default Notifier
