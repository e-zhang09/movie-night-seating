import { CircularProgress, Slide } from '@material-ui/core'
import { createContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LandingPage from '../components/Slides/LandingPage'
import { Seat } from '../components/PolygonPoints'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

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
    previouslySubmitted: null as null | Seat | false
})

const index = () => {
    const debugSkipToSlide = process.env.NODE_ENV !== 'development' ? 1 : 1

    const [slideNumber, setSlideNumber] = useState(debugSkipToSlide)
    const [user, setUser] = useState<null | User>(null)
    const [selected, setSelected] = useState<null | Seat>(null)
    const [previouslySubmitted, setPreviouslySubmitted] = useState<null | Seat | false>(null)

    useEffect(() => {
        // @ts-ignore
        DynamicSelectionPage.render.preload()
    }, [])

    useEffect(() => {
        if (user && typeof user.uid === 'string') {
            ;(async function () {
                const db = firebase.database()
                const _doc = await db.ref(`private-seating-choices/${user.uid}`).once('value')
                const doc = _doc.val()
                if(doc){
                    // TODO: add actual seats into previously submitted stuf
                    setPreviouslySubmitted({
                        x: 0,
                        y: 0,
                        i: 18
                    })
                }else{
                    setPreviouslySubmitted(false)
                }
                console.debug(doc)
            })()
        }
    }, [user])


    return <AppContext.Provider value={{
        user,
        selected,
        previouslySubmitted
    }}>
        {slideNumber === 1
        && <span>
                <LandingPage setSlideNumber={setSlideNumber} setUser={setUser}/>
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
                <DynamicSelectionPage setSlideNumber={setSlideNumber} setSelected={setSelected}/>
            </span>
        }
    </AppContext.Provider>
}

export default index
