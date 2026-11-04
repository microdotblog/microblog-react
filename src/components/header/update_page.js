import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from '../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class UpdatePageButton extends React.Component {

  render() {
    return (
      <Button
        title="Update"
        color={App.theme_accent_color()}
        disabled={Auth.selected_user.posting.is_sending_post}
				onPress={async() => {
					const sent = await Auth.selected_user.posting.send_update_post()
          if (sent) {
						Keyboard.dismiss()
						Auth.selected_user.posting.selected_service.update_pages_for_active_destination()
            App.go_back()
					}
        }}
      />
    )
  }

}
