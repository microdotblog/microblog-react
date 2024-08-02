import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Alert } from 'react-native';
import App from './../../stores/App';
import Auth from '../../stores/Auth';
import { StackActions } from '@react-navigation/native';

@observer
export default class RemoveImageButton extends React.Component {

	_handle_image_remove = () => {
		const { posting } = Auth.selected_user
		const { asset, index } = this.props;
    const existing_index = posting.post_assets?.findIndex(file => file.uri === asset.uri)
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
                posting.remove_asset(index)
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