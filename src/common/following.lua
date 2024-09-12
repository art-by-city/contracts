local json = require('json')
local utils = require('.utils')

local Following = {}
local FollowingHandlers = {}

function FollowingHandlers.follow(msg)
  assert(msg.Tags['Follow-Address'], 'Follow-Address tag is required')

  Following[msg.Tags['Follow-Address']] = 1

  ao.send({
    Target = msg.From,
    Action = 'Follow-Response',
    Data = msg.Tags['Follow-Address']
  })
end

function FollowingHandlers.unfollow(msg)
  assert(msg.Tags['Unfollow-Address'], 'Unfollow-Address tag is required')

  Following[msg.Tags['Unfollow-Address']] = nil

  ao.send({
    Target = msg.From,
    Action = 'Unfollow-Response',
    Data = msg.Tags['Unfollow-Address']
  })
end

function FollowingHandlers.getFollowing(msg)
  ao.send({
    Target = msg.From,
    Action = 'Get-Following-Response',
    Data = json.encode(utils.keys(Following))
  })
end

return FollowingHandlers
