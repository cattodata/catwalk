type CattoState = 'idle' | 'walking' | 'cheering' | 'thinking'

interface CattoProps {
  scale?: number
  state?: CattoState
  /** 1 = facing right, -1 = facing left (mirror) */
  dir?: 1 | -1
  withSign?: boolean
}

const C = {
  body: '#F5C842',
  belly: '#FFE8A3',
  ear: '#FF6B9D',
  ink: '#2D2418',
  white: '#FFFFFF',
  pack: '#FF6B9D',
  strap: '#F5C842',
  nose: '#FF6B9D',
}

export function Catto({ scale = 2, state = 'idle', dir = 1, withSign = false }: CattoProps) {
  const px = scale
  const Px = ({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) => (
    <rect x={x * px} y={y * px} width={w * px} height={h * px} fill={fill} shapeRendering="crispEdges" />
  )

  const animClass =
    state === 'walking'   ? 'cc-walk'
    : state === 'idle'    ? 'cc-idle'
    : state === 'cheering' ? 'cc-cheer'
    : 'cc-think'

  return (
    <div
      className={`catto-wrap ${animClass}`}
      style={{ display: 'inline-block', transform: `scaleX(${dir})`, transformOrigin: 'center' }}
    >
      <svg width={20 * px} height={18 * px} viewBox={`0 0 ${20 * px} ${18 * px}`} style={{ overflow: 'visible' }}>
        <Px x={4} y={2} w={2} h={2} fill={C.ink} />
        <Px x={11} y={2} w={2} h={2} fill={C.ink} />
        <Px x={4} y={3} w={1} h={1} fill={C.ear} />
        <Px x={12} y={3} w={1} h={1} fill={C.ear} />
        <Px x={3} y={4} w={11} h={1} fill={C.ink} />
        <Px x={2} y={5} w={1} h={4} fill={C.ink} />
        <Px x={14} y={5} w={1} h={4} fill={C.ink} />
        <Px x={3} y={5} w={11} h={4} fill={C.body} />
        <Px x={5} y={6} w={1} h={2} fill={C.ink} />
        <Px x={11} y={6} w={1} h={2} fill={C.ink} />
        <Px x={5} y={6} w={1} h={1} fill={C.white} />
        <Px x={11} y={6} w={1} h={1} fill={C.white} />
        <Px x={5} y={7} w={1} h={1} fill={C.ink} />
        <Px x={11} y={7} w={1} h={1} fill={C.ink} />
        <Px x={8} y={7} w={1} h={1} fill={C.nose} />
        <Px x={3} y={7} w={1} h={1} fill={C.belly} />
        <Px x={13} y={7} w={1} h={1} fill={C.belly} />
        <Px x={3} y={9} w={11} h={1} fill={C.ink} />
        <Px x={2} y={10} w={1} h={4} fill={C.ink} />
        <Px x={14} y={10} w={1} h={4} fill={C.ink} />
        <Px x={3} y={14} w={11} h={1} fill={C.ink} />
        <Px x={3} y={10} w={11} h={4} fill={C.body} />
        <Px x={6} y={11} w={5} h={2} fill={C.belly} />
        <Px x={9} y={9} w={4} h={3} fill={C.pack} />
        <Px x={8} y={9} w={1} h={3} fill={C.ink} />
        <Px x={13} y={9} w={1} h={3} fill={C.ink} />
        <Px x={9} y={9} w={4} h={1} fill={C.ink} />
        <Px x={9} y={10} w={4} h={1} fill={C.strap} />
        <Px x={15} y={11} w={1} h={1} fill={C.body} />
        <Px x={16} y={10} w={1} h={1} fill={C.body} />
        <Px x={17} y={9} w={1} h={1} fill={C.body} />
        <Px x={17} y={8} w={1} h={1} fill={C.ink} />
        <Px x={16} y={9} w={1} h={1} fill={C.ink} />
        <Px x={15} y={10} w={1} h={1} fill={C.ink} />
        <Px x={4} y={15} w={2} h={1} fill={C.ink} />
        <Px x={11} y={15} w={2} h={1} fill={C.ink} />

        {state === 'cheering' && (
          <g>
            <Px x={1} y={9} w={1} h={1} fill={C.body} />
            <Px x={0} y={8} w={1} h={1} fill={C.ink} />
            <Px x={15} y={9} w={1} h={1} fill={C.body} />
            <Px x={16} y={8} w={1} h={1} fill={C.ink} />
            <Px x={1} y={3} w={1} h={1} fill="#F5C842" />
            <Px x={17} y={3} w={1} h={1} fill="#F5C842" />
            <Px x={9} y={0} w={1} h={1} fill="#F5C842" />
          </g>
        )}

        {state === 'thinking' && (
          <g className="cc-think-bubble" style={{ transform: `scaleX(${dir})`, transformOrigin: 'center' }}>
            <Px x={15} y={1} w={3} h={3} fill={C.white} />
            <Px x={14} y={2} w={1} h={2} fill={C.white} />
            <Px x={15} y={4} w={1} h={1} fill={C.white} />
            <Px x={16} y={2} w={1} h={1} fill={C.ink} />
            <Px x={16} y={3} w={1} h={1} fill={C.ink} />
            <Px x={16} y={5} w={1} h={1} fill={C.ink} />
          </g>
        )}

        {withSign && (
          <g>
            <Px x={-1} y={11} w={4} h={3} fill={C.white} />
            <Px x={-2} y={11} w={1} h={3} fill={C.ink} />
            <Px x={3} y={11} w={1} h={3} fill={C.ink} />
            <Px x={-1} y={11} w={4} h={1} fill={C.ink} />
            <Px x={-1} y={14} w={4} h={1} fill={C.ink} />
            <Px x={0} y={12} w={1} h={1} fill={C.ear} />
            <Px x={1} y={12} w={1} h={1} fill={C.body} />
            <Px x={0} y={13} w={1} h={1} fill={C.body} />
            <Px x={1} y={13} w={1} h={1} fill={C.ear} />
          </g>
        )}
      </svg>
    </div>
  )
}
