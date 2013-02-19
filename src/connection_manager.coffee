ssh = require "./ssh"

class ConnectionManager
  @_connections: {}

  @getConnection: (host) ->
    unless @_connections[host]
      @_connections[host] = new ssh.Client(host, port: 9022)
      @_connections[host].connect()
    
    @_connections[host]

  @closeConnections: ->
    for host, c of @_connections
      c.close()

module.exports = exports = ConnectionManager