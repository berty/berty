import { PureComponent } from 'react'
import { createStackNavigator } from 'react-navigation'

class Landing extends PureComponent {
  render = (props = this.props) => {
    console.log(props)
    return null
  }
}

export default createStackNavigator(
  {
    1: Landing,
    2: Landing,
    3: Landing,
    4: Landing,
  },
  { initialHomeName: '1' }
)
