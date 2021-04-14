import { Box, Button, Slide } from '@material-ui/core'
import { useContext } from 'react'
import { AppContext } from '../../pages'
import { BASE_SUBMISSION_URL, DEV_SUBMISSION_URL } from '../../utils/constants'
import { toast } from 'react-toastify'
import PositionFixedKeepSpace from '../PositionFixedKeepSpace'
import Layout from '../Layout'
import { makeStyles, Theme } from '@material-ui/core/styles'

interface Props {
    setSlideNumber: (slide: number) => void
}

const useStyles = makeStyles(theme => ({
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
    }
}))

const ConfirmationPage = ({ setSlideNumber }: Props) => {
    const { user, selected } = useContext(AppContext)
    const classes = useStyles()

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
        // DEV_SUBMISSION_URL
        const result = await postData(BASE_SUBMISSION_URL, {
            idToken: user?.idToken,
            selected
        }).catch(err => {
            toast.error('Something went wrong! Please refresh to try again')
        })
        if (result.data.status !== 'successful') {
            toast.error(`error: ${result.data.error}, please go back and select a new seat!`)
        } else {
            toast.success(`Success! You've signed up for seat #${selected}`)
        }
    }

    return <>
        <Layout title="Movie Night | Choose Your Seat">
            <PositionFixedKeepSpace className={classes.stickToTop}>
                <Slide
                    key={'confirmation-slide-key-1'}
                    direction={'right'}
                    in={true}
                    timeout={500}
                    unmountOnExit={true}
                    addEndListener={(node, done) =>
                        node.addEventListener &&
                        node.addEventListener('transitionend', done, false)
                    }
                >
                    <div className={classes.topBarHorizontalContainer}>
                        <Button variant="contained" onClick={() => {
                            setSlideNumber(2)
                        }}>Back
                        </Button>
                        <div>Please read the rules before submitting!</div>
                        <Button variant="contained" onClick={() => {
                            console.debug('selected', selected, 'for user', user)
                            submitSeatingChoice()
                        }} disabled={Boolean(user)}>Submit (#{selected})
                        </Button>
                    </div>
                </Slide>
            </PositionFixedKeepSpace>
            <Box>
                <br/><br/><br/>
                Rules and Stuff here: <br/>
                * <br/>
                * <br/>
                * <br/>
                * <br/>
                *
            </Box>
        </Layout>
    </>
}

export default ConfirmationPage
