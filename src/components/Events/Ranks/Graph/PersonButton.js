import React from 'react'

export default function PersonButton({ name, toggle, active }) {

    let className = 'person-button '

    if (active) {
        className += 'active-person'
    } else {
        className += 'inactive-person'
    }

    return (
        <div className={className} onClick={() => toggle(name)}>{name}</div>
    )
}
