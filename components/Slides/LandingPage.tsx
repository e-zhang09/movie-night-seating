import { makeStyles } from '@material-ui/core/styles'
import Layout from '../Layout'
import firebase from 'firebase'
import { useContext, useEffect, useState } from 'react'
import { FIREBASE_CONFIG, GOOGLE_OAUTH_CLIENT_ID } from '../../utils/constants'
import { Button } from '@material-ui/core'
import { AppContext, User } from '../../pages'
import { useRouter } from 'next/router'
import createNonce from '../../utils/createNonce'


interface Props {
    setSlideNumber: (slide: number) => void,
    setUser: (user: null | User) => void,
}

const useStyles = makeStyles(theme => ({}))

const LandingPage = ({ setSlideNumber, setUser }: Props) => {
    const classes = useStyles()
    const { user } = useContext(AppContext)
    const router = useRouter()

    function onAuthStateChange (callback: (user: null | User) => void) {
        return firebase.auth().onAuthStateChanged(async _user => {
            if (_user) {
                callback({
                    displayName: _user.displayName || '',
                    email: _user.email || '',
                    idToken: await _user.getIdToken()
                })
            }
        })
    }

    function login () {
        // const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
        // googleAuthProvider.setCustomParameters({
        //     'hd': '@student.fuhsd.org'
        // });
        // firebase.auth().signInWithRedirect(googleAuthProvider)
        const baseDomain =
            process.env.NODE_ENV === 'development'
                ? 'http%3A%2F%2Flocalhost%3A3001'
                : 'https%3A%2F%2Fmovie-seating.lynbrookasb.com'

        // TODO: change this url when using whatever

        let redirectURIBuilder = [
            'https://accounts.google.com/o/oauth2/v2/auth?',
            `redirect_uri=${baseDomain}%2F&`,
            'response_type=id_token&',
            'scope=openid%20email%20profile&',
            `nonce=${createNonce()}&`,
            `client_id=${GOOGLE_OAUTH_CLIENT_ID}`
        ]
        router.push(redirectURIBuilder.join('')).then((r) => {
            // ignore
        })
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
        const search = new URLSearchParams(window.location.hash.replace('#', '?'))
        window.history.replaceState(null, '', ' ')

        const id_token = search.get('id_token')

        if (!id_token || id_token.toString().length < 8) {
            return
        } else {
            console.debug(`got id_token: ${id_token}`, parseJwt(id_token))
            setUser({ ...parseJwt(id_token), idToken: id_token })
        }

        const unsubscribe = onAuthStateChange(setUser)
        return () => {
            unsubscribe()
        }
    }, [])

    function parseJwt (token: string) {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        return JSON.parse(jsonPayload)
    }

    useEffect(() => {
        console.debug('user', user)
    }, [user])

    return <Layout title={'Movie Night | Welcome'}>
        {user?.email.includes('@student.fuhsd.org')
            ? <>
                <h1>Hi {user.displayName || user.given_name || 'there'}!</h1>
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
