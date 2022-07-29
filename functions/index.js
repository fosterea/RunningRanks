const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');


initializeApp();

const db = getFirestore();

const eventsRef = db.collection("events");
const rankingsRef = db.collection("rankings");

exports.updateEvent = functions.https.onCall(async (data, context) => {
    const event = data.event
    return await updateEvent(event)
})

exports.updateEventHTTP = functions.https.onRequest(async (req, res) => {
    const event = req.query.event
    res.send(await updateEvent(event))
})

exports.updateAfterRanking = functions
    .firestore
    .document('rankings/{userEventID}')
    .onWrite(async (change, context) => {
        let data = change.after.data()
        await updateEvent(data.event)
})

exports.updateAfterWebscrape = functions
    .firestore
    .document('events/{event}')
    .onWrite(async (change, context) => {
        let data = change.after.data()

        if (data.updatedUponCreation != null) {
            return
        }

        await updateEvent(context.params.event)
})


/**
 * Updates the event rankings for an event.
 * @param {string} event The event that must be updated
 * @returns True
 */
async function updateEvent(event) {

    const weekAgo = Timestamp.fromDate(getLastWeeksDate())

    let docs = await rankingsRef.where('event', '==', event).where('updated', '>', weekAgo).get()
    let eventRef = eventsRef.doc(event)

    let eventDoc = await eventRef.get()


    if (!eventDoc.exists) {
        throw new functions.https.HttpsError('aborted','Event not in database');
    }
    if (docs.empty) {
        throw new functions.https.HttpsError('aborted','No event rankings in rankings collection');
    }


    let athletes = eventDoc.data().ranks

    let rankings = {}

    for (let athlete of athletes) {
        rankings[athlete.name] = gen_dict_of_all_athletes(athletes, athlete)
    }

    // Count wins and matchups
    // from the data

    let contributors = 0
    docs.forEach((doc) => {
        contributors ++
        const pairs = doc.data().ranks
        for (let pair of pairs) {

            let winner = pair.winner
            let loser = pair.loser

            // Skip people that aren't on the event page anymore
            if (rankings[winner] == null || rankings[loser] == null) {
                continue
            }

            // Increment Winner v Loser wins and games
            // by one
            rankings[winner][loser].wins += 1
            rankings[winner][loser].matches += 1

            // Increment Loser v Winner matches by one
            rankings[loser][winner].matches += 1
        }
    })


    // Average
    for (let athlete of athletes) {
        let sums = 0
        let num = 0
        for (let competitor of athletes) {

            if (competitor.name === athlete.name || rankings[athlete.name][competitor.name].matches === 0) {
                continue
            }

            num += 1

            let avg = rankings[athlete.name][competitor.name].wins / rankings[athlete.name][competitor.name].matches
            sums += avg
        }
        if (num > 0) {
            let avg_win = sums / num
            athlete.score = avg_win
        } else {
            athlete.score = 0
        }
    
        
    }

    // Sort
    athletes = sort_athletes(athletes)


    eventRef.update({
        ranks: athletes,
        contributors: contributors,
        updatedUponCreation: true,
    })

    return true
}

function getLastWeeksDate() {
    const now = new Date();
  
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function gen_dict_of_all_athletes(athletes, exclude) {
    let dict = {}

    for (let athlete of athletes) {
        // Skip this athlete
        if (athlete.name === exclude.name) {
            continue
        }
        dict[athlete.name] = {
            wins: 0,
            matches: 0
        }
    }

    return dict
}

function sort_athletes(athletes) {
    athletes.sort(function (a, b) {
        a = a.score;
        b = b.score;
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    });
    return athletes
}