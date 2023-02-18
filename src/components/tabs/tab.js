import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text } from 'react-native';
import App from '../../stores/App';

@observer
export default class Tab extends React.Component{
  
  render() {
    return(
      <TouchableOpacity style={{ width: 40, height: 40 }}
        onPress={() => App.navigate_to_tab_index(this.props.tab_index)}
      >
        <Text>{this.props.tab_index}</Text>
      </TouchableOpacity>
    )
  }
  
}