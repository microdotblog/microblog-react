import {
  normalise_notification_payload,
  determine_notification_action,
  determine_pending_notification_action
} from './push_notifications'

describe('push notification routing', () => {
  test('queues a tapped notification when the app is not ready to open it yet', () => {
    const notification = normalise_notification_payload({
      message: 'Alice mentioned you',
      data: {
        post_id: '123',
        to_user: { username: 'vincent' },
        from_user: { username: 'alice' }
      },
      foreground: false,
      userInteraction: true
    }, 'ios')

    expect(determine_notification_action({
      notification,
      has_navigation: false,
      has_local_user: false,
      is_app_active: false
    })).toBe('queue')
  })

  test('opens a queued notification once auth and navigation are ready', () => {
    const notification = {
      post_id: '123',
      to_username: 'vincent',
      should_open: true
    }

    expect(determine_pending_notification_action({
      notification,
      has_navigation: true,
      has_local_user: true,
      is_app_active: true
    })).toBe('open')
  })

  test('keeps a queued notification pending until navigation is ready', () => {
    const notification = {
      post_id: '123',
      to_username: 'vincent',
      should_open: true
    }

    expect(determine_pending_notification_action({
      notification,
      has_navigation: false,
      has_local_user: true,
      is_app_active: true
    })).toBe('wait')
  })

  test('keeps a queued notification pending until the app becomes active', () => {
    const notification = {
      post_id: '123',
      to_username: 'vincent',
      should_open: true
    }

    expect(determine_pending_notification_action({
      notification,
      has_navigation: true,
      has_local_user: true,
      is_app_active: false
    })).toBe('wait')
  })

  test('shows a foreground notification in the in-app sheet instead of auto-opening', () => {
    const notification = normalise_notification_payload({
      id: 'abc',
      message: 'Alice mentioned you',
      data: {
        post_id: '123',
        to_user: '{"username":"vincent"}',
        from_user: '{"username":"alice"}'
      },
      foreground: true,
      userInteraction: false
    }, 'android')

    expect(determine_notification_action({
      notification,
      has_navigation: true,
      has_local_user: true,
      is_app_active: true
    })).toBe('show')
  })

  test('falls back to the in-app sheet when a tapped payload cannot be opened', () => {
    const notification = normalise_notification_payload({
      message: 'Alice mentioned you',
      data: {
        to_user: { username: 'vincent' },
        from_user: { username: 'alice' }
      },
      foreground: false,
      userInteraction: true
    }, 'ios')

    expect(determine_notification_action({
      notification,
      has_navigation: true,
      has_local_user: true,
      is_app_active: true
    })).toBe('show')
  })
})
