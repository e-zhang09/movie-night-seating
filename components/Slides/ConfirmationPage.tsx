import { Button } from '@material-ui/core'
import { useContext } from 'react'
import { AppContext } from '../../pages'
import { BASE_SUBMISSION_URL, DEV_SUBMISSION_URL } from '../../utils/constants'

interface Props {
    setSlideNumber: (slide: number) => void
}

const ConfirmationPage = ({ setSlideNumber }: Props) => {
    const { user, selected } = useContext(AppContext)

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
            alert('Something went wrong! Please refresh to try again')
        })
    }

    return <>
        <Button variant="contained" onClick={() => {
            setSlideNumber(2)
        }}>Back
        </Button>
        <Button variant="contained" onClick={() => {
            console.debug('selected', selected, 'for user', user)
            submitSeatingChoice()
        }}>Submit
        </Button>
        <br/><br/><br/>
        Rules and Stuff here: <br/>
        * <br/>
        * <br/>
        * <br/>
        * <br/>
        *
    </>
}

export default ConfirmationPage
