local FollowingHandlers = require('.handlers.following')

Handlers.add(
  'follow',
  Handlers.utils.hasMatchingTag('Action', 'Follow'),
  FollowingHandlers.follow
)

Handlers.add(
  'unfollow',
  Handlers.utils.hasMatchingTag('Action', 'Unfollow'),
  FollowingHandlers.unfollow
)

Handlers.add(
  'getFollowing',
  Handlers.utils.hasMatchingTag('Action', 'Get-Following'),
  FollowingHandlers.getFollowing
)
