import * as React from 'react'
import { observer } from 'mobx-react'
import { Button, Alert } from 'react-native'
import App from './../../stores/App'
import Auth from '../../stores/Auth'

@observer
export default class RemoveImageButton extends React.Component {

	_handle_image_remove = () => {
		const { posting } = Auth.selected_user
		const { asset_uri } = this.props
    const current_asset = posting.post_assets?.find(file => file.uri === asset_uri)
    if (!current_asset) {
      return
    }
    const existing_index = posting.post_assets?.findIndex(file => file.uri === current_asset.uri)
    if (existing_index > -1) {
      Alert.alert(
        "Remove upload?",
        "Are you sure you want to remove this upload from this post?",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Remove",
            onPress: () => {
              this.props.navigation.goBack()
              // delay, seems to create problems otherwise
							setTimeout(() => {
                posting.remove_asset(existing_index)
              }, 500);
            },
            style: 'destructive'
          },
        ],
        {cancelable: false},
      );
    }
  }

	render() {
    return (
      <Button
        title="Remove"
        color={App.theme_warning_text_color()}
				onPress={this._handle_image_remove}
      />
    )
  }

}
