spawn = require("child_process").spawn

# TODO: Handle "The authenticity of host..." prompt
# TODO: Handle login prompt (requires pty)

class Command
  @commandCount: 0

  cleanData = (data) ->
    data.toString().replace(/\n$/, "")

  constructor: (@connection, @command) ->
    @id = @constructor.commandCount++
    @_outListeners = []
    @_errListeners = []

  doneString: ->
    "--DONE-#{@id}-$?--"

  doneStringPattern: ->
    new RegExp("--DONE-#{@id}-([0-9]+)--$")

  run: ->
    @_startTime = new Date().getTime()
    @connection.ssh.stdin.write @command + "; echo \"#{@doneString()}\"\n"

    return @

  out: (cb) ->
    @connection.ssh.stdout.on "data", (data) =>
      @_outListeners.push arguments.callee      
      cleanData(data).split("\n").forEach (line) =>
        cb(line) unless line.match(@doneStringPattern())

    return @

  err: (cb) ->
    @connection.ssh.stderr.on "data", (data) =>
      @_errListeners.push arguments.callee
      cleanData(data).split("\n").forEach (line) => cb(line)

    return @

  done: (cb) ->
    @connection.ssh.stdout.on "data", (data) =>
      match = cleanData(data).match @doneStringPattern()
      if match
        # Remove event listeners
        while @_outListeners.length > 0
          @connection.ssh.stdout.removeListener "data", @_outListeners.pop()

        while @_errListeners.length > 0
          @connection.ssh.stderr.removeListener "data", @_errListeners.pop()

        @connection.ssh.stdout.removeListener "data", arguments.callee

        # Fire done callback
        cb?(match[1], new Date().getTime() - @_startTime)

    return @


class Client
  @clientCount: 0

  constructor: (@host, @opts) ->
    @id = @constructor.clientCount++

  buildSSHCommand: ->
    host = @host
    host = @opts.user + "@" + host if @opts.user

    flags = ""
    flags += "-p #{@opts.port}" if @opts.port

    [flags, host]

  connect: ->
    params = @buildSSHCommand()
    params.push "sh" # Suppresses MOTD

    @ssh = spawn("ssh", params)

  close: ->
    @ssh.stdin.end()

  runCommand: (command, done) ->
    command = new Command(@, command)
    command.run()


exports = module.exports =
  Client: Client
  Command: Command