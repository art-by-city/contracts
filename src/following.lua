local json = require('json')
local utils = require(".utils")

Following = {}

Handlers.add(
  'follow',
  Handlers.utils.hasMatchingTag('Action', 'Follow'),
  function(msg)
    assert(
      msg.From == ao.env.Process.Owner,
      'This action is only available to the process Owner'
    )
    assert(msg.Tags['Follow-Address'], 'Follow-Address tag is required')

    Following[msg.Tags['Follow-Address']] = 1

    ao.send({
      Target = msg.From,
      Action = 'Follow-Response',
      Data = msg.Tags['Follow-Address']
    })
  end
)

Handlers.add(
  'unfollow',
  Handlers.utils.hasMatchingTag('Action', 'Unfollow'),
  function(msg)
    assert(
      msg.From == ao.env.Process.Owner,
      'This action is only available to the process Owner'
    )
    assert(msg.Tags['Unfollow-Address'], 'Unfollow-Address tag is required')

    Following[msg.Tags['Unfollow-Address']] = nil

    ao.send({
      Target = msg.From,
      Action = 'Unfollow-Response',
      Data = msg.Tags['Unfollow-Address']
    })
  end
)

Handlers.add(
  'getFollowing',
  Handlers.utils.hasMatchingTag('Action', 'Get-Following'),
  function(msg)
    ao.send({
      Target = msg.From,
      Action = 'Get-Following-Response',
      Data = json.encode(utils.keys(Following))
    })
  end
)
