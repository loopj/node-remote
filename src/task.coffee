async = require "async"

Namespace = require "./namespace"
Role = require "./role"
ConnectionManager = require "./connection_manager"

class Task extends Namespace
  @tasks: {}

  constructor: (@parent, @name, @opts) ->
    @invocations = []
    console.log "defining task #{@name}, parent=#{@parent?.name}"

  addInvocation: (action) ->
    console.log "defining a 'run' action, parent=#{@name}"      
    @invocations.push action

    stack = [@]
    parent = @parent
    while parent
      stack.unshift parent
      parent = parent.parent

    container = @constructor.tasks
    for s, idx in stack
      if idx == stack.length - 1
        container[s.name] = s
      else
        container = container[s.name] ||= {}

  run: ->
    console.log "running task #{@name}"
    matchingRoles = Role.getRoles(@opts?.roles)
    matchingServers = matchingRoles.reduce (servers, role) -> 
      servers.concat role.getServers()
    , []

    hostTasks = matchingServers.map (host) =>
      (callback) =>
        @invocations.forEach (inv) ->
          ConnectionManager.getConnection(host).runCommand(inv.command)
            .out (data) ->
              console.log "**  [out #{host}] #{data}"
            .err (data) ->
              console.log "*** [err #{host}] #{data}"
            .done (returnCode, time) ->
              console.log "    command finished in #{time}ms"
              callback()

    async.parallel hostTasks, =>
      console.log "Finished executing task \"#{@name}\" on servers #{matchingServers}\n"
      # cb()



    # matchingServers = matchingRoles.reduce (servers, role) -> 
    #   servers.concat role.getServers()
    # , []
    # 
    # console.log matchingServers

    @invocations.forEach (i) ->
      # if i.opts?.roles
      #   Role.getRole(i.opts.roles)
      console.log "- invocation #{i.command}, #{i.opts.roles}" if i.opts

module.exports = exports = Task