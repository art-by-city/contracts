local function curationContract()
  local json = require('json')
  local utils = require('.utils')

  local FollowingHandlers = require('.common.following')
  local Ownable = require('.common.ownable')

  Title = ao.env.Process.Tags['Title'] or ''
  Metadata = ao.env.Process.Tags['Description']
    and json.encode({ description = ao.env.Process.Tags['Description'] })
    or ''
  Items = {}
  Owner = Owner or ao.env.Process.Owner

  Handlers.add(
    'setTitle',
    Handlers.utils.hasMatchingTag('Action', 'Set-Title'),
    function(msg)
      Ownable.assert_is_owner(msg.From)
      assert(msg.Tags['Title'], 'Title tag is required')

      Title = msg.Tags['Title']

      ao.send({
        Target = msg.From,
        Action = 'Set-Title-Response',
        Data = Title
      })
    end
  )

  Handlers.add(
    'getTitle',
    Handlers.utils.hasMatchingTag('Action', 'Get-Title'),
    function(msg)
      ao.send({
        Target = msg.From,
        Action = 'Get-Title-Response',
        Data = Title
      })
    end
  )

  Handlers.add(
    'setMetadata',
    Handlers.utils.hasMatchingTag('Action', 'Set-Metadata'),
    function(msg)
      Ownable.assert_is_owner(msg.From)

      local success = pcall(json.decode, msg.Data)

      if success then
        Metadata = msg.Data
        ao.send({
          Target = msg.From,
          Action = 'Set-Metadata-Response',
          Data = Metadata
        })
      else
        error('Invalid metadata JSON')
      end
    end
  )

  Handlers.add(
    'getMetadata',
    Handlers.utils.hasMatchingTag('Action', 'Get-Metadata'),
    function(msg)
      ao.send({
        Target = msg.From,
        Action = 'Get-Metadata-Response',
        Data = Metadata
      })
    end
  )

  Handlers.add(
    'addItem',
    Handlers.utils.hasMatchingTag('Action', 'Add-Item'),
    function(msg)
      Ownable.assert_is_owner(msg.From)
      assert(msg.Tags['Item'], 'Item tag is required')

      table.insert(Items, {
        item = msg.Tags['Item'],
        hidden = false
      })

      ao.send({
        Target = msg.From,
        Action = 'Add-Item-Response',
        Data = msg.Tags['Item']
      })
    end
  )

  Handlers.add(
    'listItems',
    Handlers.utils.hasMatchingTag('Action', 'List-Items'),
    function(msg)
      ao.send({
        Target = msg.From,
        Action = 'List-Items-Response',
        Data = json.encode(
          msg.Tags['Include-Hidden']
            and Items
            or utils.map(
              function (item) return item.item end,
              utils.filter(
                function (item) return not item.hidden end,
                Items
              )
            )
        )
      })
    end
  )

  Handlers.add(
    'removeItem',
    Handlers.utils.hasMatchingTag('Action', 'Remove-Item'),
    function(msg)
      Ownable.assert_is_owner(msg.From)
      assert(msg.Tags['Item-Index'], 'Item-Index tag is required')

      local _, itemIndex = pcall(tonumber, msg.Tags['Item-Index'])

      if itemIndex ~= nil then
        local success, removedItem = pcall(table.remove, Items, itemIndex)

        if success then
          ao.send({
            Target = msg.From,
            Action = 'Remove-Item-Response',
            Data = removedItem.item
          })
        else
          error('Invalid Item-Index')
        end
      else
        error('Invalid Item-Index')
      end
    end
  )

  Handlers.add(
    'setItems',
    Handlers.utils.hasMatchingTag('Action', 'Set-Items'),
    function(msg)
      Ownable.assert_is_owner(msg.From)

      local success, items

      if msg.Tags['Items'] then
        success, items = pcall(json.decode, msg.Tags['Items'])
      elseif msg.Data then
        local dataDecodeSuccess, collection = pcall(json.decode, msg.Data)
        if
          dataDecodeSuccess
          and type(collection) == 'table'
          and collection['items']
        then
          success = true
          items = collection['items']
        else
          success = false
        end
      end

      if success and type(items) == 'table' then
        Items = utils.map(
          function(item) return { item = item, hidden = false } end,
          items
        )
        ao.send({
          Target = msg.From,
          Action = 'Set-Items-Response',
          Data = tostring(#utils.keys(Items))
        })
      else
        error('Items required')
      end
    end
  )

  Handlers.add(
    'hideItem',
    Handlers.utils.hasMatchingTag('Action', 'Hide-Item'),
    function(msg)
      Ownable.assert_is_owner(msg.From)
      assert(msg.Tags['Item-Index'], 'Item-Index tag is required')

      local _, itemIndex = pcall(tonumber, msg.Tags['Item-Index'])

      if itemIndex ~= nil then
        if Items[itemIndex] then
          Items[itemIndex].hidden = true
          ao.send({
            Target = msg.From,
            Action = 'Hide-Item-Response',
            Data = Items[itemIndex].item
          })
        else
          error('Invalid Item-Index')
        end
      else
        error('Invalid Item-Index')
      end
    end
  )

  Handlers.add(
    'unhideItem',
    Handlers.utils.hasMatchingTag('Action', 'Unhide-Item'),
    function(msg)
      Ownable.assert_is_owner(msg.From)
      assert(msg.Tags['Item-Index'], 'Item-Index tag is required')

      local _, itemIndex = pcall(tonumber, msg.Tags['Item-Index'])

      if itemIndex ~= nil then
        if Items[itemIndex] then
          Items[itemIndex].hidden = false
          ao.send({
            Target = msg.From,
            Action = 'Unhide-Item-Response',
            Data = Items[itemIndex].item
          })
        else
          error('Invalid Item-Index')
        end
      else
        error('Invalid Item-Index')
      end
    end
  )

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

curationContract()
