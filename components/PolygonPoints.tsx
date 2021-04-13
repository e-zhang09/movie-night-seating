import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { useContext } from 'react'
import { UIContext } from './Slides/SelectionPage'

export interface Point {
    x: number
    y: number
}

interface Props {
    fitInTo: Point[]
    onHover: (pt: (Point & { i: number, taken?: boolean })) => void
    onClick: (pt: (Point & { i: number, taken?: boolean })) => void
    seats: (Point & { i: number, taken?: boolean })[]
    padding: {
        left: number
        top: number
    }
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
        }
    },
    screenIndicator: {}
}))

const PolygonPoints = ({
                           fitInTo,
                           onHover,
                           seats,
                           padding,
                           onClick
                       }: Props) => {

    const classes = useStyles()
    const { useCircle, selected, highlight } = useContext(UIContext)

    return <>
        <svg height={Math.max(...fitInTo.map(pt => pt.y)) + padding.top * 2}
            width={Math.max(...fitInTo.map(pt => pt.x)) + padding.left * 2}
            onMouseOut={() => {
                onHover({ x: 0, y: 0, i: -1 })
            }}
        >
            <polygon points={
                fitInTo.map(pt => `${pt.x + padding.left},${pt.y + padding.top}`).join(' ')
            } style={{
                stroke: 'black',
                strokeWidth: 1
            }}/>
            {seats.map(seat =>
                <g key={seat.i} onMouseOver={() => onHover(seat)} onClick={() => onClick(seat)}
                    className={clsx(classes.seatGroup, (highlight === seat.i && 'highlighted'), seat.taken && 'taken', (selected === seat.i && 'selected'))}>
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
                        style={{
                            textAnchor: 'middle',
                            alignmentBaseline: 'middle',
                            fill: 'white'
                        }}>{seat.i}</text>
                </g>
            )}
        </svg>
    </>
}


export default PolygonPoints
