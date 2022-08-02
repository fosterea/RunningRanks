import React from 'react'
import PersonButton from './PersonButton'

export default function Selector({ active, setActive, people }) {
    const toggle = (name) => {
        let new_active = {...active}
        new_active[name] = !new_active[name]
        setActive(new_active)
    }

    return (
        <div className='selector-container'>
            { people.map((person) => (
                <PersonButton name={person} key={person} toggle={toggle} active={active[person]} />
            ))}
        </div>
    )
}
