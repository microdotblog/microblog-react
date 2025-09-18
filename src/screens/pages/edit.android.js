import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardStickyView } from "react-native-keyboard-controller";
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import PostToolbar from '../../components/keyboard/post_toolbar';
import LoadingComponent from '../../components/generic/loading';

@observer
export default class PageEditScreen extends React.Component{
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <KeyboardAvoidingView behavior='height' keyboardVerticalOffset={125}>
          {
            posting.should_show_title() ?
            <TextInput
              placeholder="Title"
              placeholderTextColor={App.theme_placeholder_text_color()}
              style={{
                fontSize: 18,
                justifyContent: 'flex-start',
  						  alignItems: 'flex-start',
                padding: 8,
                marginBottom: 4,
                fontWeight: '700',
                borderColor: App.theme_border_color(),
                borderBottomWidth: .5,
                color: App.theme_text_color()
              }}
              editable={!posting.is_sending_post}
              multiline={false}
              scrollEnabled={false}
              returnKeyType={'default'}
   					  keyboardType={'default'}
   					  autoFocus={false}
   					  autoCorrect={true}
   					  clearButtonMode={'while-editing'}
   					  enablesReturnKeyAutomatically={true}
   					  underlineColorAndroid={'transparent'}
              value={posting.post_title}
              onChangeText={(text) => !posting.is_sending_post ? posting.set_post_title(text) : null}
            />
            : null
          }
          <TextInput
            placeholderTextColor="lightgrey"
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 3,
              padding: 8,
              color: App.theme_text_color(),
              paddingBottom: posting.post_assets?.length > 0 ? 90 : 50,
            }}
            editable={!posting.is_sending_post}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={true}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={posting.post_text}
            onChangeText={(text) => !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              posting.set_text_selection(selection)
            }}
          />
          <LoadingComponent should_show={posting.is_sending_post && posting.post_text != ""} />
        </KeyboardAvoidingView>
        <KeyboardStickyView>
          <PostToolbar componentId={this.props.componentId} is_post_edit hide_count hide_settings />
        </KeyboardStickyView>
      </View>
    )
  }
  
}
