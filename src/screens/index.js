import { Navigation } from "react-native-navigation";

// SCREENS
import TimelineScreen from './timeline/timeline';
import MentionsScreen from './mentions/mentions';
import DiscoverScreen from './discover/discover';

export const TIMELINE_SCREEN = 'microblog.TimelineScreen';
export const MENTIONS_SCREEN = 'microblog.MentionsScreen';
export const DISCOVER_SCREEN = 'microblog.DiscoverScreen';

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);
Screens.set(MENTIONS_SCREEN, MentionsScreen);
Screens.set(DISCOVER_SCREEN, DiscoverScreen);

export const startApp = () => {
  const tabs = [
    {
      stack: {
        id: 'TIMELINE_SCREEN',
        children: [{
          component: {
            name: TIMELINE_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Timeline',
                },
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Timeline'
          },
        },
      },
    },
    {
      stack: {
        id: 'MENTIONS_SCREEN',
        children: [{
          component: {
            name: MENTIONS_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Mentions',
                },
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Mentions'
          },
        },
      },
    },
    {
      stack: {
        id: 'DISCOVER_SCREEN',
        children: [{
          component: {
            name: DISCOVER_SCREEN,
            options: {
              topBar: {
                title: {
                  text: 'Discover',
                },
              }
            }
          },
        }],
        options: {
          bottomTab: {
            text: 'Discover'
          },
        },
      },
    }
  ]

  Navigation.setDefaultOptions({});

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: tabs,
      },
    },
  });
  
}