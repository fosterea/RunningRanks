import React, { Component } from 'react'
import userAuthContext from '../../../setup/UserAuthContext'
import { Card, Button } from 'react-bootstrap'
import '../../../css/Survey.css'
import Ranker from './Ranker'
import { updateDoc, Timestamp } from '@firebase/firestore'
import { cleanDashes } from '../../../setup/consts'
import { updateEvent } from '../../../setup/firebase'

export default class ClassSurvey extends Component {

    constructor(props) {
        super(props);
        this.state = {
            takingSurvey: false
        };
    }

    static contextType = userAuthContext

    render() {
        const { user, userDoc, userDocRef } = this.context

        const event = this.props.event

        const skip = () => {
            removeEvent(event)
        }

        const takeSurvey = () => {
            this.setState({
                takingSurvey: true
            })
        }

        // Used to remove event from unsibmitted list
        const removeEvent = (event) => {
            let data = { ...userDoc }
            // Update submition date
            data.event_submitions[event] = Timestamp.fromDate(new Date())

            // Updates user doc and because of
            // firebase auto updating our copy of data
            // the change takes effect immediately,
            // redirecting from this component.
            updateDoc(userDocRef, data);
            // updateEvent(event)
        }


        // // Return survey if taking survey
        // if (this.state.takingSurvey) {
        //     return (
        //         <div className='content'>
        //             <Ranker key={event} event={event} removeEvent={removeEvent} />
        //         </div>
        //     )
        // }

        return (
            <div className='content'>
                <Ranker key={event} event={event} removeEvent={removeEvent} isSmallScreen={this.props.isSmallScreen}/>
            </div>
        )

        // // Ask if they want to take survey
        // return (
        //     <div className='content'>
        //         <div className='take-survey-choice-container white-block rounded'>
        //             <div className='take-survey-choice-inner'>
        //                 <Card.Text className="right-button-container">
        //                     <Button onClick={skip} variant="outline-primary">
        //                         Skip to Rankings 
        //                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
        //                             <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
        //                         </svg>

        //                     </Button>
        //                 </Card.Text>
        //                 <br />
        //                 <Card.Title>{cleanDashes(event)} rankings survey</Card.Title>
        //                 <Card.Text>
        //                     Want to compare a few athletes and say who you think would win in a race to help generate crowd sourced ranking data?
        //                 </Card.Text>
        //                 <Card.Text>
        //                     <Button onClick={takeSurvey} variant="primary">Start Ranking</Button>
        //                 </Card.Text>
        //                 <br></br>
        //             </div>

        //         </div>
        //     </div>
        // )
    }
}
