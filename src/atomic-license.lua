Handlers.add(
  "getOwner",
  Handlers.utils.hasMatchingTag("Action", "Get-Owner"),
  function(msg)
    ao.send({ Target = msg.From, Data = ao.env.Process.Owner })
  end
)
