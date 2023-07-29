import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import { Navigation } from 'react-native-navigation';

@observer
export default class HighlightsScreen extends React.Component{
  
  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }
  
  componentDidAppear(){
    if(Auth.is_logged_in() && Auth.selected_user != null){
      Auth.selected_user.fetch_highlights()
    }
  }

  render() {
    return (
      <ScrollView>
        <Text>Highlights</Text>
      </ScrollView>
    )
  }

}
