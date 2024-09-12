local function followingContract()
  local FollowingHandlers = require('.common.following')
  local Ownable = require('.common.ownable')

  Handlers.add(
    'follow',
    Handlers.utils.hasMatchingTag('Action', 'Follow'),
    function (msg)
      Ownable.assert_is_owner(msg.From)
      FollowingHandlers.follow(msg)
    end
  )

  Handlers.add(
    'unfollow',
    Handlers.utils.hasMatchingTag('Action', 'Unfollow'),
    function (msg)
      Ownable.assert_is_owner(msg.From)
      FollowingHandlers.unfollow(msg)
    end
  )

  Handlers.add(
    'getFollowing',
    Handlers.utils.hasMatchingTag('Action', 'Get-Following'),
    FollowingHandlers.getFollowing
  )

  Handlers.add(
    'getOwner',
    Handlers.utils.hasMatchingTag('Action', 'Get-Owner'),
    Ownable.Handlers.getOwner
  )

  Handlers.add(
    'transferOwner',
    Handlers.utils.hasMatchingTag('Action', 'Transfer-Owner'),
    Ownable.Handlers.transferOwner
  )
end

followingContract()
