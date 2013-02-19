class Namespace
  constructor: (@parent, @name) ->
    console.log "defining namespace #{@name}, parent=#{@parent?.name}"

module.exports = exports = Namespace