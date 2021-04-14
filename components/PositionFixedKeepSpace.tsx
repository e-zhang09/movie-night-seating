import { ReactNode } from 'react'

interface Props {
    children: ReactNode
    className: string
}

const PositionFixedKeepSpace = ({ children, className }: Props) => {
    return <>
        <div className={className}>
            {children}
        </div>
        <div className={className} style={{
            visibility: 'hidden',
            position: 'unset'
        }}>
            {children}
        </div>
    </>
}

export default PositionFixedKeepSpace
