import PositionFixedKeepSpace from './PositionFixedKeepSpace'
import { ReactNode } from 'react'
import { makeStyles } from '@material-ui/core/styles'

interface Props {
    children: ReactNode
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
        fontWeight: 700
    }
}))

const StickToTop = ({ children }: Props) => {
    const classes = useStyles()
    return <>
        <PositionFixedKeepSpace className={classes.stickToTop}>
            {children}
        </PositionFixedKeepSpace>
    </>
}

export default StickToTop
