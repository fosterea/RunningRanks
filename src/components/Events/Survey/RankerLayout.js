import React from 'react'
import { cleanDashes } from '../../../setup/consts'
import Choice from './Choice'

export default function RankerLayout({ newRank, pair, event }) {

    const callback = (name) => {

        let rank = {}

        if (name == pair[0].name) {
            rank.winner = pair[0].name
            rank.loser = pair[1].name
        } else if (name == pair[1].name) {
            rank.winner = pair[1].name
            rank.loser = pair[0].name
        }
        newRank(rank)
    }
    return (
        <div>
            <div className='ranker-container'>
                <Choice callback={callback} athlete={pair[0]} />
                <Choice callback={callback} athlete={pair[1]} />
            </div>
        </div>

    )
}
