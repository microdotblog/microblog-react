import { Navigation } from "react-native-navigation";
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
import PostingScreen from "./posts/new";
import DiscoverTopicScreen from "./discover/topic";
import PostingOptionsScreen from "./posts/options";
import ReplyScreen from "./conversation/reply";
import BookmarkScreen from "./bookmarks/bookmark";
import AddBookmarkScreen from "./bookmarks/add_bookmark";
import HelpScreen from "./help/help";
import ImageOptionsScreen from "./posts/image_options";
import ImageCropScreen from "./posts/image_crop";
import RepliesScreen from "./replies/replies";
import ReplyEditScreen from "./replies/edit";
import SettingsScreen from "./settings/settings";
import PostsScreen from "./posts/posts";
import EditPostScreen from "./posts/edit";
import PagesScreen from "./pages/pages"
import EditPageScreen from "./pages/edit"
import UploadsScreen from "./uploads/uploads";
import PostOptionsSettingsScreen from "./settings/post_options";

export const TIMELINE_SCREEN = 'microblog.TimelineScreen';
export const MENTIONS_SCREEN = 'microblog.MentionsScreen';
export const DISCOVER_SCREEN = 'microblog.DiscoverScreen';
export const LOGIN_SCREEN = 'microblog.modal.LoginScreen';
export const PROFILE_SCREEN = 'microblog.ProfileScreen';
export const CONVERSATION_SCREEN = 'microblog.ConversationScreen';
export const BOOKMARKS_SCREEN = 'microblog.BookmarksScreen';
export const FOLLOWING_SCREEN = 'microblog.FollowingScreen';
export const POSTING_STACK = 'microblog.modal.PostingStack';
export const POSTING_SCREEN = 'microblog.modal.PostingScreen';
export const DISCOVER_TOPIC_SCREEN = 'microblog.DiscoverTopicScreen';
export const POSTING_OPTIONS_SCREEN = 'microblog.modal.PostingOptionsScreen';
export const REPLY_SCREEN = 'microblog.modal.ReplyScreen';
export const BOOKMARK_SCREEN = 'microblog.BookmarkScreen';
export const ADD_BOOKMARK_SCREEN = 'microblog.modal.AddBookmarkScreen';
export const HELP_SCREEN = 'microblog.modal.HelpScreen';
export const IMAGE_OPTIONS_SCREEN = 'microblog.modal.ImageOptionsScreen';
export const IMAGE_CROP_SCREEN = 'microblog.modal.ImageCropScreen';
export const REPLIES_SCREEN = 'micrblog.RepliesScreen';
export const REPLY_EDIT_SCREEN = 'microblog.ReplyEditScreen';
export const SETTINGS_SCREEN = 'microblog.modal.SettingsScreen';
export const POSTS_SCREEN = 'microblog.PostsScreen';
export const EDIT_POST_SCREEN = 'microblog.EditPostScreen';
export const PAGES_SCREEN = 'microblog.PagesScreen';
export const EDIT_PAGE_SCREEN = 'microblog.EditPageScreen';
export const UPLOADS_SCREEN = 'microblog.UploadsScreen';
export const POST_OPTIONS_SETTINGS_SCREEN = 'microblog.modal.PostOptionsSettingsScreen';

// COMPONENTS
import ProfileImage from './../components/header/profile_image';
import NewPostButton from './../components/header/new_post';
import ScreenTitle from "../components/header/screen_title";
import RefreshActivity from "../components/header/refresh_activity";
import Tab from "../components/tabs/tab";
import NewUploadButton from "../components/header/new_upload";

export const PROFILE_IMAGE = 'microblog.component.ProfileImage'
export const NEW_POST_BUTTON = 'microblog.component.NewPostButton'
export const SCREEN_TITLE = 'microblog.component.ScreenTitle'
export const REFRESH_ACTIVITY = 'microblog.component.RefreshActivity'
export const TAB = 'microblog.component.tab'
export const NEW_UPLOAD_BUTTON = 'microblog.component.NewUploadButton'

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
import TagmojiMenu from "../components/sheets/tagmoji";
import PostsDestinationMenu from "../components/sheets/posts_destination";
registerSheet("main_sheet", SheetMenu);
registerSheet("profile_more_menu", ProfileMoreMenu);
registerSheet("tagmoji_menu", TagmojiMenu);
registerSheet("posts_destination_menu", PostsDestinationMenu);

import Push from "../stores/Push"
import { theme_options } from "../utils/navigation"
import App from "../stores/App"
import Auth from "../stores/Auth"
import Services from "../stores/Services"

// Set up screens & components
export const Screens = {
  [ TIMELINE_SCREEN ]: TimelineScreen,
  [ MENTIONS_SCREEN ]: MentionsScreen,
  [ DISCOVER_SCREEN ]: DiscoverScreen,
  [ LOGIN_SCREEN ]: LoginScreen,
  [ PROFILE_SCREEN ]: ProfileScreen,
  [ CONVERSATION_SCREEN ]: ConversationScreen,
  [ BOOKMARKS_SCREEN ]: BookmarksScreen,
  [ FOLLOWING_SCREEN ]: FollowingScreen,
  [ POSTING_SCREEN ]: PostingScreen,
  [ DISCOVER_TOPIC_SCREEN ]: DiscoverTopicScreen,
  [ POSTING_OPTIONS_SCREEN ]: PostingOptionsScreen,
  [ REPLY_SCREEN ]: ReplyScreen,
  [ BOOKMARK_SCREEN ]: BookmarkScreen,
  [ ADD_BOOKMARK_SCREEN ]: AddBookmarkScreen,
  [ HELP_SCREEN ]: HelpScreen,
  [ IMAGE_OPTIONS_SCREEN ]: ImageOptionsScreen,
  [ IMAGE_CROP_SCREEN ]: ImageCropScreen,
  [ REPLIES_SCREEN ]: RepliesScreen,
  [ REPLY_EDIT_SCREEN ]: ReplyEditScreen,
  [ SETTINGS_SCREEN ]: SettingsScreen,
  [ POSTS_SCREEN ]: PostsScreen,
  [ EDIT_POST_SCREEN ]: EditPostScreen,
  [ PAGES_SCREEN ]: PagesScreen,
  [ EDIT_PAGE_SCREEN ]: EditPageScreen,
  [ UPLOADS_SCREEN ]: UploadsScreen,
  [ POST_OPTIONS_SETTINGS_SCREEN ]: PostOptionsSettingsScreen,
  // COMPONENTS
  [ PROFILE_IMAGE ]: ProfileImage,
  [ NEW_POST_BUTTON ]: NewPostButton,
  [ SCREEN_TITLE ]: ScreenTitle,
  [ REFRESH_ACTIVITY ]: RefreshActivity,
  [ TAB ]: Tab,
  [ NEW_UPLOAD_BUTTON ]: NewUploadButton,
}

export const startApp = () => {

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
  const { post_status } = Auth.selected_user?.posting
  return Navigation.showModal({
    stack: {
      id: POSTING_STACK,
      name: POSTING_STACK,
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
							    text: post_status === "draft" ? "Save" : "Post",
                  color: '#f80'
                },
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
    return SheetManager.show("tagmoji_menu")
  }
  SheetManager.hide("tagmoji_menu")
}

export const discoverTopicScreen = (topic, component_id) => {
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
  const options = {
    component: {
      id: POSTING_OPTIONS_SCREEN,
			name: POSTING_OPTIONS_SCREEN,
			options: {
				topBar: {
					title: {
            text: "Posting Options"
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

export const imageCropScreen = async (asset, component_id) => {
  console.log("Screens:imageCropScreen");
  
  const new_asset = await asset.save_to_temp()
  
  const options = {
    component: {
      id: IMAGE_CROP_SCREEN,
      name: IMAGE_CROP_SCREEN,
      passProps: {
        asset: new_asset
      },
      options: {
        topBar: {
          title: {
            text: "Photo"
          },
          rightButtons: [
            {
              id: 'add_image_button',
              text: 'Add Photo',
              color: App.theme_accent_color()
            }
          ]
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
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "replies"
                }
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

export const settingsScreen = () => {
  return Navigation.showModal({
    stack: {
      id: SETTINGS_SCREEN,
      name: SETTINGS_SCREEN,
      children: [ {
        component: {
          id: SETTINGS_SCREEN,
          name: SETTINGS_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Settings',
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

export const postsScreen = (component_id) => {
  const options = {
    component: {
      id: POSTS_SCREEN,
      name: POSTS_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Posts"
          },
          rightButtons: [
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "posts"
                }
              }
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const postsDestinationBottomSheet = (close = false, type = null) => {
  if(!close){
    return SheetManager.show("posts_destination_menu", {
      payload: { type: type }
    })
  }
  SheetManager.hide("posts_destination_menu")
}

export const editPostScreen = (post) => {
  Auth.selected_user?.posting.hydrate_post_edit(post)
  return Navigation.showModal({
    stack: {
      id: EDIT_POST_SCREEN,
      name: EDIT_POST_SCREEN,
      children: [ {
        component: {
          id: EDIT_POST_SCREEN,
          name: EDIT_POST_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Edit Post',
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
                  color: '#f80'
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

export const pagesScreen = (component_id) => {
  const options = {
    component: {
      id: PAGES_SCREEN,
      name: PAGES_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Pages"
          },
          rightButtons: [
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "pages"
                }
              }
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const editPageScreen = (page) => {
  Auth.selected_user?.posting.hydrate_page_edit(page)
  return Navigation.showModal({
    stack: {
      id: EDIT_PAGE_SCREEN,
      name: EDIT_PAGE_SCREEN,
      children: [ {
        component: {
          id: EDIT_PAGE_SCREEN,
          name: EDIT_PAGE_SCREEN,
          options: {
            topBar: {
              title: {
                text: 'Edit Page',
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
                  color: '#f80'
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

export const uploadsScreen = (component_id) => {
  const options = {
    component: {
      id: UPLOADS_SCREEN,
      name: UPLOADS_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Uploads"
          },
          rightButtons: [
            {
              id: 'upload_button',
              text: 'upload',
              component: {
                name: NEW_UPLOAD_BUTTON
              }
            },
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "uploads"
                }
              }
            }
          ]
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}

export const postOptionsSettingsScreen = (user, component_id) => {
  console.log("Screens:postOptionsSettingsScreen", user, component_id);
  const options = {
    component: {
      id: POST_OPTIONS_SETTINGS_SCREEN,
      name: POST_OPTIONS_SETTINGS_SCREEN,
      passProps: {
        user: user
      },
      options: {
        topBar: {
          title: {
            text: "Post Options"
          },
        }
      }
    }
  };

  return Navigation.push(component_id, options);
}