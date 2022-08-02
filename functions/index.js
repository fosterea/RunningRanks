const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');


initializeApp();

const db = getFirestore();

const eventsRef = db.collection("events");
const rankingsRef = db.collection("rankings");

const unprocessed_events_list = [
    '100m/women',
    '200m/women',
    "400m/women",
    "800m/women",
    '1500m/women',
    '5000m/women',
    '10000m/women',
    '100mh/women',
    '400mh/women',
    '3000msc/women',
    'marathon/women',
    '100m/men',
    '200m/men',
    '400m/men',
    '800m/men',
    '1500m/men',
    '5000m/men',
    '10000m/men',
    '110mh/men',
    '400mh/men',
    '3000msc/men',
    'marathon/men',
]

var events_list = []

function cleanSlashes(str) {
    return str.replace('/', '-')
}

for (let i in unprocessed_events_list) {
    events_list[i] = cleanSlashes(unprocessed_events_list[i])
}


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


// Monthly update function
// Cron: 0 0 * * 0
exports.logCurrentStates = functions.pubsub.schedule('0 0 * * 0')
    .timeZone('America/Los_Angeles') // Users can choose timezone - default is America/Los_Angeles
    .onRun(async (context) => {
        await logCurrentStates()
        return null;
});

exports.testLog = functions.https.onRequest(async (rec, res) => {
    await logCurrentStates()
    res.send("yasssss")
})

async function logCurrentStates() {

    // Update events
    let calls = []
    for (let event of events_list) {
        calls.push(updateEvent(event))
    }
    await Promise.all(calls)

    let now = new Date()
    let date = now.toLocaleDateString('en-US')
    let timestamp = Timestamp.fromDate(now)
    let millis = now.getTime()


    calls = []
    for (let event of events_list) {
        calls.push(logEvent(event, date, timestamp, millis))
    }
    await Promise.all(calls)
}

async function logEvent(event, date, timestamp, millis) {
    console.log(event)

    // Get past logs
    const logs_ref = db.collection("logs").doc(event)
    const logs_doc = await logs_ref.get()
    if (!logs_doc.exists) {
        var logs = []
    } else {
        logs = logs_doc.data().logs
    }

    // Get new data
    const event_ref = eventsRef.doc(event)
    const event_doc = await event_ref.get()
    const data = event_doc.data()
    const ranks = data.ranks

    let log = {
        contributors: data.contributors,
        date: date,
        timestamp: timestamp,
        people: [],
        milles: millis,
    }

    for (let athlete of ranks) {
        log[athlete.name] = athlete.score
        log.people.push(athlete.name)
    }
    console.log(log)

    // Save data in logs
    logs.push(log)
    logs_ref.set({
        logs: logs,
        event: event,
    })
}

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