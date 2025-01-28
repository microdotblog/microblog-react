import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, Text } from 'react-native';
import App from '../../stores/App'

@observer
export default class MutingScreen extends React.Component{
	
  render() {
    return(
			<ScrollView centerContent={true} style={{ flex: 1, padding: 15, backgroundColor: App.theme_background_color() }}>
				<Text>Muting</Text>
      </ScrollView>
    )
  }
  
}
