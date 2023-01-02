import { Navigation } from "react-native-navigation";
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import * as React from 'react';
import { Platform } from 'react-native';
import { registerSheet, SheetManager } from "react-native-actions-sheet";
import Reply from '../stores/Reply';
import Replies from '../stores/Replies'

// SCREENS
import TimelineScreen from './timeline/timeline';
import MentionsScreen from './mentions/mentions';
import DiscoverScreen from './discover/discover';
import LoginScreen from './login/login';
import ProfileScreen from './profile/profile';
import ConversationScreen from "./conversation/conversation";
import BookmarksScreen from "./bookmarks/bookmarks";
import FollowingScreen from "./following/following";
import PostingScreen from "./posting/posting";
import DiscoverTopicScreen from "./discover/topic";
import PostingOptionsScreen from "./posting/options";
import ReplyScreen from "./conversation/reply";
import BookmarkScreen from "./bookmarks/bookmark";
import AddBookmarkScreen from "./bookmarks/add_bookmark";
import HelpScreen from "./help/help";
import ImageOptionsScreen from "./posting/image_options";
import RepliesScreen from "./replies/replies";
import ReplyEditScreen from "./replies/edit";

export const TIMELINE_SCREEN = 'microblog.TimelineScreen';
export const MENTIONS_SCREEN = 'microblog.MentionsScreen';
export const DISCOVER_SCREEN = 'microblog.DiscoverScreen';
export const LOGIN_SCREEN = 'microblog.modal.LoginScreen';
export const PROFILE_SCREEN = 'microblog.ProfileScreen';
export const CONVERSATION_SCREEN = 'microblog.ConversationScreen';
export const BOOKMARKS_SCREEN = 'microblog.BookmarksScreen';
export const FOLLOWING_SCREEN = 'microblog.FollowingScreen';
export const POSTING_SCREEN = 'microblog.modal.PostingScreen';
export const DISCOVER_TOPIC_SCREEN = 'microblog.DiscoverTopicScreen';
export const POSTING_OPTIONS_SCREEN = 'microblog.modal.PostingOptionsScreen';
export const REPLY_SCREEN = 'microblog.modal.ReplyScreen';
export const BOOKMARK_SCREEN = 'microblog.BookmarkScreen';
export const ADD_BOOKMARK_SCREEN = 'microblog.modal.AddBookmarkScreen';
export const HELP_SCREEN = 'microblog.modal.HelpScreen';
export const IMAGE_OPTIONS_SCREEN = 'microblog.modal.ImageOptionsScreen';
export const REPLIES_SCREEN = 'micrblog.RepliesScreen';
export const REPLY_EDIT_SCREEN = 'microblog.ReplyEditScreen';

// COMPONENTS
import ProfileImage from './../components/header/profile_image';
import NewPostButton from './../components/header/new_post';
import TagmojiMenu from "../components/sheets/tagmoji";
import ScreenTitle from "../components/header/screen_title";
import RefreshActivity from "../components/header/refresh_activity";
import SheetHeader from "../components/sheets/header";

export const PROFILE_IMAGE = 'microblog.component.ProfileImage'
export const NEW_POST_BUTTON = 'microblog.component.NewPostButton'
export const SCREEN_TITLE = 'microblog.component.ScreenTitle'
export const REFRESH_ACTIVITY = 'microblog.component.RefreshActivity'

// ICONS
import TimelineIcon from './../assets/icons/tab_bar/timeline.png';
import MentionsIcon from './../assets/icons/tab_bar/mentions.png';
import DiscoverIcon from './../assets/icons/tab_bar/discover.png';
import ArrowBackIcon from './../assets/icons/arrow_back.png';
import ReplyIcon from './../assets/icons/reply.png';
import BookmarksIcon from './../assets/icons/nav/bookmarks.png'

// SHEETS
import SheetMenu from './../components/sheets/menu';
import ProfileMoreMenu from "./../components/sheets/profile_more"
registerSheet("main_sheet", SheetMenu);
registerSheet("profile_more_menu", ProfileMoreMenu);

import Push from "../stores/Push"
import { theme_options } from "../utils/navigation"
import App from "../stores/App"

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);
Screens.set(MENTIONS_SCREEN, MentionsScreen);
Screens.set(DISCOVER_SCREEN, DiscoverScreen);
Screens.set(LOGIN_SCREEN, LoginScreen);
Screens.set(PROFILE_SCREEN, ProfileScreen);
Screens.set(CONVERSATION_SCREEN, ConversationScreen);
Screens.set(BOOKMARKS_SCREEN, BookmarksScreen);
Screens.set(FOLLOWING_SCREEN, FollowingScreen);
Screens.set(POSTING_SCREEN, PostingScreen);
Screens.set(DISCOVER_TOPIC_SCREEN, DiscoverTopicScreen);
Screens.set(POSTING_OPTIONS_SCREEN, PostingOptionsScreen);
Screens.set(REPLY_SCREEN, ReplyScreen);
Screens.set(BOOKMARK_SCREEN, BookmarkScreen);
Screens.set(ADD_BOOKMARK_SCREEN, AddBookmarkScreen);
Screens.set(HELP_SCREEN, HelpScreen)
Screens.set(IMAGE_OPTIONS_SCREEN, ImageOptionsScreen);
Screens.set(REPLIES_SCREEN, RepliesScreen);
Screens.set(REPLY_EDIT_SCREEN, ReplyEditScreen);

// SET UP COMPONENTS
Screens.set(PROFILE_IMAGE, ProfileImage)
Screens.set(NEW_POST_BUTTON, NewPostButton)
Screens.set(SCREEN_TITLE, ScreenTitle)
Screens.set(REFRESH_ACTIVITY, RefreshActivity)

export const startApp = () => {
  
  // INIT BOTTOMSHEET
  RNNBottomSheet.init()

  Navigation.setDefaultOptions(theme_options({}));

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: [
          timelineStackScreen(),
          mentionsStackScreen(),
          bookmarksStackScreen(),
          discoverStackScreen()
        ],
      }
    },
  });

}

export const timelineStackScreen = () =>{
  return {
    stack: {
      children: [{
        component: {
          id: TIMELINE_SCREEN,
          name: TIMELINE_SCREEN,
          options: {
            topBar: {
              title: {
                component: {
                  name: SCREEN_TITLE,
                  passProps: {
                    title: 'Timeline'
                  },
                },
                text: 'Timeline',
              },
              rightButtons: [
                {
                  id: 'post_button',
                  text: 'New',
                  component: {
                    name: NEW_POST_BUTTON
                  }
                }
              ],
              ...Platform.select({
                ios: {
                  leftButtons: [
                  {
                    id: 'profile_button',
                    text: 'Profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  }
                ],
                }
              })
            }
          }
        },
      }],
      options: {
        bottomTab: {
          text: 'Timeline',
          icon: Platform.OS === 'ios' ? { system: 'bubble.left.and.bubble.right' } : TimelineIcon
        },
      },
    },
  }
}

export const mentionsStackScreen = () =>{
  return {
    stack: {
      children: [{
        component: {
          id: MENTIONS_SCREEN,
          name: MENTIONS_SCREEN,
          options: {
            topBar: {
              title: {
                component: {
                  name: SCREEN_TITLE,
                  passProps: {
                    title: 'Mentions'
                  },
                },
                text: 'Mentions',
              },
              rightButtons: [
                {
                  id: 'post_button',
                  text: 'New',
                  component: {
                    name: NEW_POST_BUTTON
                  }
                }
              ],
              ...Platform.select({
                ios: {
                  leftButtons: [
                  {
                    id: 'profile_button',
                    text: 'Profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  }
                ],
                }
              })
            }
          }
        },
      }],
      options: {
        bottomTab: {
          text: 'Mentions',
          icon: Platform.OS === 'ios' ? { system: 'at' } : MentionsIcon
        },
      },
    },
  }
}

export const discoverStackScreen = () =>{
  return {
    stack: {
      children: [{
        component: {
          id: DISCOVER_SCREEN,
          name: DISCOVER_SCREEN,
          options: {
            topBar: {
              title: {
                component: {
                  name: SCREEN_TITLE,
                  passProps: {
                    title: 'Discover'
                  },
                },
                text: 'Discover',
              },
              rightButtons: [
                {
                  id: 'post_button',
                  text: 'New',
                  component: {
                    name: NEW_POST_BUTTON
                  }
                }
              ],
              ...Platform.select({
                ios: {
                  leftButtons: [
                  {
                    id: 'profile_button',
                    text: 'Profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  }
                ],
                }
              })
            }
          }
        },
      }],
      options: {
        bottomTab: {
          text: 'Discover',
          icon: Platform.OS === 'ios' ? { system: 'magnifyingglass' } : DiscoverIcon
        },
      },
    },
  }
}

export const bookmarksStackScreen = () =>{
  return {
    stack: {
      children: [{
        component: {
          id: BOOKMARKS_SCREEN,
          name: BOOKMARKS_SCREEN,
          options: {
            topBar: {
              title: {
                component: {
                  name: SCREEN_TITLE,
                  passProps: {
                    title: 'Bookmarks'
                  },
                },
                text: 'Bookmarks',
              },
              ...Platform.select({
                ios: {
                  leftButtons: [
                  {
                    id: 'profile_button',
                    text: 'Profile',
                    component: {
                      name: PROFILE_IMAGE
                    }
                  }
                ],
                }
              })
            }
          }
        },
      }],
      options: {
        bottomTab: {
          text: 'Bookmarks',
          icon: Platform.OS === 'ios' ? { system: 'star' } : BookmarksIcon
        },
      },
    },
  }
}

export const loginScreen = (can_dismiss = false) => {
  return Navigation.showModal({
    stack: {
      id: LOGIN_SCREEN,
      children: [ {
        component: {
          id: LOGIN_SCREEN,
          name: LOGIN_SCREEN,
          passProps: {
            can_dismiss: can_dismiss
          },
          options: {
            topBar: {
              title: {
                text: 'Sign in',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}

export const menuBottomSheet = (close = false) => {
  if(!close){
    return SheetManager.show("main_sheet")
  }
  SheetManager.hide("main_sheet")
}

export const profileScreen = (username, component_id, close_bottom_sheet = true) => {
  console.log("Screens:profileScreen", username, component_id);
  if (close_bottom_sheet) {
    menuBottomSheet(true)
  }
  const options = {
    component: {
			name: PROFILE_SCREEN,
			passProps: {
        username: username
			},
			options: {
				topBar: {
          title: {
            text: `@${username}`
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            }
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const conversationScreen = (conversation_id, component_id) => {
  console.log("Screens:conversationScreen", conversation_id, component_id);
  Reply.hydrate(conversation_id)
  Push.check_and_remove_notifications_with_post_id(conversation_id)
  if(App.current_screen_name === CONVERSATION_SCREEN ){
    Navigation.updateProps(component_id, {
      conversation_id: conversation_id
    })
  }
  else{
    const options = {
      component: {
        id: `CONVERSATION_SCREEN_${conversation_id}`,
        name: CONVERSATION_SCREEN,
        passProps: {
          conversation_id: conversation_id
        },
        options: {
          topBar: {
            title: {
              text: "Conversation"
            },
            rightButtons: Reply.replying_enabled() ? [
              {
                id: 'reply_button',
                text: 'Reply',
                icon: Platform.OS === 'ios' ? { system: 'arrowshape.turn.up.left.fill' } : ReplyIcon
              }
            ] : null,
          }
        }
      }
    };
    
    return Navigation.push(component_id, options);
  }
}

export const bookmarkScreen = (bookmark_id, component_id) => {
  console.log("Screens:bookmarkScreen", bookmark_id, component_id);
  const options = {
    component: {
      id: 'BOOKMARK_SCREEN',
      name: BOOKMARK_SCREEN,
      passProps: {
        bookmark_id: bookmark_id
			},
      options: {
        topBar: {
          title: {
            text: "Bookmark"
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
            {
              id: 'profile_button',
              text: 'profile',
              component: {
                name: PROFILE_IMAGE
              }
            }
          ],
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const followingScreen = (username, component_id) => {
  console.log("Screens:followingScreen", username, component_id);
  const options = {
    component: {
			name: FOLLOWING_SCREEN,
			passProps: {
        username: username
			},
			options: {
				topBar: {
          title: {
            text: `Following`
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            }
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const postingScreen = () => {
  return Navigation.showModal({
    stack: {
      id: POSTING_SCREEN,
      name: POSTING_SCREEN,
      children: [ {
        component: {
          id: POSTING_SCREEN,
          name: POSTING_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'New Post',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
						    {
							    id: 'post_button',
							    text: 'Post',
                  color: '#f80'
                },
                {
                  id: 'profile_button',
                  text: 'profile',
                  component: {
                    name: PROFILE_IMAGE
                  }
                }
					    ]
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}

export const tagmojiBottomSheet = (close = false) => {
  if(!close){
    return RNNBottomSheet.openBottomSheet({
      renderContent: () => <TagmojiMenu />,
      renderHeader: () => <SheetHeader title="Topics" /> ,
      snapPoints: [0, '20%', '40%', '90%'],
      initialSnapIndex: 2,
      borderRadius: 16,
      backgroundColor: App.theme_background_color_secondary()
    })
  }
  RNNBottomSheet.closeBottomSheet()
}

export const discoverTopicScreen = (topic, component_id) => {
  console.log("Screens:discoverTopicScreen", topic, component_id);
  const options = {
    component: {
      id: 'DISCOVER_TOPIC_SCREEN',
			name: DISCOVER_TOPIC_SCREEN,
			passProps: {
        topic_name: topic.name
			},
			options: {
				topBar: {
          title: {
            text: `${topic.emoji} ${topic.title}`
          },
          rightButtons: [
            {
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            }
          ],
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const postingOptionsScreen = (component_id) => {
  console.log("Screens:discoverTopicScreen", component_id);
  const options = {
    component: {
      id: POSTING_OPTIONS_SCREEN,
			name: POSTING_OPTIONS_SCREEN,
			options: {
				topBar: {
					title: {
            text: "Posting options & blogs"
          },
				}
			}
		}
	};

  return Navigation.push(component_id, options);
}

export const replyScreen = () => {
  return Navigation.showModal({
    stack: {
      id: REPLY_SCREEN,
      name: REPLY_SCREEN,
      children: [ {
        component: {
          id: REPLY_SCREEN,
          name: REPLY_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'New Reply',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
						    {
							    id: 'post_button',
							    text: 'Post',
                  color: '#f80'
                },
                {
                  id: 'profile_button',
                  text: 'profile',
                  component: {
                    name: PROFILE_IMAGE
                  }
                }
					    ]
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}

export const profileMoreBottomSheet = (username, close = false) => {
  if(!close){
    return SheetManager.show("profile_more_menu", {
      payload: {
        username: username
      }
    })
  }
  SheetManager.hide("profile_more_menu")
}

export const addBoomarkScreen = () => {
  return Navigation.showModal({
    stack: {
      id: ADD_BOOKMARK_SCREEN,
      name: ADD_BOOKMARK_SCREEN,
      children: [ {
        component: {
          id: ADD_BOOKMARK_SCREEN,
          name: ADD_BOOKMARK_SCREEN,          
          options: {
            topBar: {
              title: {
                text: 'Add bookmark',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
                {
                  id: 'profile_button',
                  text: 'profile',
                  component: {
                    name: PROFILE_IMAGE
                  }
                }
					    ]
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}

export const helpScreen = () => {
  return Navigation.showModal({
    stack: {
      id: HELP_SCREEN,
      name: HELP_SCREEN,
      children: [ {
        component: {
          id: HELP_SCREEN,
          name: HELP_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Help',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}

export const imageOptionsScreen = (image, index, component_id) => {
  console.log("Screens:imageOptionsScreen", image, index, component_id);
  const options = {
    component: {
      id: IMAGE_OPTIONS_SCREEN,
      name: IMAGE_OPTIONS_SCREEN,
      passProps: {
        image: image,
        index: index
      },
      options: {
        topBar: {
          title: {
            text: "Image options"
          },
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const repliesScreen = (component_id) => {
  Replies.hydrate()
  const options = {
    component: {
      id: REPLIES_SCREEN,
      name: REPLIES_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Replies"
          },
          rightButtons: [
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY
              }
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const replyEditScreen = () => {
  return Navigation.showModal({
    stack: {
      id: REPLY_EDIT_SCREEN,
      name: REPLY_EDIT_SCREEN,
      children: [ {
        component: {
          id: REPLY_EDIT_SCREEN,
          name: REPLY_EDIT_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Update Reply',
              },
              leftButtons: [
                {
                  id: 'back_button',
                  text: 'Back',
                  icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
                },
              ],
              rightButtons: [
                {
                  id: 'post_button',
                  text: 'Update',
                  color: App.theme_accent_color()
                }
              ]
            },
            layout: {
              backgroundColor: App.theme_background_color()
            }
          }
        },
      }],
    }
  });
}