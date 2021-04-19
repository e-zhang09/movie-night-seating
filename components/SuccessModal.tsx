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
    seat?: Seat | boolean
}

const SuccessModal = ({ open, setOpen, seat }: Props) => {
    const classes = useStyles()

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
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
                    <h2 id="transition-modal-title">Transition modal</h2>
                    <p id="transition-modal-description">react-transition-group animates me.</p>
                    {JSON.stringify(seat)}
                </div>
            </Fade>
        </Modal>
    )
}

export default SuccessModal
