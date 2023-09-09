import * as React from 'react';
import { View, RefreshControl, FlatList } from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { Navigation } from 'react-native-navigation';
import LoginMessage from '../../components/info/login_message'
import HighlightCell from '../../components/cells/highlight_cell';

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
  
  _key_extractor = (item) => item.id;
  
  render_highlight_item = ({ item }) => {
    return(
      <HighlightCell key={item.id} highlight={item} />
    )
  }
  
  _return_highlights_list = () => {
    const { bookmark_highlights } = Auth.selected_user
    return(
      <FlatList
        data={bookmark_highlights}
        extraData={bookmark_highlights?.length && !App.is_loading_highlights}
        keyExtractor={this._key_extractor}
        renderItem={this.render_highlight_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => Auth.selected_user.fetch_highlights()}
          />
        }
      />
    )
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
            this._return_highlights_list()
          :
          <LoginMessage title="Highlights" />
        }
      </View>
    )
  }

}
