import { ReactNode, useEffect, useState } from 'react'
import { Button, Slide } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

interface Props {
    children: ReactNode
    show: boolean
    key: string
    first?: boolean
}

const useStyles = makeStyles(theme => ({
    topBarHorizontalContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 5vw',
        [theme.breakpoints.up('md')]: {
            padding: '20px 5vw',
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

const TopBarSlide = ({ children, show, key, first }: Props) => {
    const classes = useStyles()
    const [_show, _setShow] = useState(false)

    useEffect(() => {
        if (show) {
            setTimeout(() => {
                _setShow(true)
            }, 0)
        } else {
            _setShow(false)
        }
    }, [show])

    return <Slide
        key={key}
        direction={'right'}
        in={_show}
        timeout={{
            enter: 500,
            appear: 0,
            exit: 0
        }}
        unmountOnExit={true}
        addEndListener={(node, done) =>
            node.addEventListener &&
            node.addEventListener('transitionend', done, false)
        }
    >
        <div className={classes.topBarHorizontalContainer}>
            {children}
        </div>
    </Slide>
}

export default TopBarSlide
