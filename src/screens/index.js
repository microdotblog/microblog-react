import { Navigation } from "react-native-navigation";

// SCREENS
import TimelineScreen from './timeline/timeline';
export const TIMELINE_SCREEN = 'microblog.TimelineScreen';

// Set up screens
export const Screens = new Map();
Screens.set(TIMELINE_SCREEN, TimelineScreen);

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