import { bottom } from '@popperjs/core'
import React from 'react'
import default_background from '../../../images/athlete-blank-hero.jpeg'

export default function Choice({ callback, athlete }) {
    return (
        <div
            onClick={() => callback(athlete.name)}
            className='rank-choice-container rounded'
            style={{
                backgroundImage: `url(${athlete.image_url || default_background})`,
            }}
        >
            <div className='athlete-basic-info-container'>
                <div></div>
                <div className='athlete-basic-info'>
                    <h1 className='athlete-basic-info-text'>
                        {athlete.name}
                    </h1>
                </div>
            </div>


        </div>
    )
}
