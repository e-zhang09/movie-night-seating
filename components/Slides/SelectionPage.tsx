import Layout from '../Layout'
import PolygonPoints, { Point, Seat } from '../PolygonPoints'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { useRef, useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react'
import SeatsList from '../SeatsList'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Box, Button, Slide, Typography } from '@material-ui/core'
import { FirebaseDatabaseNode } from "@react-firebase/database"
import { AppContext } from '../../pages'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import PositionFixedKeepSpace from '../PositionFixedKeepSpace'
import { BASE_SUBMISSION_URL } from '../../utils/constants'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic'
import StickToTop from '../StickToTop'
import TopBarSlide from '../TopBarSlide'
import sleep from '../../utils/sleep'

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

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
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
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10
    },
    pickersContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',

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
        position: 'absolute',
        height: '100%',
        '& > div': {
            height: 'inherit'
        },
        [theme.breakpoints.down('md')]: {
            '& > div': {
                width: '100vw'
            }
            // transformOrigin: 'top left',
            // transform: `scale(${typeof window !== 'undefined' ? (((window?.innerWidth || svgSize.width) - 40) / svgSize.width) : 1})`,
            //translate(-${(1-correctRatio) * 100}%, -${(1-correctRatio) * 100}%) didnt work
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
    sizingContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        display: 'flex',
        justifyContent: 'flex-start',
        height: '100%',
        [theme.breakpoints.down('md')]: {
            height: '84%'
        }
        // overflowY: 'auto'
    },
    placeholderSizingContainer: {
        position: 'relative',
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
    setSelected: (selected: Seat) => void
}


const DynamicSuccessModal = dynamic(() => import('../SuccessModal'))

const SelectionPage = ({
                           setSlideNumber,
                           setSelected
                       }: Props) => {
    const [useCircle, setUseCircle] = useState(0)
    const [highlight, setHighlight] = useState(0)
    const [scrollToHighlight, setScrollToHighlight] = useState(0)

    const [successSubmit, setSuccessSubmit] = useState<boolean | Seat>(false)
    const [openModal, setOpenModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

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
    const { selected, user } = useContext(AppContext)

    const defaultScale = (typeof window !== 'undefined' && window.innerHeight) ? ((window.innerHeight - 170 - (window.innerWidth < 1279.95 ? (window.innerHeight * 0.05) : 0)) / svgSize.height - 0.05) : 0.5

    useEffect(() => {
        console.debug('default scale', defaultScale)
    }, [defaultScale])

    async function postData (url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        })
        return response.json() // parses JSON response into native JavaScript objects
    }

    const submitSeatingChoice = async () => {
        setSubmitting(true)
        setOpenModal(true)

        let errored = false
        // DEV_SUBMISSION_URL
        const result = await postData(BASE_SUBMISSION_URL, {
            idToken: user?.idToken,
            selected: selected?.i || -1
        }).catch(err => {
            errored = true
        })

        await sleep(Math.random() * 2500 + 2500) // lol

        if (result?.status !== 'successful' || errored) {
            console.debug('result', result)
            if (result?.reason === 'seat_already_taken') {
                toast.error('Oops! That seat has already been taken by someone else. Please select a new seat to continue!')
            } else if (result?.reason === 'already_registered') {
                toast.warn('Our records show that you\'ve already registered for this event but we will only allow one submission per student!')
            } else if (result?.reason === 'supply_id_token' || result?.reason === 'bad_id_token') {
                toast.error('Oops! Something went wrong with verifying your email address. Please refresh this page to try again!')
            } else {
                toast.error(`Error: ${result?.reason}, please try again later!`)
            }
            setOpenModal(false)
        } else {
            if (selected) {
                toast.success(`Success! You've signed up for seat #${selected.i}`)
                setSuccessSubmit(selected)
            } else {
                console.debug('wot') // should never happen
            }
        }
        setSubmitting(false)
    }

    return (
        <Layout title="Movie Night | Choose Your Seat">
            <DynamicSuccessModal open={openModal} seat={successSubmit} setOpen={bool => setOpenModal(bool)}
                submitting={submitting}/>
            <StickToTop>
                <TopBarSlide show={typeof selected?.i === 'number'} _key={'selection-page-slide-2'}>
                    <Button variant="contained" size={'small'} onClick={() => {
                        setSlideNumber(1)
                    }}>Back</Button>
                    <div>Selected seat #{selected?.i}!</div>
                    <Button variant="contained" size={'small'} onClick={() => {
                        if (successSubmit) {
                            setOpenModal(true)
                        } else {
                            console.debug('selected', selected, 'for user', user)
                            submitSeatingChoice().then(_r => {
                            })
                        }
                    }}>{successSubmit ? 'View Confirmation' : 'Submit'}</Button>
                </TopBarSlide>
                <TopBarSlide _key={'selection-page-slide-1'} show={typeof selected?.i !== 'number'}>
                    <Button variant="contained" size={'small'} onClick={() => {
                        setSlideNumber(1)
                    }}>Back</Button>
                    <div>Select a seat on the image!</div>
                    <Button variant="contained" size={'small'} disabled>Submit</Button>
                </TopBarSlide>
            </StickToTop>
            <div className={classes.sizingContainer}>
                <TransformWrapper
                    defaultScale={defaultScale}
                    defaultPositionX={0}
                    defaultPositionY={0}
                    options={{
                        minScale: Math.min(0.5, defaultScale - 0.05),
                        maxScale: Math.min(1.5, defaultScale - 0.05 + 1)
                    }}
                    wheel={{
                        step: 1
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
                            <div className={classes.locationHeadings}>
                                —— Screen ——
                            </div>
                            <div className={classes.pickersContainer}>
                                <UIContext.Provider value={{
                                    useCircle,
                                    highlight,
                                    scrollToHighlight,
                                    selected: selected?.i || -1
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
                                                                    setSelected(pt)
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
                                                            setSelected(pt)
                                                        }
                                                    }}
                                                />
                                            </>
                                        }}
                                    </FirebaseDatabaseNode>
                                </UIContext.Provider>
                            </div>
                            <div className={classes.locationHeadings}>
                                —— Gym ——
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
        </Layout>
    )
}

export default SelectionPage
