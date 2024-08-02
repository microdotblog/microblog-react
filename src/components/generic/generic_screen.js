import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import LoginMessage from '../info/login_message';
import ImageModalModule from '../images/image_modal';
import WebViewModule from '../web/webview_module';
import App from '../../stores/App';

@observer
export default class GenericScreenComponent extends React.Component{

  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          this.props.can_show_web_view != null && this.props.can_show_web_view ?
            <>
              {this.props.children}
              <WebViewModule is_filtered={this.props.is_filtered} is_search={this.props.is_search} loading_text={this.props.loading_text} endpoint={this.props.endpoint} component_id={this.props.component_id} should_show_loading={this.props.shold_show_loading} />
            </>
          :
          !this.props.is_search && !this.props.is_filtered && !App.is_changing_font_scale && !App.is_loading_bookmarks && <LoginMessage title={this.props.title} />
        }
        <ImageModalModule />
      </View>
    )
  }

}
