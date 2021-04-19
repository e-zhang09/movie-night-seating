import { makeStyles } from '@material-ui/core/styles'
import Layout from '../Layout'
import firebase from 'firebase/app'
import 'firebase/database'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { FIREBASE_CONFIG } from '../../utils/constants'
import { Box, Button, Typography, Fade, Checkbox, Tooltip } from '@material-ui/core'
import { AppContext, User } from '../../pages'
import { useRouter } from 'next/router'
import StickToTop from '../StickToTop'
import TopBarSlide from '../TopBarSlide'
import { toast } from 'react-toastify'
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight'
import Link from '@material-ui/core/Link'

interface Props {
    setSlideNumber: (slide: number) => void,
    setUser: (user: null | User) => void,
    setLandingSlide: (slide: number) => void
}

const useStyles = makeStyles(theme => ({
    rowOrientate: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.down('md')]: {
            '& > *': {
                width: '100%'
            }
        },
        [theme.breakpoints.up('md')]: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
        }
    },
    gridRows: {
        rowGap: 8,
        [theme.breakpoints.up('md')]: {
            rowGap: 40
        }
    },
    detailsGrid: {
        rowGap: 8,
        maxWidth: '90%',
        [theme.breakpoints.up('md')]: {
            maxWidth: '65%',
            marginBottom: 16
        }
    },
    checkbox: {
        padding: 0,
        transform: 'scale(2)',
        maxHeight: 24,
        marginLeft: 24,
        '&[aria-disabled=true]:hover': {
            cursor: 'not-allowed'
        }
    }
}))

const ListItem = ({ children }: { children: ReactNode }) => {
    return <span style={{ display: 'flex' }}>
        <SubdirectoryArrowRightIcon style={{ marginTop: 2 }}/>
        <Typography variant={'h6'} style={{
            marginLeft: 4
        }}>{children}</Typography>
    </span>
}

const LandingPage = ({ setSlideNumber, setUser, setLandingSlide }: Props) => {
    const classes = useStyles()
    const { user, landingSlide } = useContext(AppContext)
    const router = useRouter()

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
        if (user && landingSlide === 0) {
            if (user.email.includes('@student.fuhsd.org')) {
                setLandingSlide(1)
            } else {
                setLandingSlide(12345)
            }
        } else if (!user) {
            setLandingSlide(0)
        }
    }, [user])

    return <Layout title={'Movie Night | Welcome'}>
        <StickToTop>
            <TopBarSlide show={landingSlide === 0} _key={'landing-slide-1'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>Please Login To Continue</div>
                <Button variant="contained" size={'small'} onClick={() => {
                    login()
                }}>Login</Button>
            </TopBarSlide>
            <TopBarSlide show={landingSlide === 12345} _key={'landing-slide-re-log'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>You must use an @student.fuhsd.org email!</div>
                <Button variant="contained" size={'small'} onClick={() => {
                    logout()
                }}>Logout</Button>
            </TopBarSlide>
            <TopBarSlide show={landingSlide === 1} _key={'landing-slide-2'}>
                <Button variant="contained" size={'small'} onClick={() => {
                    // TODO: implement this
                    toast.info('oops! this has not been implemented yet')
                }}>Question? 🤔</Button>
                <div>Hi {user?.given_name || (user?.displayName ? user.displayName.split(" ")[0] : false) || 'there'}!
                    Please read the rules before continuing!
                </div>
                <Button variant="contained" size={'small'} disabled={true}>👉 Continue</Button>
            </TopBarSlide>
            <TopBarSlide show={landingSlide === 2} _key={'landing-slide-3'}>
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
        <Box mt={4} px={'5vw'} display={'grid'} gridTemplateRows={'auto'} justifyContent={'center'}
            alignItems={'center'} className={classes.gridRows}>
            <Fade in={true} timeout={1000}>
                <Box className={classes.rowOrientate}>
                    <Box mb={3}>
                        <Typography variant={'h2'} style={{
                            fontWeight: 700
                        }}>Lynbrook Movie Night</Typography>
                        <Typography variant={'h4'} style={{
                            fontWeight: 700
                        }}>Friday, April 30th</Typography>
                    </Box>
                    <Box>
                        <Box style={{
                            height: 'min(21vh, 400px)',
                            width: '100%',
                            backgroundImage: 'url(https://cdn.statically.io/img/movie-night-seating.web.app/f=auto,h=400/assets/soul_logo_rendered_color.png)',
                            backgroundPositionX: 'center',
                            backgroundPositionY: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain'
                        }}/>
                    </Box>
                </Box>
            </Fade>
            <Box display={'grid'} gridTemplateRows={'auto'} className={classes.detailsGrid} style={{
                marginTop: -30
            }}>
                <Typography variant={'h4'}>Details!</Typography>
                <ListItem>
                    Each person may only reserve one seat. If you want to sit with your
                    friends, be sure to <b>coordinate</b> with them first! The seat reservation spots are live ⚡
                </ListItem>
                <ListItem>
                    The In-Person Movie Night will be on Friday April 30th, make sure to mark your calendars.
                </ListItem>
                <ListItem>
                    Checking-In will start at 7:00 PM at the Office drive through.
                </ListItem>
                <ListItem>
                    The movie, Disney/Pixar's Soul, will starts at <b>7:45 PM</b>. Can't wait to see you all there!!
                </ListItem>
                <ListItem>
                    Please log-in and do all registrations with your <b>@student.fuhsd.org</b> email account!
                </ListItem>
                <ListItem>
                    Any questions or concerns? Feel free to email us at <Link
                    href={'mailto:someone@example.com'}>someone@example.com</Link>
                </ListItem>
            </Box>
            <Box display={'grid'} gridTemplateRows={'auto'} className={classes.detailsGrid}>
                <Typography variant={'h4'}>Rules and Safety Precautions</Typography>
                <ListItem>
                    Masks on at <b>all</b> times.
                </ListItem>
                <ListItem>
                    No food or drinks ({'sad, I know :<'})
                </ListItem>
                <ListItem>
                    Follow social distancing guidelines 🪑 (6+ft) 🪑
                </ListItem>
                <ListItem>
                    Remain in your seat at <b>all</b> times.
                </ListItem>
                <ListItem>
                    Bathrooms are available (2 people in each at once)!
                </ListItem>
            </Box>
            <Box mb={10} display={'flex'} alignItems={'center'}>
                <Typography variant={'h4'}>I've read everything</Typography>
                <Tooltip title={user ? 'You sure?' : 'Please log in first!'} placement="top">
                    <div>
                        <Checkbox
                            checked={landingSlide === 2}
                            disabled={!Boolean(user)}
                            onChange={() => {
                                setLandingSlide(2)
                            }}
                            name="ive-read"
                            color="primary"
                            className={classes.checkbox}
                        />
                    </div>
                </Tooltip>
            </Box>
            <Box mb={20}>
                {user && <Button onClick={() => {
                    logout()
                }} size={'small'}>
                    Logout 🏃
                </Button>}
            </Box>
        </Box>
    </Layout>
}

export default LandingPage
