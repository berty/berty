import { PureComponent } from 'react'

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
  })
  render () {
    console.log(this.props)
    return null
  }
}
