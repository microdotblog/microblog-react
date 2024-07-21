import { Navigation } from "react-native-navigation";
import * as React from 'react';
import { Platform } from 'react-native';
import { SheetManager } from "react-native-actions-sheet";
import Replies from '../stores/Replies'

// SCREENS
import FollowingScreen from "./following/following";
import PostingScreen from "./posts/new";
import DiscoverTopicScreen from "./discover/topic";
import PostingOptionsScreen from "./posts/options";
import ReplyScreen from "./conversation/reply";
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
import HighlightsScreen from "./bookmarks/highlights";
import ShareScreen from "./share";

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
export const UPLOADS_MODAL_SCREEN = 'microblog.modal.UploadsScreen';
export const POST_OPTIONS_SETTINGS_SCREEN = 'microblog.modal.PostOptionsSettingsScreen';
export const HIGHLIGHTS_SCREEN = 'microblog.HighlightsScreen';
export const SHARE_SCREEN = 'microblog.modal.ShareScreen';

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
import ArrowBackIcon from './../assets/icons/arrow_back.png';

import App from "../stores/App"
import Auth from "../stores/Auth"
import Services from "../stores/Services"

// Set up screens & components
export const Screens = {
  [ FOLLOWING_SCREEN ]: FollowingScreen,
  [ POSTING_SCREEN ]: PostingScreen,
  [ DISCOVER_TOPIC_SCREEN ]: DiscoverTopicScreen,
  [ POSTING_OPTIONS_SCREEN ]: PostingOptionsScreen,
  [ REPLY_SCREEN ]: ReplyScreen,
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
  [ UPLOADS_MODAL_SCREEN ]: UploadsScreen,
  [ POST_OPTIONS_SETTINGS_SCREEN ]: PostOptionsSettingsScreen,
  [ HIGHLIGHTS_SCREEN ]: HighlightsScreen,
  [ SHARE_SCREEN ]: ShareScreen,
  // COMPONENTS
  [ PROFILE_IMAGE ]: ProfileImage,
  [ NEW_POST_BUTTON ]: NewPostButton,
  [ SCREEN_TITLE ]: ScreenTitle,
  [ REFRESH_ACTIVITY ]: RefreshActivity,
  [ TAB ]: Tab,
  [ NEW_UPLOAD_BUTTON ]: NewUploadButton,
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

export const postingScreen = (markdown = null) => {
  const { post_status } = Auth.selected_user?.posting
  if(markdown != null){
    Auth.selected_user?.posting.hydrate_post_with_markdown(markdown)
  }
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

export const imageOptionsScreen = (asset, index, component_id) => {
  console.log("Screens:imageOptionsScreen", asset, index, component_id);

  const options = {
    component: {
      id: IMAGE_OPTIONS_SCREEN,
      name: IMAGE_OPTIONS_SCREEN,
      passProps: {
        asset: asset,
        index: index
      },
      options: {
        topBar: {
          title: {
            text: asset.is_video ? "Video options" : "Image options"
          },
          rightButtons: [
            {
               id: 'remove_image',
               text: "Remove",
               color: 'red',
            }
          ]
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
              id: 'post_button',
              text: 'New',
              component: {
                name: NEW_POST_BUTTON
              }
            },
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

export const uploadsScreen = (component_id, did_open_from_editor = false) => {
  const options = {
    component: {
      id: did_open_from_editor ? UPLOADS_MODAL_SCREEN : UPLOADS_SCREEN,
      name: did_open_from_editor ? UPLOADS_MODAL_SCREEN : UPLOADS_SCREEN,
      passProps: {
        did_open_from_editor: did_open_from_editor
      },
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

export const postOptionsSettingsScreen = async (user, component_id, open_as_modal = false) => {
  console.log("Screens:postOptionsSettingsScreen", user, component_id);
  await Services.hydrate_with_user(user)
  const component = {
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
          ...open_as_modal &&
          {
            leftButtons: [
              {
                id: 'close_modal_button',
                text: 'Close',
                icon: Platform.OS === 'ios' ? { system: 'xmark' } : ArrowBackIcon
              },
            ]
          }
        }
      }
    }
  }
  if(open_as_modal){
    return Navigation.showModal({
      stack: {
        id: POST_OPTIONS_SETTINGS_SCREEN,
        name: EDIT_PAGE_SCREEN,
        children: [component],
      }
    });
  }
  else{
    return Navigation.push(component_id, component);
  }
}

export const highlightsScreen = (component_id) => {
  component_id = component_id ?? App.current_screen_id
  const options = {
    component: {
      id: HIGHLIGHTS_SCREEN,
      name: HIGHLIGHTS_SCREEN,
      options: {
        topBar: {
          title: {
            text: "Highlights"
          },
          rightButtons: [
            {
              id: 'refresh_indicator',
              text: 'refresh',
              component: {
                name: REFRESH_ACTIVITY,
                passProps: {
                  type: "highlights"
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

export const shareScreen = () => {
  return Navigation.showModal({
    stack: {
      id: POSTING_STACK,
      name: POSTING_STACK,
      children: [ {
        component: {
          id: SHARE_SCREEN,
          name: SHARE_SCREEN,
          options: {
            topBar: {
              visible: false
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
