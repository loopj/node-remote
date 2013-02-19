class Role
  @_roles: {}

  @getRole: (name) ->
    @_roles[name] ||= new Role(name)

  @getRoles: (names) ->
    return [] unless names
    (@_roles[name] for name in names)

  constructor: (@name) ->
    console.log "created new role #{@name}"
    @_servers = []

  addServer: (server) ->
    console.log "added server #{server} to role #{@name}"
    @_servers.push server
  
  getServers: ->
    @_servers

module.exports = exports = Role