import { makeStyles } from '@material-ui/core/styles'
import { Backdrop, Box, Fade, Modal } from '@material-ui/core'
import { FirebaseDatabaseNode } from '@react-firebase/database'
import SeatsTable from './SeatsTable'

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        width: '80vw',
        height: '80vh',
        overflowY: 'scroll',
        overflowX: 'hidden'
    }
}))


interface Props {
    open: boolean
    setOpen: (bool: boolean) => void
}

const SuccessModal = ({ open, setOpen }: Props) => {
    const classes = useStyles()

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Modal
            aria-labelledby="signups-modal-title"
            aria-describedby="signups-modal-description"
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500
            }}
        >
            <Fade in={open}>
                <div className={classes.paper}>
                    <FirebaseDatabaseNode path={'private-seating-choices'} orderByValue={'selected'}>
                        {d => {
                            if (d.isLoading || (!d.isLoading && !d.value)) {
                                return <>
                                    <h2 id="signups-modal-title">Loading data...</h2>
                                    <p id="signups-modal-description">Please hold on...</p>
                                </>

                            }
                            if (!d.value) {
                                return <>
                                    <h2 id="signups-modal-title">No records found hmm...</h2>
                                    <p id="signups-modal-description">Please message JBF {':>'}</p>
                                </>
                            }
                            const seats = Object.keys(d.value).map(_k => ({
                                ...d.value[_k],
                                docKey: _k
                            })).sort((a, b) => a.selected - b.selected).filter(_o => typeof _o.selected === 'number')

                            return <>
                                <SeatsTable signups={seats}/>
                            </>
                        }}
                    </FirebaseDatabaseNode>
                </div>
            </Fade>
        </Modal>
    )
}

export default SuccessModal
