import type { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import Game from '#models/game'
import GamePlayer from '#models/game_player'
import {
  FLEET,
  BOARD_SIZE,
  cellKey,
  isFleetDestroyed,
  sunkShipIds,
  validateFleet,
  inBounds,
  type Cell,
} from '#services/battleship'

/**
 * Session key holding the current player's id for a given game. Scoped by game
 * id so a single browser can (in theory) belong to several games.
 */
function sessionKey(gameId: string) {
  return `battleship:${gameId}`
}

export default class GamesController {
  /**
   * Landing / create form.
   */
  async new({ inertia }: HttpContext) {
    return inertia.render('game/new')
  }

  /**
   * Create a game and register the creator as player 1.
   */
  async create({ request, response, session }: HttpContext) {
    const name = String(request.input('name', '')).trim().slice(0, 40) || 'Amiral 1'

    const game = await Game.create({ status: 'waiting' })
    const player = await game.related('players').create({
      playerNumber: 1,
      name,
      ready: false,
      ships: [],
      shots: [],
    })

    session.put(sessionKey(game.id), player.id)
    return response.redirect(`/play/${game.id}`)
  }

  /**
   * Join form reached through the invite link.
   */
  async joinForm({ request, inertia }: HttpContext) {
    const { code } = request.params()
    const game = await Game.findBy('inviteCode', code)
    if (!game) return inertia.render('game/not_found')
    await game.load('players')

    if (game.players.length >= 2) {
      return inertia.render('game/not_found', { reason: 'full' })
    }

    return inertia.render('game/join', { code })
  }

  /**
   * Register the second player and start the placement phase.
   */
  async join({ request, response, session, inertia }: HttpContext) {
    const { code } = request.params()
    const name = String(request.input('name', '')).trim().slice(0, 40) || 'Amiral 2'

    const game = await Game.findBy('inviteCode', code)
    if (!game) return inertia.render('game/not_found')
    await game.load('players')

    // Already a player in this game? Just go back to the board.
    const existingId = session.get(sessionKey(game.id))
    if (existingId && game.players.some((p) => p.id === existingId)) {
      return response.redirect(`/play/${game.id}`)
    }

    if (game.players.length >= 2) {
      return inertia.render('game/not_found', { reason: 'full' })
    }

    const player = await game.related('players').create({
      playerNumber: 2,
      name,
      ready: false,
      ships: [],
      shots: [],
    })

    game.status = 'placement'
    await game.save()

    session.put(sessionKey(game.id), player.id)
    await this.broadcast(game.id)

    return response.redirect(`/play/${game.id}`)
  }

  /**
   * The main game screen. Renders a view tailored to the requesting player.
   */
  async show({ request, inertia, session }: HttpContext) {
    const { id } = request.params()
    const game = await Game.find(id)
    if (!game) return inertia.render('game/not_found')
    await game.load('players')

    const myId = session.get(sessionKey(game.id))
    const me = game.players.find((p) => p.id === myId) ?? null
    const opponent = game.players.find((p) => p.id !== myId) ?? null

    const url = env.get('URL') ?? 'http://localhost:3333'
    const inviteUrl = `${url}/play/join/${game.inviteCode}`

    return inertia.render('game/show', {
      gameId: game.id,
      status: game.status,
      boardSize: BOARD_SIZE,
      fleet: FLEET,
      inviteUrl,
      isSpectator: !me,
      me: me ? this.buildSelfView(me, opponent) : null,
      opponent: this.buildOpponentView(me, opponent),
      isMyTurn: !!me && game.currentTurnPlayerId === me.id,
      winner: this.buildWinner(game, me),
    })
  }

  /**
   * Persist a player's fleet and flip them to "ready". When both players are
   * ready the battle begins.
   */
  async place({ request, response, session }: HttpContext) {
    const { id } = request.params()
    const game = await Game.find(id)
    if (!game) return response.redirect(`/play/${id}`)
    await game.load('players')

    const myId = session.get(sessionKey(game.id))
    const me = game.players.find((p) => p.id === myId)
    if (!me || game.status !== 'placement') {
      return response.redirect(`/play/${id}`)
    }

    const ships = request.input('ships')
    if (!validateFleet(ships)) {
      session.flash('error', 'Placement invalide, réessaie.')
      return response.redirect(`/play/${id}`)
    }

    me.ships = ships
    me.ready = true
    await me.save()

    // Both players ready -> start the battle.
    await game.refresh()
    await game.load('players')
    if (game.players.length === 2 && game.players.every((p) => p.ready)) {
      const first = game.players.find((p) => p.playerNumber === 1)!
      game.status = 'battle'
      game.currentTurnPlayerId = first.id
      await game.save()
    }

    await this.broadcast(game.id)
    return response.redirect(`/play/${id}`)
  }

  /**
   * Fire at a cell on the opponent board.
   */
  async fire({ request, response, session }: HttpContext) {
    const { id } = request.params()
    const game = await Game.find(id)
    if (!game) return response.redirect(`/play/${id}`)
    await game.load('players')

    const myId = session.get(sessionKey(game.id))
    const me = game.players.find((p) => p.id === myId)
    const opponent = game.players.find((p) => p.id !== myId)

    if (!me || !opponent || game.status !== 'battle' || game.currentTurnPlayerId !== me.id) {
      return response.redirect(`/play/${id}`)
    }

    const r = Number(request.input('r'))
    const c = Number(request.input('c'))
    if (!Number.isInteger(r) || !Number.isInteger(c) || !inBounds(r, c)) {
      return response.redirect(`/play/${id}`)
    }

    // Ignore duplicate shots on the same cell.
    const target: Cell = { r, c }
    const alreadyFired = me.shots.some((s) => s.r === r && s.c === c)
    if (!alreadyFired) {
      me.shots = [...me.shots, target]
      await me.save()
    }

    if (isFleetDestroyed(opponent.ships, me.shots)) {
      game.status = 'finished'
      game.winnerPlayerId = me.id
      game.currentTurnPlayerId = null
    } else {
      // One shot per turn: hand over to the opponent.
      game.currentTurnPlayerId = opponent.id
    }
    await game.save()

    await this.broadcast(game.id)
    return response.redirect(`/play/${id}`)
  }

  /**
   * Notify every connected client that the game state changed. Clients react by
   * reloading their (player-specific) Inertia props.
   */
  private async broadcast(gameId: string) {
    await transmit.broadcast(`game/${gameId}`, { ts: Date.now() })
  }

  /**
   * View of my own waters: my ships plus the shots the opponent landed on me.
   */
  private buildSelfView(me: GamePlayer, opponent: GamePlayer | null) {
    const incomingShots = opponent?.shots ?? []
    const myCells = new Set<string>()
    me.ships.forEach((ship) => ship.cells.forEach((cell) => myCells.add(cellKey(cell))))

    const hitsOnMe = incomingShots.filter((s) => myCells.has(cellKey(s)))
    const lostShipIds = sunkShipIds(me.ships, incomingShots)

    return {
      playerNumber: me.playerNumber,
      name: me.name,
      ready: me.ready,
      ships: me.ships,
      incomingShots,
      hitCount: hitsOnMe.length,
      lostShipIds,
    }
  }

  /**
   * Public view of the opponent: their identity plus how my shots landed. Their
   * unhit ship positions are never exposed until the game is over.
   */
  private buildOpponentView(me: GamePlayer | null, opponent: GamePlayer | null) {
    if (!opponent) return null

    const myShots = me?.shots ?? []
    const opponentCells = new Set<string>()
    opponent.ships.forEach((ship) => ship.cells.forEach((cell) => opponentCells.add(cellKey(cell))))

    const tracking = myShots.map((s) => ({
      r: s.r,
      c: s.c,
      hit: opponentCells.has(cellKey(s)),
    }))
    const sunkIds = sunkShipIds(opponent.ships, myShots)
    // Cells belonging to a fully sunk ship are safe to reveal.
    const sunkCells: Cell[] = opponent.ships
      .filter((ship) => sunkIds.includes(ship.id))
      .flatMap((ship) => ship.cells)

    return {
      playerNumber: opponent.playerNumber,
      name: opponent.name,
      ready: opponent.ready,
      joined: true,
      tracking,
      sunkShipIds: sunkIds,
      sunkCells,
      hitCount: tracking.filter((t) => t.hit).length,
    }
  }

  /**
   * When the game is over, reveal the loser's full fleet so both boards can be
   * shown honestly.
   */
  private buildWinner(game: Game, me: GamePlayer | null) {
    if (game.status !== 'finished' || !game.winnerPlayerId) return null
    const winner = game.players.find((p) => p.id === game.winnerPlayerId)
    return {
      playerId: game.winnerPlayerId,
      name: winner?.name ?? '',
      iWon: !!me && game.winnerPlayerId === me.id,
      // Reveal both fleets once finished.
      reveal: game.players.map((p) => ({ playerNumber: p.playerNumber, ships: p.ships })),
    }
  }
}
