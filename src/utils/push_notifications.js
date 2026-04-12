export function parse_notification_user(value) {
  if (value == null) {
    return null
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    }
    catch (_error) {
      return null
    }
  }

  if (typeof value === 'object') {
    return value
  }

  return null
}

export function normalise_notification_payload(notification, platform_os = 'ios') {
  const data = notification?.data || {}
  const to_user = parse_notification_user(data.to_user)
  const from_user = parse_notification_user(data.from_user)
  const tapped_from_os = notification?.userInteraction === true || notification?.foreground === false
  const opened_from_foreground_banner = notification?.userInteraction === true && notification?.foreground === true
  const post_id = data?.post_id != null ? String(data.post_id) : null

  return {
    id: platform_os === 'ios'
      ? (data?.notificationId != null ? String(data.notificationId) : (post_id || notification?.id || notification?.message || `${Date.now()}`))
      : String(notification?.id || data?.id || post_id || notification?.message || `${Date.now()}`),
    message: notification?.message || null,
    post_id,
    to_username: to_user?.username || null,
    from_username: from_user?.username || null,
    should_open: tapped_from_os && post_id != null,
    opened_from_foreground_banner
  }
}

export function determine_notification_action({ notification, has_navigation, has_local_user, is_app_active = true }) {
  if (notification?.should_open) {
    if (notification?.post_id == null) {
      return 'show'
    }

    if (has_navigation && has_local_user && (is_app_active || notification?.opened_from_foreground_banner)) {
      return 'open'
    }

    return 'queue'
  }

  return 'show'
}

export function determine_pending_notification_action({ notification, has_navigation, has_local_user, is_app_active = true }) {
  if (!notification?.should_open || notification?.post_id == null) {
    return 'show'
  }

  if (!has_navigation) {
    return 'wait'
  }

  if (!is_app_active && !notification?.opened_from_foreground_banner) {
    return 'wait'
  }

  if (!has_local_user) {
    return 'show'
  }

  return 'open'
}
