import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from '../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class UpdatePostButton extends React.Component {

  render() {
    const { post_status } = Auth.selected_user?.posting;
    return (
      <Button
        /* title={post_status == "draft" ? "Update" : "Publish"} */
        title="Update"
        color={App.theme_accent_color()}
				onPress={async() => {
					const sent = await Auth.selected_user.posting.send_update_post()
          if (sent) {
            Auth.selected_user.posting.clear_post()
						Keyboard.dismiss()
						Auth.selected_user.posting.selected_service.update_posts_for_active_destination()
            App.go_back()
					}
        }}
      />
    )
  }

}