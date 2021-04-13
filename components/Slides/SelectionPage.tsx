import Layout from '../Layout'
import PolygonPoints, { Point } from '../PolygonPoints'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { useRef, useState, createContext, useContext } from 'react'
import SeatsList from '../SeatsList'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Button, Slide } from '@material-ui/core'
import { FirebaseDatabaseNode } from "@react-firebase/database"
import { AppContext } from '../../pages'

// coordinate system: 0,0 top left

// *more accurate*
/*
----540----
     |
    665
     |
  --400--
 */
// const QuadOutline = [
//     {
//         x: 0,
//         y: 0
//     },
//     {
//         x: 540,
//         y: 0
//     },
//     {
//         x: 470,
//         y: 665
//     },
//     {
//         x: 70,
//         y: 665
//     }
// ] as Point[]

// *less.. accurate*
/*
----540----
     |
    665
     |
  --400--
 */
const QuadOutline = [
    {
        x: 0,
        y: 0
    },
    {
        x: 540,
        y: 0
    },
    {
        x: 472,
        y: 665
    },
    {
        x: 68,
        y: 665
    }
] as Point[]

const backgroundColor = 'rgb(200,200,200)'

const padding = {
    left: 15,
    top: 15
}

const hardCodedSVGSize = {
    width: 540 + 2 * padding.left,
    height: 665 + 2 * padding.top
}

const svgRatio = hardCodedSVGSize.height / hardCodedSVGSize.width

const useStyles = makeStyles(theme => ({
    tools: {
        display: 'flex',
        justifyContent: 'center'
    },
    stickToTop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: 'rgb(250,250,250)',
        fontSize: 18,
        fontWeight: 900
    },
    topBarHorizontalContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 15px',
        [theme.breakpoints.up('md')]: {
            padding: '20px 50px',
            justifyContent: 'center'
        },
        '& > *': {
            marginLeft: 20
        },
        '& > *:first-child': {
            marginLeft: 0
        },
        '& > div': {
            flex: 1,
            maxWidth: 200
        }
    },
    pickersContainer: {
        [theme.breakpoints.down('md')]: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            paddingBottom: `${svgRatio * 100}%`
        },
        [theme.breakpoints.up('md')]: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        '& svg > polygon': {
            fill: backgroundColor
        },
        '& > .selection-list-container': {
            background: backgroundColor
        }
    },
    listPicker: {
        [theme.breakpoints.up('md')]: {
            marginLeft: 110
        },
        [theme.breakpoints.down('md')]: {
            position: 'absolute',
            transformOrigin: 'top left',
            transform: `scale(${typeof window !== 'undefined' ? ((window?.innerWidth || hardCodedSVGSize.width) / hardCodedSVGSize.width) : 1})`,
            //translate(-${(1-correctRatio) * 100}%, -${(1-correctRatio) * 100}%) didnt work
            top: 0
        }
    },
    pickerOverallContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    scrollContainer: {
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        width: '100%'
    },
    sizingContainer: {
        marginTop: 80,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: 'calc(100vh - 80px)'
    },
    placeholderSizingContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}))

export const UIContext = createContext({
    useCircle: 0,
    scrollToHighlight: 0,
    highlight: 0,
    selected: null as null | number
})

interface Props {
    setSlideNumber: (slide: number) => void,
    setSelected: (selected: number) => void
}

const SelectionPage = ({ setSlideNumber, setSelected }: Props) => {
    const [useCircle, setUseCircle] = useState(0)
    const [highlight, setHighlight] = useState(0)
    const [scrollToHighlight, setScrollToHighlight] = useState(0)

    // const seats = useMemo(() => generateInitPoints(QuadOutline, radius).map((pt, i) => ({
    //     ...pt,
    //     i: i + 1,
    //     // taken: i % 2 === 0,
    //     taken: Math.random() > 0.8
    // })), [])

    const classes = useStyles()
    const { selected } = useContext(AppContext)

    return (
        <Layout title="Movie Night | Choose Your Seat">
            <div className={classes.stickToTop}>
                <Slide
                    key={typeof selected === 'number' ? `selected` : `-1`}
                    direction={'right'}
                    in={typeof selected === 'number'}
                    timeout={500}
                    unmountOnExit={true}
                    addEndListener={(node, done) =>
                        node.addEventListener &&
                        node.addEventListener('transitionend', done, false)
                    }
                >
                    <div className={classes.topBarHorizontalContainer}>
                        <Button variant="contained" onClick={() => {
                            setSlideNumber(1)
                        }}>Back</Button>
                        <div>Selected seat #{selected}!</div>
                        <Button variant="contained" onClick={() => {
                            setSlideNumber(3)
                        }}>Next</Button>
                    </div>
                </Slide>
                <Slide
                    key={typeof selected === 'number' ? `selected-now` : `now-1`}
                    direction={'right'}
                    in={typeof selected !== 'number'}
                    timeout={500}
                    unmountOnExit={true}
                    addEndListener={(node, done) =>
                        node.addEventListener &&
                        node.addEventListener('transitionend', done, false)
                    }
                >
                    <div className={classes.topBarHorizontalContainer}>
                        <Button variant="contained" onClick={() => {
                            setSlideNumber(1)
                        }}>Back</Button>
                        <div>Click on the image to select a seat!</div>
                    </div>
                </Slide>
            </div>
            <div className={classes.sizingContainer}>
                <div className={classes.scrollContainer}>
                    <div className={classes.pickerOverallContainer}>
                        <TransformWrapper
                            defaultScale={typeof window !== 'undefined' && window.innerWidth < 600 ? 0.9 : 1}
                            defaultPositionX={0}
                            defaultPositionY={0}
                            options={{
                                minScale: typeof window !== 'undefined' && window.innerWidth < 600 ? 0.8 : 1,
                                maxScale: 3
                            }}
                            wheel={{
                                step: 2
                            }}
                            zoomIn={{
                                step: 15
                            }}
                            zoomOut={{
                                step: 20
                            }}
                        >
                            {/* @ts-ignore */}
                            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                                <>
                                    <div style={{
                                        textAlign: 'center'
                                    }}>
                                        —— Screen ——
                                    </div>
                                    <div className={classes.pickersContainer}>
                                        <UIContext.Provider value={{
                                            useCircle,
                                            highlight,
                                            scrollToHighlight,
                                            selected
                                        }}>
                                            <FirebaseDatabaseNode path={'/public-seating-arrangement'}
                                                orderByValue={'i'}>
                                                {d => {
                                                    if (d.isLoading || (!d.isLoading && !d.value)) {
                                                        return <Box
                                                            className={classes.placeholderSizingContainer}>loading...</Box>
                                                    }
                                                    if (!d.value) {
                                                        return <Box className={classes.placeholderSizingContainer}>something
                                                            went wrong! it should all work in a sec.</Box>
                                                    }
                                                    const seats = Object.keys(d.value).map(_k => d.value[_k]).sort((a, b) => a.i - b.i)
                                                    return <>
                                                        <div className={classes.listPicker}>
                                                            <TransformComponent>
                                                                <PolygonPoints
                                                                    padding={padding}
                                                                    fitInTo={QuadOutline}
                                                                    onHover={pt => {
                                                                        // console.debug(pt, pt.taken, pt.i)
                                                                        if (highlight !== pt.i && !pt.taken) {
                                                                            setHighlight(pt.i)
                                                                            setScrollToHighlight(pt.i)
                                                                        }
                                                                    }}
                                                                    onClick={pt => {
                                                                        if (!pt.taken) {
                                                                            setSelected(pt.i)
                                                                        }
                                                                    }}
                                                                    seats={seats}
                                                                />
                                                            </TransformComponent>
                                                        </div>
                                                        <SeatsList
                                                            seats={seats}
                                                            padding={padding}
                                                            onHover={pt => {
                                                                if (highlight !== pt.i && !pt.taken) {
                                                                    setHighlight(pt.i)
                                                                }
                                                            }}
                                                            onClick={pt => {
                                                                if (!pt.taken) {
                                                                    setSelected(pt.i)
                                                                }
                                                            }}
                                                        />
                                                    </>
                                                }}
                                            </FirebaseDatabaseNode>
                                        </UIContext.Provider>
                                    </div>
                                    <div style={{
                                        textAlign: 'center'
                                    }}>
                                        —— Office ——
                                    </div>
                                    <div className={classes.tools} style={{ marginBottom: 80, marginTop: 10 }}>
                                        <button onClick={zoomIn}>+</button>
                                        <button onClick={zoomOut}>-</button>
                                        <button onClick={() => setUseCircle(prev => prev > 0 ? 0 : 3)}>Toggle safety
                                            radius
                                            (3ft)
                                        </button>
                                    </div>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default SelectionPage
