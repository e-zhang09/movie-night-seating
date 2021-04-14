import { Point } from './PolygonPoints'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { useContext, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { UIContext } from './Slides/SelectionPage'
import { Box } from '@material-ui/core'

interface Props {
    seats: (Point & { i: number, taken?: boolean })[]
    padding: {
        left: number
        top: number
    },
    svgSize: {
        width: number,
        height: number
    },
    onHover: (selection: Point & { i: number, taken?: boolean }) => void
    onClick: (selection: Point & { i: number, taken?: boolean }) => void
}

const useStyles = makeStyles<Theme, Pick<Props, 'padding' | 'svgSize'>>(theme => ({
    listContainer: {
        position: 'fixed',
        right: '5vw',
        display: 'flex',
        margin: 'auto',
        top: 0,
        bottom: 70,
        [theme.breakpoints.down('md')]: {
            display: 'none'
            // position: 'absolute',
            // bottom: 0,
            // flexDirection: 'row',
            // maxWidth: '100vw',
            // overflowX: 'scroll'
        },
        [theme.breakpoints.up('md')]: {
            maxHeight: props => Math.min(props.svgSize.height - (props.padding.left * 2), 500),
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
        textAlign: 'center',
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
            background: 'rgba(50,50,50, 0.2)',
            color: 'rgba(255,255,255,0.5)',
            position: 'relative',
            '&::after': {
                top: '50%',
                left: '50%',
                width: 22,
                height: 2,
                content: '""',
                position: 'absolute',
                backgroundColor: 'black',
                transform: 'translate(-50%, -50%)'
            }
        }
    }
}))

const SeatsList = ({ seats, padding, onHover, onClick, svgSize }: Props) => {
    const classes = useStyles({ padding, svgSize })

    const listRef = useRef(null)
    const { highlight, scrollToHighlight, selected } = useContext(UIContext)

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
        <Box boxShadow={4}
            className={clsx(classes.listContainer, 'selection-list-container')} {...{ ref: listRef } as any}
            onMouseOut={() => {
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
        </Box>
    </>
}

export default SeatsList
