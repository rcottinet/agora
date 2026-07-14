import { Head, Link, router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qrcode-logo'
import {
  Anchor,
  Check,
  ClipboardCopy,
  Flame,
  RotateCcw,
  RotateCw,
  Shuffle,
  Skull,
  Swords,
  Trophy,
} from 'lucide-react'
import { transmit } from '~/transmit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Board, type CellVisual } from '@/components/game/board'
import {
  canPlace,
  cellKey,
  occupiedSet,
  randomFleet,
  type Cell,
  type FleetShip,
  type Orientation,
  type Ship,
} from '~/lib/game'

type Status = 'waiting' | 'placement' | 'battle' | 'finished'

interface Me {
  playerNumber: number
  name: string
  ready: boolean
  ships: Ship[]
  incomingShots: Cell[]
  hitCount: number
  lostShipIds: string[]
}

interface Opponent {
  playerNumber: number
  name: string
  ready: boolean
  joined: boolean
  tracking: { r: number; c: number; hit: boolean }[]
  sunkShipIds: string[]
  sunkCells: Cell[]
  hitCount: number
}

interface Winner {
  playerId: string
  name: string
  iWon: boolean
  reveal: { playerNumber: number; ships: Ship[] }[]
}

interface ShowProps {
  gameId: string
  status: Status
  boardSize: number
  fleet: FleetShip[]
  inviteUrl: string
  isSpectator: boolean
  me: Me | null
  opponent: Opponent | null
  isMyTurn: boolean
  winner: Winner | null
}

// ---- shared cell colors -------------------------------------------------

const WATER = 'bg-sky-300'
const WATER_TARGET = 'bg-sky-400 hover:bg-sky-500'
const SHIP = 'bg-slate-700'
const HIT = 'bg-red-500 text-white'
const SUNK = 'bg-red-800 text-white'

function missDot(): CellVisual['content'] {
  return <span className="h-1.5 w-1.5 rounded-full bg-slate-500/80" />
}

// ---- main component -----------------------------------------------------

export default function ShowGame(props: ShowProps) {
  const { gameId, status } = props

  // Reload player-specific props whenever the server signals a change.
  useEffect(() => {
    const subscription = transmit.subscription(`game/${gameId}`)
    subscription.create().then(() => {
      subscription.onMessage(() => {
        router.reload({ preserveScroll: true, preserveState: true })
      })
    })
    return () => {
      subscription.delete()
    }
  }, [gameId])

  return (
    <>
      <Head title="Bataille Navale" />
      <div className="min-h-screen p-4 pb-16">
        <div className="mx-auto max-w-md">
          <Header {...props} />

          {props.isSpectator ? (
            <Spectator />
          ) : status === 'waiting' ? (
            <WaitingRoom inviteUrl={props.inviteUrl} />
          ) : status === 'placement' && props.me && !props.me.ready ? (
            <Placement gameId={gameId} boardSize={props.boardSize} fleet={props.fleet} />
          ) : status === 'placement' ? (
            <ReadyWaiting me={props.me!} boardSize={props.boardSize} fleet={props.fleet} />
          ) : (
            <Battle {...props} />
          )}
        </div>
      </div>
    </>
  )
}

// ---- header -------------------------------------------------------------

function Header({ me, opponent, status }: ShowProps) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-center gap-2">
        <Anchor className="h-5 w-5" />
        <h1 className="text-xl font-heading uppercase tracking-tight">Bataille Navale</h1>
      </div>
      {me ? (
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider">
          <PlayerBadge name={me.name} tag="Toi" active />
          <span className="text-foreground/50">vs</span>
          <PlayerBadge
            name={opponent?.joined ? opponent.name : '???'}
            tag={opponent?.joined ? 'Adversaire' : 'En attente'}
            active={!!opponent?.joined}
          />
        </div>
      ) : null}
      {status === 'placement' ? (
        <p className="mt-2 text-center text-[11px] font-mono uppercase tracking-widest text-foreground/50">
          Phase de déploiement
        </p>
      ) : null}
    </div>
  )
}

function PlayerBadge({ name, tag, active }: { name: string; tag: string; active: boolean }) {
  return (
    <div
      className={`rounded-base border-2 border-border px-2 py-1 shadow-shadow ${
        active ? 'bg-main' : 'bg-secondary-background text-foreground/60'
      }`}
    >
      <div className="text-[9px] leading-none opacity-70">{tag}</div>
      <div className="max-w-[90px] truncate text-sm font-bold normal-case">{name}</div>
    </div>
  )
}

// ---- waiting room -------------------------------------------------------

function WaitingRoom({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-secondary-background">
      <CardHeader className="items-center text-center">
        <div className="mb-1 flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-foreground/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          En attente d'un adversaire
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-foreground/70">
          Partage ce lien. La partie démarre dès que ton adversaire rejoint.
        </p>
        <div className="flex justify-center rounded-base border-2 border-border bg-white p-3 shadow-shadow">
          <QRCode size={180} value={inviteUrl} />
        </div>
        <div
          onClick={copy}
          className="flex cursor-pointer items-center justify-between gap-2 break-all rounded-base border-2 border-dashed border-border bg-background/50 p-3 font-mono text-xs transition-colors hover:bg-background"
        >
          {inviteUrl}
          {copied ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <ClipboardCopy className="h-4 w-4 shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- placement ----------------------------------------------------------

function Placement({
  gameId,
  boardSize,
  fleet,
}: {
  gameId: string
  boardSize: number
  fleet: FleetShip[]
}) {
  const [placed, setPlaced] = useState<Ship[]>([])
  const [selectedId, setSelectedId] = useState<string>(fleet[0].id)
  const [orientation, setOrientation] = useState<Orientation>('h')
  const [submitting, setSubmitting] = useState(false)

  const placedById = useMemo(() => {
    const map = new Map<string, Ship>()
    placed.forEach((s) => map.set(s.id, s))
    return map
  }, [placed])

  const cellOwner = useMemo(() => {
    const map = new Map<string, string>()
    placed.forEach((s) => s.cells.forEach((c) => map.set(cellKey(c), s.id)))
    return map
  }, [placed])

  const allPlaced = placed.length === fleet.length

  function nextUnplaced(afterId: string): string {
    const ids = fleet.map((f) => f.id)
    const ordered = [
      ...ids.slice(ids.indexOf(afterId) + 1),
      ...ids.slice(0, ids.indexOf(afterId) + 1),
    ]
    return ordered.find((id) => !placedById.has(id) && id !== afterId) ?? afterId
  }

  function handleCell(r: number, c: number) {
    const ownerId = cellOwner.get(cellKey({ r, c }))
    if (ownerId) {
      // Remove the ship occupying this cell and select it for re-placement.
      setPlaced((prev) => prev.filter((s) => s.id !== ownerId))
      setSelectedId(ownerId)
      return
    }
    const spec = fleet.find((f) => f.id === selectedId)
    if (!spec || placedById.has(selectedId)) return
    const cells = canPlace(r, c, spec.size, orientation, boardSize, occupiedSet(placed))
    if (!cells) return
    const next = [...placed, { id: selectedId, cells }]
    setPlaced(next)
    // Auto-advance to the next ship still on the dock.
    const remaining = fleet
      .map((f) => f.id)
      .filter((id) => id !== selectedId && !placedById.has(id))
    if (remaining.length) setSelectedId(nextUnplaced(selectedId))
  }

  function getCell(r: number, c: number): CellVisual {
    const ownerId = cellOwner.get(cellKey({ r, c }))
    if (ownerId) {
      return {
        className: `${ownerId === selectedId ? 'bg-slate-900' : SHIP} border border-white/10`,
        clickable: true,
      }
    }
    return { className: WATER, clickable: true }
  }

  function fill() {
    setPlaced(randomFleet(fleet, boardSize))
  }

  function reset() {
    setPlaced([])
    setSelectedId(fleet[0].id)
  }

  function submit() {
    if (!allPlaced || submitting) return
    setSubmitting(true)
    router.post(
      `/play/${gameId}/place`,
      { ships: placed },
      { preserveScroll: true, onFinish: () => setSubmitting(false) }
    )
  }

  return (
    <Card className="bg-secondary-background">
      <CardContent className="space-y-4 pt-6">
        <Board
          boardSize={boardSize}
          getCell={getCell}
          onCellClick={handleCell}
          caption="Tape une case pour poser · re-tape un navire pour l'enlever"
        />

        <div className="flex flex-wrap justify-center gap-2">
          {fleet.map((ship) => {
            const isPlaced = placedById.has(ship.id)
            const isSelected = ship.id === selectedId
            return (
              <button
                key={ship.id}
                type="button"
                onClick={() => setSelectedId(ship.id)}
                className={`flex items-center gap-2 rounded-base border-2 border-border px-2 py-1 text-xs font-bold shadow-shadow transition-transform hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none ${
                  isSelected ? 'bg-main' : 'bg-secondary-background'
                } ${isPlaced ? 'opacity-50' : ''}`}
              >
                {isPlaced ? <Check className="h-3 w-3" /> : null}
                <span>{ship.name}</span>
                <span className="font-mono text-foreground/60">{ship.size}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="neutral" onClick={() => setOrientation((o) => (o === 'h' ? 'v' : 'h'))}>
            <RotateCw className="h-4 w-4" />
            {orientation === 'h' ? 'Horizontal' : 'Vertical'}
          </Button>
          <Button variant="neutral" onClick={fill}>
            <Shuffle className="h-4 w-4" />
            Aléatoire
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="reverse" onClick={reset}>
            Effacer
          </Button>
          <Button onClick={submit} disabled={!allPlaced || submitting}>
            <Swords className="h-4 w-4" />
            {submitting ? '...' : 'Prêt !'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---- waiting for opponent to be ready -----------------------------------

function ReadyWaiting({ me, boardSize, fleet }: { me: Me; boardSize: number; fleet: FleetShip[] }) {
  return (
    <Card className="bg-secondary-background">
      <CardHeader className="items-center text-center">
        <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-foreground/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Flotte déployée — en attente de l'adversaire
        </div>
      </CardHeader>
      <CardContent>
        <OwnBoard me={me} boardSize={boardSize} fleet={fleet} caption="Ta flotte" />
      </CardContent>
    </Card>
  )
}

// ---- battle & finished --------------------------------------------------

function Battle(props: ShowProps) {
  const { me, opponent, isMyTurn, status, boardSize, fleet, winner, gameId } = props
  if (!me || !opponent) return null

  const finished = status === 'finished'

  return (
    <div className="space-y-4">
      {finished && winner ? (
        <WinnerBanner winner={winner} />
      ) : (
        <TurnBanner isMyTurn={isMyTurn} opponentName={opponent.name} />
      )}

      <Card className="bg-secondary-background">
        <CardContent className="space-y-2 pt-6">
          <SectionTitle
            label={finished ? 'Flotte adverse' : 'Zone de tir adverse'}
            done={opponent.sunkShipIds.length}
            total={fleet.length}
          />
          <TrackingBoard
            opponent={opponent}
            boardSize={boardSize}
            canFire={isMyTurn && !finished}
            revealShips={
              finished
                ? winner?.reveal.find((r) => r.playerNumber === opponent.playerNumber)?.ships
                : undefined
            }
            onFire={(r, c) =>
              router.post(`/play/${gameId}/fire`, { r, c }, { preserveScroll: true })
            }
          />
        </CardContent>
      </Card>

      <Card className="bg-secondary-background">
        <CardContent className="space-y-2 pt-6">
          <SectionTitle
            label="Ta flotte"
            done={me.lostShipIds.length}
            total={fleet.length}
            danger
          />
          <OwnBoard me={me} boardSize={boardSize} fleet={fleet} />
        </CardContent>
      </Card>

      {finished ? (
        <Button asChild className="w-full">
          <Link href="/play">
            <RotateCcw className="h-4 w-4" />
            Nouvelle partie
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function SectionTitle({
  label,
  done,
  total,
  danger,
}: {
  label: string
  done: number
  total: number
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="font-mono text-xs uppercase tracking-widest text-foreground/70">
        {label}
      </span>
      <span className={`font-mono text-xs ${danger ? 'text-red-600' : 'text-foreground/70'}`}>
        {done}/{total} coulés
      </span>
    </div>
  )
}

function TurnBanner({ isMyTurn, opponentName }: { isMyTurn: boolean; opponentName: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMyTurn ? 'me' : 'them'}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={`rounded-base border-2 border-border p-3 text-center font-heading uppercase tracking-wide shadow-shadow ${
          isMyTurn ? 'bg-main' : 'bg-secondary-background text-foreground/70'
        }`}
      >
        {isMyTurn ? '🎯 À toi de tirer !' : `⏳ Au tour de ${opponentName}`}
      </motion.div>
    </AnimatePresence>
  )
}

function WinnerBanner({ winner }: { winner: Winner }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className={`flex items-center justify-center gap-2 rounded-base border-2 border-border p-4 text-center font-heading text-lg uppercase shadow-shadow ${
        winner.iWon ? 'bg-main' : 'bg-slate-800 text-white'
      }`}
    >
      {winner.iWon ? (
        <>
          <Trophy className="h-6 w-6" /> Victoire !
        </>
      ) : (
        <>
          <Skull className="h-6 w-6" /> Flotte coulée...
        </>
      )}
    </motion.div>
  )
}

// ---- boards -------------------------------------------------------------

function OwnBoard({
  me,
  boardSize,
  fleet,
  caption,
}: {
  me: Me
  boardSize: number
  fleet: FleetShip[]
  caption?: string
}) {
  const shipCellSet = useMemo(() => {
    const set = new Set<string>()
    me.ships.forEach((s) => s.cells.forEach((c) => set.add(cellKey(c))))
    return set
  }, [me.ships])

  const incoming = useMemo(() => new Set(me.incomingShots.map(cellKey)), [me.incomingShots])
  const lostCells = useMemo(() => {
    const set = new Set<string>()
    me.ships
      .filter((s) => me.lostShipIds.includes(s.id))
      .forEach((s) => s.cells.forEach((c) => set.add(cellKey(c))))
    return set
  }, [me.ships, me.lostShipIds])

  function getCell(r: number, c: number): CellVisual {
    const key = cellKey({ r, c })
    const isShip = shipCellSet.has(key)
    const wasShot = incoming.has(key)
    if (isShip && wasShot) {
      const sunk = lostCells.has(key)
      return {
        className: sunk ? SUNK : HIT,
        content: sunk ? <Skull className="h-4 w-4" /> : <Flame className="h-4 w-4" />,
      }
    }
    if (wasShot) return { className: WATER, content: missDot() }
    if (isShip) return { className: `${SHIP} border border-white/10` }
    return { className: WATER }
  }

  return (
    <Board
      boardSize={boardSize}
      getCell={getCell}
      caption={caption ?? `${me.hitCount} impact(s) reçu(s)`}
    />
  )
}

function TrackingBoard({
  opponent,
  boardSize,
  canFire,
  revealShips,
  onFire,
}: {
  opponent: Opponent
  boardSize: number
  canFire: boolean
  revealShips?: Ship[]
  onFire: (r: number, c: number) => void
}) {
  const shots = useMemo(() => {
    const map = new Map<string, boolean>()
    opponent.tracking.forEach((t) => map.set(cellKey({ r: t.r, c: t.c }), t.hit))
    return map
  }, [opponent.tracking])

  const sunk = useMemo(() => new Set(opponent.sunkCells.map(cellKey)), [opponent.sunkCells])
  const revealed = useMemo(() => {
    const set = new Set<string>()
    revealShips?.forEach((s) => s.cells.forEach((c) => set.add(cellKey(c))))
    return set
  }, [revealShips])

  function getCell(r: number, c: number): CellVisual {
    const key = cellKey({ r, c })
    if (shots.has(key)) {
      const hit = shots.get(key)
      if (hit) {
        const isSunk = sunk.has(key)
        return {
          className: isSunk ? SUNK : HIT,
          content: isSunk ? <Skull className="h-4 w-4" /> : <Flame className="h-4 w-4" />,
        }
      }
      return { className: WATER, content: missDot() }
    }
    // Reveal remaining enemy ships once the game is over.
    if (revealed.has(key)) return { className: `${SHIP} border border-white/10 opacity-70` }
    return { className: canFire ? WATER_TARGET : WATER, clickable: canFire }
  }

  return (
    <Board
      boardSize={boardSize}
      getCell={getCell}
      onCellClick={onFire}
      caption={canFire ? 'Tape une case pour tirer' : `${opponent.hitCount} coup(s) au but`}
    />
  )
}

// ---- spectator ----------------------------------------------------------

function Spectator() {
  return (
    <Card className="bg-secondary-background">
      <CardContent className="py-10 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-foreground/60">
          Mode spectateur — la bataille fait rage.
        </p>
      </CardContent>
    </Card>
  )
}
