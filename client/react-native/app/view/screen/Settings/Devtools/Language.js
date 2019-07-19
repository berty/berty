import React, { PureComponent } from 'react'
import { Header, Menu } from '@berty/component'
import { withI18n } from 'react-i18next'
import { languages } from '@berty/common/locale'

class Language extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={'Language'}
        titleIcon="globe"
        backBtn
      />
    ),
  })

  render() {
    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          {Object.entries(languages).map(([k, v]) => (
            <Menu.Item
              icon={this.props.lng === k ? 'check-circle' : 'circle'}
              title={`${v.localName} - ${v.englishName}`}
              key={k}
              onPress={() => this.setLanguage(k)}
            />
          ))}
        </Menu.Section>
      </Menu>
    )
  }

  setLanguage(k) {
    this.props.i18n.changeLanguage(k)
  }
}

export default withI18n()(Language)
