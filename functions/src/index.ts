import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
// import generateInitialPoints from "../utils/generateInitPoints"
import cors from "cors"

const whitelist = ["http://localhost:3001", "https://movie-seating.lynbrookasb.com"]
const corsOptions = {
    origin: function (origin: string, callback: (arg0: any) => void) {
        if (whitelist.indexOf(origin) !== -1) {
            // @ts-ignore
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    }
}

// @ts-ignore
const corsMiddleware = cors(corsOptions)

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp({
    databaseURL: 'https://movie-night-seating-default-rtdb.firebaseio.com',
    databaseAuthVariableOverride: {
        uid: "fb-functions"
    }
})
const db = admin.database()
const publicRef = db.ref("public-seating-arrangement")

const privateRef = db.ref("private-seating-choices")

const auth = admin.auth()

// const DEV_USE_FLAG = false

// exports.fooooo = functions.https.onRequest(async (request, response) => {
//     if (!DEV_USE_FLAG) {
//         response.status(404).send()
//         return
//     }
//     const seats = generateInitialPoints().map((pt, i) => ({
//         ...pt,
//         i: i + 1
//     }))
//     const updates = {}
//     seats.map(item => {
//         const newPostKey = publicRef.push().key
//         // @ts-ignore
//         updates[newPostKey] = item
//     })
//     await publicRef.update(updates)
//     response.send("done")
// })

exports.submitSeatChoice = functions.https.onRequest((req, res) => {
    async function submissionHandler () {
        const { idToken, selected } = req.body
        if (!idToken) {
            res.json({
                status: "errored",
                reason: "supply_id_token"
            })
            return
        }
        if (typeof selected !== "number") {
            res.json({
                status: "errored",
                reason: "supply_selection"
            })
            return
        }
        const user = await auth.verifyIdToken(idToken || "")
        if (!user) {
            res.json({
                status: "errored",
                reason: "bad_id_token"
            })
            return
        }
        const { name, email, uid, picture } = user
        if (!name || !email || !uid) {
            res.json({
                status: "errored",
                reason: "bad_id_token"
            })
            return
        }

        const snapshot = await privateRef.child(uid).once("value")
        const value = snapshot.val()
        if (value) {
            res.json({
                status: "errored",
                reason: "already_registered"
            })
            return
        }

        console.debug(picture)

        const seatRef = publicRef.orderByChild("i").equalTo(selected)
        const seatSnapshot = await seatRef.once("value")
        const _seat = seatSnapshot.val()
        const key = Object.keys(_seat)[0]

        const seat = _seat[key]

        if (seat?.taken) {
            res.json({
                status: "errored",
                reason: "seat_already_taken"
            })
            return
        }

        await publicRef.child(key).update({
            taken: true
        })

        console.debug('pass update')

        await privateRef.child(uid).set({
            name,
            email,
            picture,
            submitTime: new Date().getTime(),
            selected
        })

        res.json({ status: "successful", seatVal: seatSnapshot.val() })
    }

    corsMiddleware(req, res, async () => {
        try {
            await submissionHandler()
        } catch (e) {
            console.debug("error", e)
            res.json({
                status: "errored",
                reason: "unknown"
            })
        }
    })
})
