import { makeStyles } from '@material-ui/core/styles'
import Layout from '../Layout'
import firebase from 'firebase/app'
import 'firebase/database'
import { useContext, useEffect, useState } from 'react'
import { FIREBASE_CONFIG } from '../../utils/constants'
import { Box, Button } from '@material-ui/core'
import { AppContext, User } from '../../pages'
import { useRouter } from 'next/router'
import StickToTop from '../StickToTop'
import TopBarSlide from '../TopBarSlide'
import { toast } from 'react-toastify'


interface Props {
    setSlideNumber: (slide: number) => void,
    setUser: (user: null | User) => void,
}

const useStyles = makeStyles(theme => ({}))

const LandingPage = ({ setSlideNumber, setUser }: Props) => {
    const classes = useStyles()
    const { user } = useContext(AppContext)
    const router = useRouter()

    const [slide, setSlide] = useState(0)

    function onAuthStateChange (callback: (user: null | User) => void) {
        return firebase.auth().onAuthStateChanged(async _user => {
            if (_user) {
                console.debug('full user', _user)
                callback({
                    displayName: _user.displayName || '',
                    email: _user.email || '',
                    idToken: await _user.getIdToken(),
                    uid: _user.uid
                } as User)
            }
        })
    }

    function login () {
        const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
        googleAuthProvider.setCustomParameters({
            'hd': '@student.fuhsd.org'
        })
        firebase.auth().signInWithRedirect(googleAuthProvider)


        // const baseDomain =
        //     process.env.NODE_ENV === 'development'
        //         ? 'http%3A%2F%2Flocalhost%3A3001'
        //         : 'https%3A%2F%2Fmovie-seating.lynbrookasb.com'
        //
        // // TODO: change this url when using whatever
        //
        // let redirectURIBuilder = [
        //     'https://accounts.google.com/o/oauth2/v2/auth?',
        //     `redirect_uri=${baseDomain}%2F&`,
        //     'response_type=id_token&',
        //     'scope=openid%20email%20profile&',
        //     `nonce=${createNonce()}&`,
        //     `client_id=${GOOGLE_OAUTH_CLIENT_ID}`
        // ]
        // router.push(redirectURIBuilder.join('')).then((r) => {
        //     // ignore
        // })
    }

    function logout () {
        firebase.auth().signOut().then(() => {
            setUser(null)
        })
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
        if (user && slide === 0) {
            if (user.email.includes('@student.fuhsd.org')) {
                setSlide(1)
            } else {
                setSlide(12345)
            }
        } else if (!user) {
            setSlide(0)
        }
    }, [user])

    return <Layout title={'Movie Night | Welcome'}>
        <StickToTop>
            <TopBarSlide show={slide === 0} key={'landing-slide-1'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>Please Login To Continue</div>
                <Button variant="contained" size={'small'} onClick={() => {
                    login()
                }}>Login</Button>
            </TopBarSlide>
            <TopBarSlide show={slide === 12345} key={'landing-slide-re-log'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>You must use an @student.fuhsd.org email!</div>
                <Button variant="contained" size={'small'} onClick={() => {
                    logout()
                }}>Logout</Button>
            </TopBarSlide>
            <TopBarSlide show={slide === 1} key={'landing-slide-2'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>Hi {user?.given_name || (user?.displayName ? user.displayName.split(" ")[0] : false) || 'there'}!
                    Please read the rules before continuing!
                </div>
                <Button variant="contained" size={'small'} disabled={true}>👉 Continue</Button>
            </TopBarSlide>
            <TopBarSlide show={slide === 2} key={'landing-slide-3'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>
                    Thanks! You may now pick a seat on the next screen
                </div>
                <Button variant="contained" size={'small'} onClick={() => {
                    setSlideNumber(2)
                }}>👉 Continue</Button>
            </TopBarSlide>
        </StickToTop>
        <Box>

        </Box>
    </Layout>
}

export default LandingPage
