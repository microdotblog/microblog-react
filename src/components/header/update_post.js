import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from '../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class UpdatePostButton extends React.Component {

  render() {
    const { posting } = Auth.selected_user
    const date_changed = Date.parse(posting.post_published) !== Date.parse(posting.original_post_published)
    return (
      <Button
        title={posting.is_scheduled() && date_changed ? "Schedule" : "Update"}
        color={App.theme_accent_color()}
        disabled={posting.is_sending_post}
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
