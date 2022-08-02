import React, { Component } from 'react'
import userAuthContext from '../../../setup/UserAuthContext';
import { getDoc, setDoc, doc, Timestamp } from '@firebase/firestore';
import { db } from '../../../setup/firebase';
import RankerLayout from './RankerLayout';
import { isMobile } from 'react-device-detect';
import { cleanDashes } from '../../../setup/consts';
import { Button } from 'react-bootstrap';


const num_rankings_to_fill_out = 66

export default class Ranker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pairs: [],
            ranks: [],
            index: 0,
            max_index: 10,
        };
    }

    static contextType = userAuthContext


    componentDidMount() {
        getDoc(doc(db, 'events', this.props.event)).then((doc) => {
            let data = doc.data()
            let matches = gen_matches(num_rankings_to_fill_out, data.ranks)
            this.setState({ pairs: matches })
            // Pre load images
            for (let pair of matches) {
                preloadImage(pair[0].image_url)
                preloadImage(pair[1].image_url)
            }
        })
    }

    saveRanks(ranks) {

        if (ranks.length === 0) {
            this.props.removeEvent(this.props.event)
            return
        }

        const { user, userDoc } = this.context
        const doc_ref = doc(db, 'rankings', `${user.uid}-${this.props.event}`)
        const data = {
            ranks: ranks,
            updated: Timestamp.fromDate(new Date()),
            event: this.props.event,
            ranker_name: userDoc.name,
        }
        setDoc(doc_ref, data)
        this.props.removeEvent(this.props.event)
    }

    newRank(rank) {
        console.log(this)
        console.log(rank)
        let ranks = Array.from(this.state.ranks)
        ranks.push(rank)
        this.setState({ ranks: ranks })

        let new_index = this.state.index + 1

        if (this.state.pairs.length === new_index) {
            this.saveRanks(ranks)
            return
        }

        this.setState({ index: new_index })
    }

    skipMatch() {

        // Don't allow skipping if asking if they
        // want to continue
        if (this.state.index === this.state.max_index) {
            return
        }

        let new_index = this.state.index + 1

        if (this.state.pairs.length === new_index) {
            this.saveRanks(this.state.ranks)
            return
        }

        this.setState({ index: new_index })
    }

    increaseMaxIndex() {
        // let max = this.state.max_index + 20
        this.setState({ max_index: num_rankings_to_fill_out })
    }

    render() {

        if (this.state.pairs.length === 0) {
            return "loading..."
        }

        return (
            <div>
                <div className='ranker-header'>
                    {
                        this.props.isSmallScreen || isMobile ?

                            <div className='mobile-header'>
                                <div className='mobile-button-container'>
                                    <Button onClick={this.skipMatch.bind(this)} variant="outline-primary">
                                        Don't Know
                                        {!isMobile &&
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                                <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                            </svg>
                                        }
                                    </Button>
                                    <Button onClick={() => this.saveRanks.bind(this)(this.state.ranks)} variant="outline-primary">
                                        Skip to Rankings
                                        {!isMobile &&
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                                <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                            </svg>
                                        }
                                    </Button>
                                </div>
                                <div className='page-title'>
                                    Who is faster in the {cleanDashes(this.props.event)}?
                                </div>
                            </div>

                            :

                            <div className='computer-header'>
                                <div className='page-title'>
                                    Who is faster in the {cleanDashes(this.props.event)}?
                                </div>
                                <div className='computer-button-container'>
                                    <Button onClick={this.skipMatch.bind(this)} variant="outline-primary">
                                        Don't Know
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                        </svg>
                                    </Button>
                                    <Button onClick={() => this.saveRanks.bind(this)(this.state.ranks)} variant="outline-primary">
                                        Skip to Rankings
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>

                    }

                    {
                        this.state.index === 0 &&
                        <div className='white-block rounded ranker-message'>
                            Click on the athlete you think would win in a race. If you don't know,
                            skip to the next one.
                        </div>


                    }


                </div>
                {this.state.index === this.state.max_index

                    ?
                    <div className='white-block rounded ranker-message'>
                        What to keep ranking?
                        <div style={{ "padding-top": "10px" }}>
                            <Button onClick={this.increaseMaxIndex.bind(this)} variant='primary'>
                                Keep Ranking
                            </Button>
                        </div>
                    </div>

                    :
                    <div>
                        <div className="count-subtitle">
                            {this.state.index + 1}/{this.state.max_index}
                        </div>
                        <RankerLayout
                            key={this.props.event} event={this.props.event}
                            newRank={this.newRank.bind(this)}
                            pair={this.state.pairs[this.state.index]} />

                    </div>

                }

            </div>

        )
    }
}


function gen_matches(num, athletes) {

    let matches = []
    let matches_strs = []

    let num_athletes = athletes.length

    for (let i = 0; i < num; i++) {
        let rand1 = rand_02x(num_athletes)
        let rand2 = rand_02x(num_athletes)
        let pair = [athletes[rand1], athletes[rand2]]
        while (rand1 === rand2 || checkIfOldPair(pair, matches_strs)) {
            rand1 = rand_02x(num_athletes)
            rand2 = rand_02x(num_athletes)
            pair = [athletes[rand1], athletes[rand2]]
        }

        matches.push(pair)
        matches_strs.push(`${pair[0].name}${pair[1].name}`)
    }

    return matches
}

function rand_02x(x) {
    return Math.floor(Math.random() * x)
}

function checkIfOldPair(pair, matches) {
    let name1 = pair[0].name
    let name2 = pair[1].name

    let names1 = name1 + name2
    let names2 = name2 + name1

    if (matches.includes(names1) || matches.includes(names2)) {
        return true
    }

    return false
}

function preloadImage(url) {
    var img = new Image();
    img.src = url;
}