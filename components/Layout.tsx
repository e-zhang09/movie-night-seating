import React, { ReactNode } from 'react'
import { FirebaseDatabaseProvider } from "@react-firebase/database"
import firebase from 'firebase/app'
import 'firebase/database'
import { FIREBASE_CONFIG } from '../utils/constants'
import Head from 'next/head'

type Props = {
    children?: ReactNode
    title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
    <>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
        </Head>
        <FirebaseDatabaseProvider firebase={firebase} {...FIREBASE_CONFIG}>
            {children}
        </FirebaseDatabaseProvider>
    </>
)

export default Layout
