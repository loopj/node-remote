#!/usr/bin/env coffee

ssh = require "./ssh"
async = require "async"
color = require("ansi-color").set

class NodeRemote
  constructor: ->
    @_connections = {}

  getConnection: (host) ->
    unless @_connections[host]
      @_connections[host] = new ssh.Client(host, port: 9022)
      @_connections[host].connect()
    
    @_connections[host]

  closeConnections: ->
    for host, c of @_connections
      c.close()

  hostsForTask: (options) ->
    # TODO: Look at options for roles, hosts, only, except etc
    ["doppler.io", "bugsnag.com"]

  run: (command, options, cb) ->
    hosts = @hostsForTask(options)    
    console.log color("Executing \"#{command}\" on servers [#{hosts.join(", ")}]", "green")

    # Run command in parallel on all servers
    hostTasks = hosts.map (host) =>
      (callback) =>
        @getConnection(host).runCommand(command)
          .out (data) ->
            console.log "**  [out #{host}] #{data}"
          .err (data) ->
            console.log "*** [err #{host}] #{data}"
          .done (returnCode, time) ->
            console.log "    command finished in #{time}ms"
            callback()

    async.parallel hostTasks, =>
      console.log "Finished executing \"#{command}\" on servers #{hosts}\n"
      cb()



# TODO: Task queuing
commands = ["whoami", "hostname", "ls"]

r = new NodeRemote()
async.series (commands.map (c) =>
  (callback) =>
    r.run c, {}, =>
      callback()
), =>
  console.log color("✓ all commands were run", "green")
  r.closeConnections()




