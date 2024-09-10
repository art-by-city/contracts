Handlers.add(
  "getOwner",
  Handlers.utils.hasMatchingTag("Action", "Get-Owner"),
  function(msg)
    ao.send({ Target = msg.From, Data = ao.env.Process.Owner })
  end
)

Handlers.add(
  "ping",
  Handlers.utils.hasMatchingTag("Action", "Ping"),
  function(msg)
    ao.send({ Target = msg.From, Data = "pong" })
  end
)
