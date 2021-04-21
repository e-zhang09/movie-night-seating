import { makeStyles } from '@material-ui/core/styles'
import { Backdrop, Fade, Modal } from '@material-ui/core'
import { Seat } from './PolygonPoints'

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
        padding: theme.spacing(2, 4, 3)
    }
}))


interface Props {
    open: boolean
    setOpen: (bool: boolean) => void
    seat?: Seat | false | null
    submitting: boolean
}

const SuccessModal = ({ open, setOpen, seat, submitting }: Props) => {
    const classes = useStyles()

    const handleClose = () => {
        if (!submitting) setOpen(false)
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open || submitting}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500
            }}
        >
            <Fade in={open}>
                <div className={classes.paper}>
                    {submitting
                        ? <>
                            <h2 id="transition-modal-title">Submitting your seating choice</h2>
                            <p id="transition-modal-description">Please hold on...</p>
                        </>
                        : <>
                            <h2 id="transition-modal-title">Success!</h2>
                            <p id="transition-modal-description">Your seat
                                choice{(seat && typeof seat?.i === 'number') ? `(#${seat.i})` : ''} has been
                                recorded.</p>
                            <p>You may now close this tab and complete the Google Form :)</p>
                        </>
                    }
                </div>
            </Fade>
        </Modal>
    )
}

export default SuccessModal
