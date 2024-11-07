local function followingContract()
  local FollowingHandlers = require('.common.following')
  local Ownable = require('.common.ownable')
  local ACL = require('.common.acl')

  --------------------------
  --- Following Handlers ---
  --------------------------

  ACL.addRole('follow')
  Handlers.add(
    'follow',
    Handlers.utils.hasMatchingTag('Action', 'Follow'),
    function (msg)
      ACL.assert_owner_or_role('follow', msg.From)
      FollowingHandlers.follow(msg)
    end
  )

  ACL.addRole('unfollow')
  Handlers.add(
    'unfollow',
    Handlers.utils.hasMatchingTag('Action', 'Unfollow'),
    function (msg)
      ACL.assert_owner_or_role('unfollow', msg.From)
      FollowingHandlers.unfollow(msg)
    end
  )

  Handlers.add(
    'getFollowing',
    Handlers.utils.hasMatchingTag('Action', 'Get-Following'),
    FollowingHandlers.getFollowing
  )

  ------------------------
  --- Ownable Handlers ---
  ------------------------

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

  --------------------
  --- ACL Handlers ---
  --------------------
 
  ACL.addRole('addRole')
  Handlers.add(
    'addRole',
    Handlers.utils.hasMatchingTag('Action', 'Add-Role'),
    function (msg)
      ACL.assert_owner_or_role('addRole', msg.From)
      ACL.Handlers.addRole(msg)
    end
  )

  ACL.addRole('removeRole')
  Handlers.add(
    'removeRole',
    Handlers.utils.hasMatchingTag('Action', 'Remove-Role'),
    function (msg)
      ACL.assert_owner_or_role('removeRole', msg.From)
      ACL.Handlers.removeRole(msg)
    end
  )

  ACL.addRole('grantRole')
  Handlers.add(
    'grantRole',
    Handlers.utils.hasMatchingTag('Action', 'Grant-Role'),
    function (msg)
      ACL.assert_owner_or_role('grantRole', msg.From)
      ACL.Handlers.grantRole(msg)
    end
  )

  ACL.addRole('revokeRole')
  Handlers.add(
    'revokeRole',
    Handlers.utils.hasMatchingTag('Action', 'Revoke-Role'),
    function (msg)
      ACL.assert_owner_or_role('revokeRole', msg.From)
      ACL.Handlers.revokeRole(msg)
    end
  )

  Handlers.add(
    'listRoles',
    Handlers.utils.hasMatchingTag('Action', 'List-Roles'),
    ACL.Handlers.listRoles
  )
end

followingContract()
