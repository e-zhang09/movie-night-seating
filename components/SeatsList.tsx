import { Point } from './PolygonPoints'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { useContext, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { UIContext } from './Slides/SelectionPage'

interface Props {
    seats: (Point & { i: number, taken?: boolean })[]
    padding: {
        left: number
        top: number
    }
    onHover: (selection: Point & { i: number, taken?: boolean }) => void
    onClick: (selection: Point & { i: number, taken?: boolean }) => void
}

const useStyles = makeStyles<Theme, Pick<Props, 'padding'>>(theme => ({
    listContainer: {
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            display: 'none'
            // position: 'absolute',
            // bottom: 0,
            // flexDirection: 'row',
            // maxWidth: '100vw',
            // overflowX: 'scroll'
        },
        [theme.breakpoints.up('md')]: {
            marginTop: props => props.padding.top,
            marginLeft: props => props.padding.left,
            maxHeight: props => 665,
            overflowY: 'scroll',
            flexDirection: 'column'
        }
    },
    listItem: {
        [theme.breakpoints.down('md')]: {
            padding: '10px 10px'
        },
        [theme.breakpoints.up('md')]: {
            padding: '8px 40px'
        },
        '&:hover': {
            cursor: 'pointer'
        },
        background: 'rgb(50,50,50)',
        color: 'white',
        transition: 'all 250ms ease-in-out',
        '&:hover:not(.taken), &.highlighted:not(.taken), &.selected': {
            background: 'rgb(100,120,175)'
        },
        '&.taken:hover': {
            cursor: 'not-allowed'
        },
        '&.taken': {
            opacity: 0.2
        }
    }
}))

const SeatsList = ({ seats, padding, onHover, onClick }: Props) => {
    const classes = useStyles({ padding })

    const listRef = useRef(null)
    const {highlight, scrollToHighlight, selected} = useContext(UIContext)

    const listRefCurrent = listRef.current
    useEffect(() => {
        // console.debug('scroll to: ', scrollToHighlight)
        if (!listRefCurrent) return
        // @ts-ignore
        const listItem = listRefCurrent.querySelector(`[data-list-target="${scrollToHighlight}"]`)
        if (!listItem) return
        listItem.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        })
    }, [scrollToHighlight, listRefCurrent])

    return <>
        <div className={clsx(classes.listContainer, 'selection-list-container')} ref={listRef} onMouseOut={() => {
            onHover({ x: 0, y: 0, i: -1 })
        }}>
            {seats.map(seat =>
                <div key={seat.i}
                    className={clsx(classes.listItem, (highlight === seat.i && 'highlighted'), seat.taken && 'taken', (selected === seat.i && 'selected'))}
                    data-list-target={seat.i}
                    onMouseOver={() => {
                        onHover(seat)
                    }}
                    onClick={() => onClick(seat)}>
                    {seat.i}
                </div>
            )}
        </div>
    </>
}

export default SeatsList
