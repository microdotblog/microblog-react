import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from '../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class UpdatePostButton extends React.Component {

  render() {
    const { posting } = Auth.selected_user
    return (
      <Button
        title={posting.is_scheduled() ? "Schedule" : "Update"}
        color={App.theme_accent_color()}
				onPress={async() => {
					const sent = await Auth.selected_user.posting.send_update_post()
          if (sent) {
						Keyboard.dismiss()
            App.go_back()
					}
        }}
      />
    )
  }

}
