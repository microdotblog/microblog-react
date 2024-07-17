import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class ReplyButton extends React.Component {

  render() {
    return (
      <TouchableOpacity
				onPress={() => {
					if(this.props.conversation_id != null){
						App.navigate_to_screen("reply", this.props.conversation_id)
					}
				}}
			>
        {
          Platform.OS === 'ios' ?
            <SFSymbol
              name={'arrowshape.turn.up.left.fill'}
              color={App.theme_text_color()}
              style={{ height: 20, width: 20 }}
            />
            :
            <SvgXml
              style={{
                height: 24,
                width: 24
              }}
              color={App.theme_text_color()}
              xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"></path></svg>'
            />
        }
      </TouchableOpacity>
    )
  }

}