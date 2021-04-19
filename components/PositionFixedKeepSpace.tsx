import { ReactNode } from 'react'
import { Box } from '@material-ui/core'

interface Props {
    children: ReactNode
    className: string
}

const PositionFixedKeepSpace = ({ children, className }: Props) => {
    return <>
        <Box className={className} boxShadow={5}>
            {children}
        </Box>
        <div className={className} style={{
            visibility: 'hidden',
            position: 'unset'
        }}>
            {children}
        </div>
    </>
}

export default PositionFixedKeepSpace
