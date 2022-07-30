import React, { useState, useEffect } from 'react'
import { cleanDashes } from '../../../setup/consts'
import { db } from '../../../setup/firebase'
import { onSnapshot, doc } from "firebase/firestore";
import '../../../css/Ranks.css'
import NextBTN from './NextBTN'

export default function Ranks({ event, isMobile }) {

    const [ranks, setRanks] = useState([])
    const [contributors, setContributors] = useState(null)

    useEffect(() => {
        onSnapshot(doc(db, 'events', event), (doc) => {
            let data = doc.data()
            setRanks(data.ranks)
            setContributors(data.contributors)
        })
    }, [event])

    return (
        <div className='ranks-page'>
            <div className='ranks-header'>
                <div>
                    <div className='ranks-page-title'>{cleanDashes(event)}</div>
                    {contributors && <div className='ranks-subtitle'>{contributors} contributors</div>}
                </div>
                <div className='top-next-btn-container'>
                    {
                        !isMobile && <NextBTN event={event} />
                    }
                </div>
            </div>

            <div className='ranks-table-container'>
                <table className='ranks-table'>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>Nat</th>
                            <th>Score</th>
                        </tr>

                    </thead>
                    <tbody>
                        {ranks.map((rank, i) => (
                            <tr key={rank.name}>
                                <td className='ranks-rank' data-th="Rank">{i + 1}</td>
                                <td className="ranks-name" data-th="Name">{rank.name}</td>
                                <td className="ranks-DOB" data-th="DOB">{rank.DOB}</td>
                                <td className="ranks-nat" data-th="Nat" dangerouslySetInnerHTML={{ __html: rank.nat }}></td>
                                <td className="ranks-score" data-th="Score">{asPercent(rank.score)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='bottom-next-btn-container'>
                    <NextBTN event={event} />
                </div>
            </div>

        </div>
    )
}


function asPercent(x) {
    x *= 100
    let num = (Math.round(x * 1 * 10) / 1 / 10)
    return `${num}%`
}