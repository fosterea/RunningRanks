import React, {useEffect} from 'react'
import { useUserAuth } from '../../setup/UserAuthContext';
import SignIn from '../SignIn';
import Survey from './Survey/Survey';
import Ranks from './Ranks/Ranks'
import { useMediaQuery } from 'react-responsive';

export default function Event( {event}) {

    const { user, userDoc } = useUserAuth();
    const isSmallScreen = useMediaQuery({ query: `(max-width: 1150px)` });

    // Check if logged in
    if (!user) {
        return (
            <SignIn />
        )
    }

    if (userDoc === undefined || userDoc.event_submitions === undefined || user.loading === true) {
        return "loading..."
    }

    

    // Check if user has viewed the event before in 
    // the correct time period
    if (must_fill_out_survey(userDoc.event_submitions[event]))  {
        return <Survey key={event} event={event} isSmallScreen={isSmallScreen} />
    } else {
        // If user has done or skiped survey
        return <Ranks key={event} event={event} isSmallScreen={isSmallScreen} />
    }
}


function must_fill_out_survey(fire_date) {
    // Check if null
    if (fire_date == null) {
        return true
    }

    // Find diff and compare to re take delta
    let filledOut = fire_date.toDate()
    let now = new Date()
    let diff = now - filledOut

    const num_days = 7

    let allowed_delta = num_days * 1000 * 60 * 60 * 24
    
    return diff > allowed_delta

}