import { CircularProgress, Slide } from '@material-ui/core'
import { createContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LandingPage from '../components/Slides/LandingPage'
import { Seat } from '../components/PolygonPoints'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { CONTACT_EMAIL } from '../utils/constants'

const DynamicSelectionPage = dynamic(() => import('../components/Slides/SelectionPage'), {
    loading: ({ error, isLoading, pastDelay }) => <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
    }}>
        {error ? <h1>Errored, please try again in a little bit!</h1> : <>
            <CircularProgress/>
            <h1>Loading...</h1>
        </>}
    </div>
})

export interface User {
    displayName?: string,
    email: string,
    idToken: string
    given_name?: string
    uid?: string
}

export const AppContext = createContext({
    user: null as null | User,
    selected: null as null | Seat,
    submittedSeat: null as null | Seat | false,
    landingSlide: 0 as number, // 0..2
    isPrivileged: false
})

const index = () => {
    const debugSkipToSlide = process.env.NODE_ENV !== 'development' ? 1 : 1

    const [slideNumber, setSlideNumber] = useState(debugSkipToSlide)
    const [user, setUser] = useState<null | User>(null)
    const [selected, setSelected] = useState<null | Seat>(null)
    const [submittedSeat, setSubmittedSeat] = useState<null | Seat | false>(null)
    const [landingSlide, setLandingSlide] = useState(0)
    const [isPrivileged, setIsPrivileged] = useState<boolean>(false)

    useEffect(() => {
        // @ts-ignore
        DynamicSelectionPage.render.preload()
    }, [])

    useEffect(() => {
        if (user && typeof user.uid === 'string') {
            ;(async function () {
                const db = firebase.database()

                if (user?.email.includes(CONTACT_EMAIL) || process.env.NODE_ENV === 'development') {
                    const _priv = await db.ref('private-seating-choices/000privilegeCheck000').once('value')
                    const isPrivileged = _priv.val() === '__hi__'
                    if(isPrivileged) {
                        setIsPrivileged(true)
                    }
                }

                const _doc = await db.ref(`private-seating-choices/${user.uid}`).once('value')
                const doc = _doc.val()
                console.debug(doc)
                if (doc) {
                    setSubmittedSeat({
                        x: -1,
                        y: -1,
                        i: doc.selected || null
                    })
                } else {
                    setSubmittedSeat(false)
                }
            })()
        }
    }, [user])


    return <AppContext.Provider value={{
        user,
        selected,
        submittedSeat,
        landingSlide,
        isPrivileged
    }}>
        {slideNumber === 1
        && <span>
                <LandingPage setSlideNumber={setSlideNumber} setUser={setUser} setLandingSlide={setLandingSlide}/>
            </span>
        }
        {slideNumber === 2
        && <span style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column'
        }}>
                <DynamicSelectionPage setSlideNumber={setSlideNumber} setSelected={setSelected}
                    setSubmittedSeat={setSubmittedSeat}/>
            </span>
        }
    </AppContext.Provider>
}

export default index
