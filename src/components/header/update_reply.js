import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from './../../stores/App';
import Replies from './../../stores/Replies';

@observer
export default class UpdateReplyButton extends React.Component {

  render() {
    return (
      <Button
        title="Update"
        color={App.theme_accent_color()}
				onPress={async() => {
          const sent = await Replies.selected_reply.update_reply()
					console.log("Replies:update_reply", sent)
					if (sent) {
						Keyboard.dismiss()
						App.go_back()
					}
        }}
      />
    )
  }

}