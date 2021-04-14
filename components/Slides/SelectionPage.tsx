import Layout from '../Layout'
import PolygonPoints, { Point } from '../PolygonPoints'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { useRef, useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react'
import SeatsList from '../SeatsList'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Box, Button, Slide } from '@material-ui/core'
import { FirebaseDatabaseNode } from "@react-firebase/database"
import { AppContext } from '../../pages'
import generateInitPoints from '../../utils/generateInitPoints'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import PositionFixedKeepSpace from '../PositionFixedKeepSpace'

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
        x: 40,
        y: 0
    },
    {
        x: 540 + 40,
        y: 0
    },
    {
        x: 472 + 40,
        y: 665
    },
    {
        x: 68 + 40,
        y: 665
    }
] as Point[]

const SecondQuadOutline = [
    {
        x: 0,
        y: 821
    },
    {
        x: 620,
        y: 821
    },
    {
        x: (620 - 488) / 2 + 488,
        y: 306 + 821
    },
    {
        x: (620 - 488) / 2,
        y: 306 + 821
    }
] as Point[]

const SeatMasks = [
    [ // top left corner
        {
            x: 40,
            y: 0
        },
        {
            x: 78 + 40,
            y: 0
        },
        {
            x: 12.8 + 40,
            y: 123
        }
    ],
    [ // top right corner
        {
            x: 540 + 40,
            y: 0
        },
        {
            x: 540 + 40 - 78,
            y: 0
        },
        {
            x: 540 + 40 - 12.8,
            y: 123
        }
    ],
    [ // path to projector
        {
            x: 260,
            y: 250 + 25
        },
        {
            x: 260 + 25,
            y: 250
        },
        {
            x: 260 + 75,
            y: 250
        },
        {
            x: 260 + 100,
            y: 250 + 25
        },
        {
            x: 260 + 100,
            y: 250 + 415
        },
        {
            x: 260,
            y: 250 + 415
        }
    ],
    [
        {
            x: 66.8,
            y: 821 + 200
        },
        {
            x: 66.8 + 487,
            y: 821 + 200
        },
        {
            x: 66.8 + 487,
            y: 821 + 219 + 87
        },
        {
            x: 66.8,
            y: 821 + 219 + 87
        }
    ]
]

const SpecialSpots = [
    {
        x: 260 + 50,
        y: 250 + 42,
        r: 28,
        color: 'rgb(46,111,214)',
        text: 'projector'
    }
]

// export const quadBackgroundColor = 'rgb(200,200,200)'
export const quadBackgroundColor = '#cee4b8'

const padding = {
    left: 18,
    top: 25
}

const svgSize = {
    width: Math.max(...[QuadOutline, SecondQuadOutline].map(bound => Math.max(...bound.map(pt => pt.x)))) + padding.left * 2,
    height: Math.max(...[QuadOutline, SecondQuadOutline].map(bound => Math.max(...bound.map(pt => pt.y)))) + padding.top * 2
}

const svgRatio = svgSize.height / svgSize.width

interface StyleProps {
    containerWidth: number
}

const useStyles = makeStyles<Theme, StyleProps>(theme => ({
    tools: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        position: 'fixed',
        right: '5vw',
        flexDirection: 'column-reverse',
        bottom: 20,
        '& > div': {
            marginBottom: 10
        },
        '& > div > *:nth-child(n + 2)': {
            marginLeft: 10
        },
        [theme.breakpoints.up('md')]: {
            flexDirection: 'column',
            top: 100,
            bottom: 'unset'
        },
        [theme.breakpoints.down('md')]: {
            '& > div:first-child': {
                display: 'none'
            },
            right: '2vw',
            bottom: 80,
            '& > div': {
                display: 'flex',
                flexDirection: 'column-reverse'
            },
            '& > div > *:nth-child(n + 2)': {
                marginLeft: 'unset',
                marginBottom: 10
            }
        }
    },
    locationHeadings: {
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 20
    },
    stickToTop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9,
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
            justifyContent: 'center',
            '& > div': {
                textAlign: 'center'
            }
        },
        '& > *': {
            marginLeft: 12
        },
        '& > *:first-child': {
            marginLeft: 0
        },
        '& > div': {
            flex: 1
        }
    },
    pickersContainer: {
        [theme.breakpoints.down('md')]: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            height: 'calc(100vh - 238px)'
            // paddingBottom: `calc(${svgRatio * 100}% - ${svgRatio * 40}px)`
        },
        [theme.breakpoints.up('md')]: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        '& > .selection-list-container': {
            background: quadBackgroundColor
        }
    },
    listPicker: {
        background: 'repeating-linear-gradient(28deg, rgb(250,250,250), rgb(250,250,250) 10px, rgb(245,245,245) 10px, rgb(245,245,245) 20px)',
        [theme.breakpoints.down('md')]: {
            position: 'absolute',
            maxHeight: 'calc(100vh - 238px)',
            '& > div': {
                maxHeight: 'calc(100vh - 238px)',
                width: '100vw'
            },
            // transformOrigin: 'top left',
            // transform: `scale(${typeof window !== 'undefined' ? (((window?.innerWidth || svgSize.width) - 40) / svgSize.width) : 1})`,
            //translate(-${(1-correctRatio) * 100}%, -${(1-correctRatio) * 100}%) didnt work
            top: 0
        }
    },
    pickerOverallContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        [theme.breakpoints.up('md')]: {
            padding: '20px 0 90px 0',
            width: 'unset'
        }
    },
    scrollContainer: {
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        width: '100%'
    },
    sizingContainer: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: 'calc(100vh - 160px)'
        // overflowY: 'auto'
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

    // const radius = 40 // 4ft

    // const seats = useMemo(() => generateInitPoints([QuadOutline, SecondQuadOutline], radius, SeatMasks).map((pt, i) => ({
    //     ...pt,
    //     i: i + 1,
    //     // taken: i % 2 === 0,
    //     taken: Math.random() > 0.8
    // })), [])

    // console.debug(seats)

    const classes = useStyles({
        containerWidth: 1
    })
    const { selected } = useContext(AppContext)

    return (
        <Layout title="Movie Night | Choose Your Seat">
            <PositionFixedKeepSpace className={classes.stickToTop}>
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
                        <Button variant="contained" size={'small'} onClick={() => {
                            setSlideNumber(1)
                        }}>Back</Button>
                        <div>Selected seat #{selected}!</div>
                        <Button variant="contained" size={'small'} onClick={() => {
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
                    <Box className={classes.topBarHorizontalContainer} boxShadow={4}>
                        <Button variant="contained" size={'small'} onClick={() => {
                            setSlideNumber(1)
                        }}>Back</Button>
                        <div>Select a seat on the image!</div>
                        <Button variant="contained" size={'small'} disabled>Next</Button>
                    </Box>
                </Slide>
            </PositionFixedKeepSpace>
            <div className={classes.sizingContainer}>
                <div className={classes.scrollContainer}>
                    <div className={classes.pickerOverallContainer}>
                        <TransformWrapper
                            defaultScale={typeof window !== 'undefined' && window.innerWidth < 600 ? 0.37 : 1}
                            defaultPositionX={0}
                            defaultPositionY={0}
                            options={{
                                minScale: typeof window !== 'undefined' && window.innerWidth < 600 ? 0.37 : 1,
                                maxScale: 2.5
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
                                        marginBottom: 10
                                    }} className={classes.locationHeadings}>
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
                                                                    specialSpots={SpecialSpots}
                                                                    seatMasks={SeatMasks}
                                                                    padding={padding}
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
                                                                    bounds={[QuadOutline, SecondQuadOutline]}
                                                                    seats={seats}
                                                                />
                                                            </TransformComponent>
                                                        </div>
                                                        <SeatsList
                                                            svgSize={svgSize}
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
                                        marginTop: 10
                                    }} className={classes.locationHeadings}>
                                        —— Office ——
                                    </div>
                                    <div className={classes.tools}>
                                        <div>
                                            <Button variant="contained" color="default"
                                                onClick={() => setUseCircle(prev => prev > 0 ? 0 : 3)}>
                                                Toggle safety radius (3ft)
                                            </Button>
                                        </div>
                                        <div>
                                            <Button variant="contained" color="default"
                                                onClick={zoomOut}>
                                                <ZoomOutIcon/>
                                            </Button>
                                            <Button variant="contained" color="default"
                                                onClick={zoomIn}>
                                                <ZoomInIcon/>
                                            </Button>
                                        </div>
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
