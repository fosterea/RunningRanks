import React from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { events, cleanDashes } from '../../../setup/consts'

export default function NextBTN({ event }) {
    let next_event = events[events.indexOf(event) + 1]

    if (next_event == null) {
        var message = `Return to ${cleanDashes(events[0])}`
        next_event = events[0]
    } else {
        var message = `Next event: ${cleanDashes(next_event)}`
    }

    return (
        <LinkContainer to={`/events/${next_event}`} >
            <Button varient='primary'>
                {message}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                    <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                </svg>
            </Button>
        </LinkContainer>

    )
}
