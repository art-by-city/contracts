local Ownable = {
  Handlers = {},
  assert_is_owner = function (address)
    assert(
      address == Owner,
      'This action is only available to the process Owner ' .. Owner
    )
  end
}

function Ownable.Handlers.getOwner(msg)
  ao.send({
    Target = msg.From,
    Action = 'Get-Owner-Response',
    Data = Owner
  })
end

function Ownable.Handlers.transferOwner(msg)
  Ownable.assert_is_owner(msg.From)
  assert(msg.Tags['New-Owner'], 'New-Owner tag is required')

  Owner = msg.Tags['New-Owner']

  ao.send({
    Target = msg.From,
    Action = 'Transfer-Owner-Response',
    Data = Owner
  })
end

function Ownable.assert_is_owner(address)
  assert(
    address == Owner,
    'This action is only available to the process Owner'
  )
end

return Ownable
