import { CircularProgress, Slide } from '@material-ui/core'
import { createContext, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LandingPage from '../components/Slides/LandingPage'
import ConfirmationPage from '../components/Slides/ConfirmationPage'

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
    displayName: string,
    email: string,
    idToken: string
}

export const AppContext = createContext({
    user: null as null | User,
    selected: null as null | number
})

const index = () => {
    const [slideNumber, setSlideNumber] = useState(1)
    const [user, setUser] = useState<null | User>(null)
    const [selected, setSelected] = useState<null | number>(null)

    useEffect(() => {
        // @ts-ignore
        DynamicSelectionPage.render.preload()
    }, [])


    return <AppContext.Provider value={{
        user,
        selected
    }}>
        <Slide
            key={'slide-1'}
            direction={'right'}
            in={slideNumber === 1}
            timeout={{
                appear: 500,
                enter: 500,
                exit: 0
            }} unmountOnExit={true}
            addEndListener={(node, done) =>
                node.addEventListener &&
                node.addEventListener('transitionend', done, false)
            }
        >
            <span>
                <LandingPage setSlideNumber={setSlideNumber} setUser={setUser}/>
            </span>
        </Slide>
        <Slide
            key={'slide-2'}
            direction={'right'}
            in={slideNumber === 2}
            timeout={{
                appear: 500,
                enter: 500,
                exit: 0
            }}
            unmountOnExit={true}
            addEndListener={(node, done) =>
                node.addEventListener &&
                node.addEventListener('transitionend', done, false)
            }
        >
            <span>
                <DynamicSelectionPage setSlideNumber={setSlideNumber} setSelected={setSelected}/>
            </span>
        </Slide>
        <Slide
            key={'slide-3'}
            direction={'right'}
            in={slideNumber === 3}
            timeout={{
                appear: 500,
                enter: 500,
                exit: 0
            }} unmountOnExit={true}
            addEndListener={(node, done) =>
                node.addEventListener &&
                node.addEventListener('transitionend', done, false)
            }
        >
            <span>
                <ConfirmationPage setSlideNumber={setSlideNumber}/>
            </span>
        </Slide>
    </AppContext.Provider>
}

export default index
