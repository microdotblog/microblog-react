import * as React from 'react'
import { observer } from 'mobx-react'
import { Button, Keyboard } from 'react-native'
import App from './../../stores/App'
import Auth from '../../stores/Auth'

@observer
export default class PostButton extends React.Component {

  wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  render() {
    const { post_status } = Auth.selected_user?.posting
    return (
      <Button
        title={post_status === "draft" ? "Save" : "Post"}
        color={App.theme_accent_color()}
        onPress={async () => {
          Keyboard.dismiss()
          const sent = await Auth.selected_user.posting.send_post()
          if (sent) {
            await this.wait(500)
            App.go_back()
          }
        }}
      />
    )
  }

}
