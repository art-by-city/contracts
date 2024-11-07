local ACL = {
  Handlers = {},
  Roles = {}
}

local function initACL()
  local json = require('json')

  function ACL.addRole(role)
    ACL.Roles[role] = {}
  end

  function ACL.Handlers.addRole(msg)
    local role = msg.Tags['Role']
    assert(role, 'Role tag is required')
  
    ACL.addRole(role)
  
    ao.send({
      Target = msg.From,
      Action = 'Add-Role-Response',
      Data = role
    })
  end

  function ACL.Handlers.removeRole(msg)
    local role = msg.Tags['Role']
    assert(role, 'Role tag is required')

    ACL.Roles[role] = nil

    ao.send({
      Target = msg.From,
      Action = 'Remove-Role-Response',
      Data = role
    })
  end

  function ACL.Handlers.grantRole(msg)
    local role = msg.Tags['Role']
    local address = msg.Tags['Grant-To-Address']
    assert(address, 'Grant-To-Address tag is required')
    assert(role, 'Role tag is required')
    assert(ACL.Roles[role], 'Role ' .. role  ..' does not exist')
  
    ACL.Roles[role][address] = true
  
    ao.send({
      Target = msg.From,
      Action = 'Grant-Role-Response',
      Data = address
    })
  end

  function ACL.Handlers.revokeRole(msg)
    local role = msg.Tags['Role']
    local address = msg.Tags['Revoke-From-Address']
    assert(address, 'Revoke-From-Address tag is required')
    assert(role, 'Role tag is required')
    assert(ACL.Roles[role], 'Unknown Role')
    assert(ACL.Roles[role][address] ~= nil, 'Address does not have Role')

    ACL.Roles[role][address] = nil

    ao.send({
      Target = msg.From,
      Action = 'Revoke-Role-Response',
      Data = address
    })
  end

  function ACL.Handlers.listRoles(msg)
    ao.send({
      Target = msg.From,
      Action = 'List-Roles-Response',
      Data = json.encode(ACL.Roles)
    })
  end

  function ACL.assert_owner_or_role(role, address)
    assert(
      address == Owner or (
        ACL.Roles[role] ~= nil
        and ACL.Roles[role][address] == true
      ),
      'This action is only available to the process Owner '
        .. 'or addresses with the ' .. role .. ' role'..json.encode(ACL.Roles)
    )
  end
end

initACL()

return ACL
