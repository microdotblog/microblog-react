import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import LoginMessage from '../info/login_message';
import ImageModalModule from '../images/image_modal';
import WebViewModule from '../web/webview_module';

@observer
export default class GenericScreenComponent extends React.Component{

  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          this.props.can_show_web_view != null && this.props.can_show_web_view ?
            <>
              {this.props.children}
              <WebViewModule loading_text={this.props.loading_text} endpoint={this.props.endpoint} component_id={this.props.component_id} />
            </>
          :
          <LoginMessage title={this.props.title} />
        }
        <ImageModalModule />
      </View>
    )
  }

}
