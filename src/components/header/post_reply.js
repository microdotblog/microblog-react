import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from './../../stores/App';
import Reply from '../../stores/Reply';

@observer
export default class PostReplyButton extends React.Component {

  render() {
    return (
      <Button
        title="Post"
        color={App.theme_accent_color()}
				onPress={async() => {
          if(this.props.conversation_id != null && Reply.conversation_id != null){
						let sent = await Reply.send_reply()
						console.log("Reply:send_reply", sent)
						if (sent) {
							Keyboard.dismiss()
							App.go_back()
						}
          }
        }}
      />
    )
  }

}