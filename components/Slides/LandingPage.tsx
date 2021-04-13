import { makeStyles } from '@material-ui/core/styles'
import Layout from '../Layout'
import firebase from 'firebase'
import { useContext, useEffect, useState } from 'react'
import { FIREBASE_CONFIG } from '../../utils/constants'
import { Button } from '@material-ui/core'
import { AppContext, User } from '../../pages'


interface Props {
    setSlideNumber: (slide: number) => void,
    setUser: (user: null | User) => void,
}

const useStyles = makeStyles(theme => ({}))

const LandingPage = ({ setSlideNumber, setUser }: Props) => {
    const classes = useStyles()
    const { user } = useContext(AppContext)

    function onAuthStateChange (callback: (user: null | User) => void) {
        return firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                callback({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    idToken: await user.getIdToken()
                })
            } else {
                callback(null)
            }
        })
    }

    function login () {
        const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
        googleAuthProvider.setCustomParameters({
            'hd': '@student.fuhsd.org'
        });
        firebase.auth().signInWithRedirect(googleAuthProvider)
    }

    function logout () {
        firebase.auth().signOut()
    }

    useEffect(() => {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG)
        } else {
            firebase.app() // if already initialized, use that one
        }
        const unsubscribe = onAuthStateChange(setUser)
        return () => {
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        console.debug('user', user)
    }, [user])

    return <Layout title={'Movie Night | Welcome'}>
        {user?.email.includes('@student.fuhsd.org')
            ? <>
                <h1>Hi {user.displayName}!</h1>
                <Button variant="contained" onClick={() => {
                    logout()
                }}>Logout
                </Button>
                <Explanation/>
                <Button variant="contained" onClick={() => {
                    setSlideNumber(2)
                }}>Click here to start choosing a spot!
                </Button>
            </>
            : <>
                <h1>Hi there!</h1>
                <div>Please login with your @student.fuhsd.org account!</div>
                {
                    !user?.email
                        ? <Button variant="contained" onClick={() => {
                            login()
                        }}>Login
                        </Button>
                        : <Button variant="contained" onClick={() => {
                            logout()
                            login()
                        }}>Switch Account
                        </Button>
                }
                <Explanation/>
            </>
        }
    </Layout>
}

const Explanation = () => {
    return <>
        <h1>
            Some explanation about movie night things.
        </h1>
    </>
}

export default LandingPage
