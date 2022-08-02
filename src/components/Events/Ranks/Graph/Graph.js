import React, { useEffect, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../../../../setup/firebase'
import Selector from './Selector'
import Chart from './Chart'
import '../../../../css/Graph.css'

export default function Graph({ event }) {

    const [people, setPeople] = useState([])
    const [logs, setLogs] = useState(null)
    const [active, setActive] = useState({})
    const [showChart, setShowChart] = useState(false)

    useEffect(() => {
        let unsub = onSnapshot(doc(db, 'logs', event), (doc) => {
            let data = doc.data()

            let logs = data.logs

            setLogs(logs)

            let people = new Set()

            for (let log of logs.slice().reverse()) {
                for (let person of log.people)
                    people.add(person)
            }

            setPeople(Array.from(people))

            let active = {}

            for (let name of people) {
                active[name] = false
            }

            console.log(logs)

        })
        return unsub
    }, [event])

    return (
        <div>
            <div className='show-chart-btn-container'>
                <div className='show-chart-btn' onClick={() => setShowChart(!showChart)}>Show Graph</div>
            </div>
            {showChart &&
                <div className="chart-selector-container">
                    {logs == null ? "loading..." :
                        <div>
                            <div>
                                <Selector active={active} setActive={setActive} people={people} />
                            </div>
                            <div className='chart-container'>
                                <Chart logs={logs} active={active} people={people} />
                            </div>
                        </div>
                    }
                </div>
            }


        </div>

    )
}
