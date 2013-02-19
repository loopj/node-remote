Namespace = require "./namespace"
Task = require "./task"
Role = require "./role"
Invocation = require "./invocation"

# DSL methods
namespaces = []
exports.namespace = namespace = (name, fn) ->
  ns = new Namespace(namespaces[0], name)
  namespaces.unshift(ns)
  fn.call(ns)
  namespaces.shift()
  return ns

exports.task = task = (name, opts, fn) ->
  if typeof(opts) == "function"
    fn = opts
    opts = null

  t = new Task(namespaces[0], name, opts)
  namespaces.unshift(t)
  fn.call(t)
  namespaces.shift()
  return t

exports.run = run = (command, opts, cb) ->
  namespaces[0].addInvocation new Invocation(command, opts, cb)

exports.server = server = (server, roles...) ->
  roles.forEach (role) -> Role.getRole(role).addServer(server)

exports.role = role = (role, servers...) ->
  role = Role.getRole(role)
  servers.forEach (server) -> role.addServer(server)

exports.runTask = runTask = (taskName) ->
  # TODO: Handle "default" tasks
  task = taskName.split(":").reduce ((obj, el) -> obj?[el]), Task.tasks
  task.run() if task
  # TODO: Callbacks


role "app", "doppler.io", "bugsnag.com"

namespace "deploy", ->
  task "herp", roles: ["app"], ->
    run "pwd"
    run "hostname"
    run "whoami"

runTask "deploy:herp"