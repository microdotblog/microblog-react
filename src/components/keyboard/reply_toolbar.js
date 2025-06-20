import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import App from '../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols'
import { SvgXml } from 'react-native-svg'

@observer
export default class ReplyToolbar extends React.Component{
  constructor(props) {
    super(props)
    this.state = { 
      showUserBar: false,
      showSearchBar: false,
      searchQuery: '',
      isSearching: false,
      userBarWasShowing: false
    }
  }

  handleShowUserBar = () => {
    this.setState({ showUserBar: true })
  }

  handleHideUserBar = () => {
    this.setState({ showUserBar: false })
  }

  handleToggleSearch = () => {
    if (!this.state.showSearchBar) {
      this.setState({ 
        showSearchBar: true,
        searchQuery: '',
        isSearching: false,
        showUserBar: true
      })
    } else {
      this.setState({ 
        showSearchBar: false,
        searchQuery: '',
        isSearching: false
      })
      App.clear_found_users()
    }
  }

  handleSearchQueryChange = async (text) => {
    this.setState({ searchQuery: text, isSearching: text.length >= 3 })
    if (text.length >= 3) {
      await App.check_usernames(`@${text}`)
      this.setState({ isSearching: false })
    } else {
      App.clear_found_users()
    }
  }

  handleSelectSearchUser = (username) => {
    const selectedUser = App.found_users.find(user => user.username === username)
    this.props.reply?.add_user_to_conversation(username, selectedUser?.avatar)
    this.props.reply?.add_mention(username)
    this.setState({ 
      showSearchBar: false,
      searchQuery: '',
      isSearching: false
    })
    App.clear_found_users()
  }

  handleClearSearch = () => {
    this.setState({ searchQuery: '', isSearching: false })
    App.clear_found_users()
  }

	render() {
    return(
      <View
        style={{
          width: '100%',
          backgroundColor: App.theme_section_background_color(),
          ...Platform.select({
            android: {
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
            }
          })
        }}
      >
        {this.state.showSearchBar && (
          <View style={{ width: '100%', backgroundColor: App.theme_section_background_color(), paddingVertical: Platform.OS === 'android' ? 4 : 6, borderBottomWidth: 1, borderColor: App.theme_border_color(), zIndex: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: App.theme_input_contrast_background_color(), borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS === 'android' ? 4 : 8 }}>
                <TextInput
                  placeholder="Search users..."
                  placeholderTextColor={App.theme_placeholder_alt_text_color()}
                  style={{ 
                    flex: 1, 
                    fontSize: 16, 
                    color: App.theme_text_color(),
                    ...Platform.select({
                      android: { height: 40 }
                    })
                  }}
                  value={this.state.searchQuery}
                  onChangeText={this.handleSearchQueryChange}
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {this.state.searchQuery.length > 0 && (
                  <TouchableOpacity onPress={this.handleClearSearch} style={{ marginLeft: 8 }}>
                    {Platform.OS === 'ios' ? (
                      <SFSymbol name={'xmark.circle.fill'} color={App.theme_text_color()} style={{ height: 18, width: 18 }} />
                    ) : (
                      <SvgXml
                        style={{ height: 18, width: 18 }}
                        color={App.theme_text_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>'
                      />
                    )}
                  </TouchableOpacity>
                )}
                {this.state.isSearching && (
                  <ActivityIndicator color={App.theme_accent_color()} size="small" style={{ marginLeft: 8 }} />
                )}
              </View>
              <TouchableOpacity onPress={this.handleToggleSearch} style={{ marginLeft: 8, padding: 4 }}>
                <Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
        {this.state.showUserBar && (
          <View style={{ width: '100%', backgroundColor: App.theme_section_background_color(), paddingVertical: 6, borderBottomWidth: 1, borderColor: App.theme_border_color(), zIndex: 2, position: 'relative' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
              {!(App.found_users.length > 0 && this.state.showSearchBar) && (
                <>
                  <TouchableOpacity onPress={this.handleToggleSearch} style={{ marginRight: 10, backgroundColor: App.theme_input_contrast_background_color(), borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {Platform.OS === 'ios' ? (
                      <SFSymbol name={'magnifyingglass'} color={App.theme_text_color()} style={{ height: 18, width: 18 }} />
                    ) : (
                      <SvgXml
                        style={{ height: 18, width: 18 }}
                        color={App.theme_text_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
                      />
                    )}
                  </TouchableOpacity>
                  {this.props.reply?.conversation_users.length > 1 && (
                    <TouchableOpacity onPress={() => this.props.reply?.reply_all()} style={{ marginRight: 10, backgroundColor: App.theme_input_contrast_background_color(), borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: App.theme_text_color(), fontWeight: '600', fontSize: 15 }}>Reply all</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              {(App.found_users.length > 0 && this.state.showSearchBar) ? (
                App.found_users.map(user => (
                  <TouchableOpacity 
                    key={user.username} 
                    onPress={() => this.handleSelectSearchUser(user.username)} 
                    style={{ 
                      marginRight: 10, 
                      backgroundColor: App.theme_input_contrast_background_color(), 
                      borderRadius: 8, 
                      paddingHorizontal: 8, 
                      paddingVertical: 6, 
                      minHeight: 32,
                      flexDirection: 'row', 
                      alignItems: 'center'
                    }}
                  >
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }} />
                    ) : (
                      <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6, backgroundColor: App.theme_border_color() }} />
                    )}
                    { Platform.OS === 'ios' ?
                      <SFSymbol name={'at'} color={App.theme_text_color()} style={{ height: 16, width: 16 }} />
                      :
                      <SvgXml style={{ height: 14, width: 14 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /></svg>' />
                    }
                    <Text style={{ 
                      color: App.theme_text_color(), 
                      fontWeight: '600', 
                      fontSize: 15,
                      ...Platform.select({
                        android: { 
                          textAlignVertical: 'center',
                          includeFontPadding: false,
                          lineHeight: 18
                        }
                      })
                    }}>{user.username}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                this.props.reply?.sorted_conversation_users().map(user => {
                  const isAlreadyMentioned = this.props.reply?.is_user_mentioned(user.username)
                  return (
                    <TouchableOpacity 
                      key={user.username} 
                      onPress={() => this.props.reply?.toggle_mention(user.username)} 
                      style={{ 
                        marginRight: 10, 
                        backgroundColor: isAlreadyMentioned ? App.theme_accent_color() : App.theme_input_contrast_background_color(), 
                        borderRadius: 8, 
                        paddingHorizontal: 8, 
                        paddingVertical: 6, 
                        minHeight: 32,
                        flexDirection: 'row', 
                        alignItems: 'center',
                        opacity: isAlreadyMentioned ? 0.8 : 1
                      }}
                    >
                      {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }} />
                      ) : (
                        <View style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6, backgroundColor: App.theme_border_color() }} />
                      )}
                      { Platform.OS === 'ios' ?
                        <SFSymbol name={'at'} color={isAlreadyMentioned ? '#fff' : App.theme_text_color()} style={{ height: 16, width: 16 }} />
                        :
                        <SvgXml style={{ height: 14, width: 14 }} color={isAlreadyMentioned ? '#fff' : App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /></svg>' />
                      }
                      <Text style={{ 
                        color: isAlreadyMentioned ? '#fff' : App.theme_text_color(), 
                        fontWeight: '600', 
                        fontSize: 15,
                        ...Platform.select({
                          android: { 
                            textAlignVertical: 'center',
                            includeFontPadding: false,
                            lineHeight: 18
                          }
                        })
                      }}>{user.username}</Text>
                    </TouchableOpacity>
                  )
                })
              )}
            </ScrollView>
          </View>
        )}
        <View
					style={{
						width: '100%',
						backgroundColor: App.theme_section_background_color(),
						padding: 5,
						minHeight: 40,
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => this.props.reply?.handle_text_action("**")}> 
            { Platform.OS === 'ios' ?
              <SFSymbol name={'bold'} color={App.theme_text_color()} style={{ height: 20, width: 20 }} />
              :
              <SvgXml style={{ height: 18, width: 18 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" /></svg>' />
            }
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => this.props.reply?.handle_text_action("_")}> 
            { Platform.OS === 'ios' ?
              <SFSymbol name={'italic'} color={App.theme_text_color()} style={{ height: 20, width: 20 }} />
              :
              <SvgXml style={{ height: 18, width: 18 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" /></svg>' />
            }
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => this.props.reply?.handle_text_action("[]")}> 
            { Platform.OS === 'ios' ?
              <SFSymbol name={'link'} color={App.theme_text_color()} style={{ height: 20, width: 20 }} multicolor={true} />
              :
              <SvgXml style={{ height: 18, width: 18 }} stroke={App.theme_button_text_color()} strokeWidth={2} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>' />
            }
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => this.setState({ showUserBar: !this.state.showUserBar })}>
            { Platform.OS === 'ios' ?
              <SFSymbol name={'at'} color={App.theme_text_color()} style={{ height: 20, width: 20 }} />
              :
              <SvgXml style={{ height: 18, width: 18 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /></svg>' />
            }
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              flexDirection: 'row',
              alignItems: 'center',
              top: this.props.reply?.reply_chars_offset ? this.props.reply.reply_chars_offset() : -24,
              right: 8,
              zIndex: 3
            }}
          >
            <Text
              style={{
                fontWeight: '400',
                padding: 2,
                color: App.theme_text_color(),
              }}
            ><Text style={{ color: this.props.reply?.reply_text_length() > App.max_characters_allowed ? '#a94442' : App.theme_text_color() }}>{this.props.reply?.reply_text_length()}</Text>/{App.max_characters_allowed}</Text>
          </View>
        </View>
      </View>
    )
  }
  
}
