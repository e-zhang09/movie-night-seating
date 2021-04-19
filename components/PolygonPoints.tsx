import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useContext } from 'react'
import { quadBackgroundColor, UIContext } from './Slides/SelectionPage'
import { AppContext } from '../pages'

export interface Point {
    x: number
    y: number
}

export interface Seat extends Point {
    i: number
}

interface Props {
    bounds: Point[][]
    onHover: (pt: (Point & { i: number, taken?: boolean })) => void
    onClick: (pt: (Point & { i: number, taken?: boolean })) => void
    seats: (Point & { i: number, taken?: boolean })[]
    padding: {
        left: number
        top: number
    },
    seatMasks: Point[][],
    specialSpots: (Point & { text: string, r: number, color: string })[]
}


const rectSize = {
    width: 50,
    height: 40
}

const useStyles = makeStyles(theme => ({
    seatGroup: {
        '&:hover:not(.taken), &.highlighted:not(.taken), &.selected': {
            cursor: 'pointer',
            '& > rect, & > circle': {
                fill: 'rgb(100,120,175)'
            }
        },
        '& > rect, & > circle': {
            fill: 'rgb(50,50,50)',
            transition: 'all 250ms ease-in-out'
        },

        '&.taken:hover': {
            cursor: 'not-allowed'
        },
        '&.taken > rect, &.taken > circle': {
            opacity: 0.2
        },

        '&.submitted > rect, &.submitted > circle': {
            opacity: 1,
            fill: 'rgb(86,200,122)',
            position: 'relative',
            '&:after':{
                content: 'hi',
                position: 'absolute',
                top: 0,
                left: 0
            }
        },

        '& > text': {
            textAnchor: 'middle',
            alignmentBaseline: 'middle',
            fill: 'white'
        },
        '& > line': {
            stroke: 'rgb(50,50,50)',
            strokeWidth: 2
        }
    },
    screenIndicator: {},
    quadPolygon: {
        fill: quadBackgroundColor,
        stroke: 'black',
        strokeWidth: 1
    },
    maskPolygon: {
        fill: 'url(#diagonalHatch)',
        stroke: 'black',
        strokeWidth: 1
    },
    maskPolygonFill: {
        fill: 'rgb(208,198,198)'
    }
}))

const PolygonPoints = ({
                           bounds,
                           onHover,
                           seats,
                           padding,
                           onClick,
                           seatMasks,
                           specialSpots
                       }: Props) => {

    const classes = useStyles()
    const { useCircle, selected, highlight } = useContext(UIContext)
    const { submittedSeat } = useContext(AppContext)

    const svgHeight = Math.max(...bounds.map(bound => Math.max(...bound.map(pt => pt.y)))) + padding.top * 2
    const svgWidth = Math.max(...bounds.map(bound => Math.max(...bound.map(pt => pt.x)))) + padding.left * 2

    return <>
        <svg height={svgHeight}
            width={svgWidth}
            onMouseOut={() => {
                onHover({ x: 0, y: 0, i: -1 })
            }}
        >
            <defs>
                <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="10"
                        style={{
                            stroke: 'black',
                            strokeWidth: 1
                        }}/>
                </pattern>
            </defs>
            <g>
                {bounds.map((bound, i) =>
                    <polygon
                        key={`bound-${i}`}
                        points={
                            bound.map(pt => `${pt.x + padding.left},${pt.y + padding.top}`).join(' ')
                        }
                        className={classes.quadPolygon}
                    />
                )}
            </g>
            <g>
                {seatMasks.map((mask, i) =>
                    <Fragment key={`mask-${i}`}>
                        <polygon
                            points={
                                mask.map(pt => `${pt.x + padding.left},${pt.y + padding.top}`).join(' ')
                            }
                            className={classes.maskPolygonFill}
                        />
                        <polygon
                            points={
                                mask.map(pt => `${pt.x + padding.left},${pt.y + padding.top}`).join(' ')
                            }
                            className={classes.maskPolygon}
                        />
                    </Fragment>
                )}
            </g>
            <g>
                {specialSpots.map((spot, i) =>
                    <Fragment key={`spot-${spot.text}`}>
                        <circle
                            r={spot.r}
                            cx={spot.x + padding.left}
                            cy={spot.y + padding.top}
                            style={{
                                fill: spot.color
                            }}
                        />
                        <text
                            x={spot.x + padding.left}
                            y={spot.y + padding.top}
                            style={{
                                textAnchor: 'middle',
                                alignmentBaseline: 'middle',
                                fill: 'white',
                                fontSize: '75%'
                            }}
                        >{spot.text}</text>
                    </Fragment>
                )}
            </g>
            <g>
                {seats.map(seat =>
                    <g key={seat.i} onMouseOver={() => onHover(seat)} onClick={() => onClick(seat)}
                        className={clsx(classes.seatGroup, (highlight === seat.i && 'highlighted'), seat.taken && 'taken', (selected === seat.i && 'selected'), (submittedSeat && submittedSeat?.i === seat.i && 'submitted'))}>
                        {useCircle > 0
                            ? <circle
                                cx={seat.x + padding.left}
                                cy={seat.y + padding.top}
                                r={useCircle * 10}/>
                            : <rect width={rectSize.width} height={rectSize.height}
                                x={seat.x - rectSize.width / 2 + padding.left}
                                y={seat.y - rectSize.height / 2 + padding.top}/>}
                        <text
                            x={seat.x + padding.left}
                            y={seat.y + 1 + padding.top}
                        >{seat.i}</text>
                        {seat.taken && !submittedSeat &&
                        <line x1={seat.x - 10 + padding.left} x2={seat.x + 10 + padding.left} y1={seat.y + padding.top}
                            y2={seat.y + padding.top}/>}
                    </g>
                )}
            </g>
        </svg>
    </>
}


export default PolygonPoints
