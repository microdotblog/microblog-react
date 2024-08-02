import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Keyboard } from 'react-native';
import App from './../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class PostButton extends React.Component {

	render() {
		const { post_status } = Auth.selected_user?.posting
    return (
      <Button
        title={post_status === "draft" ? "Save" : "Post"}
        color={App.theme_accent_color()}
				onPress={async () => {
					const sent = await Auth.selected_user.posting.send_post()
					if (sent) {
						Keyboard.dismiss()
						App.go_back()
					}
        }}
      />
    )
  }

}