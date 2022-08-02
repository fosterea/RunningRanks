import React from 'react'
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts'

const colors = [
    '#3366cc',
    "#dc3912",
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
    '#b77322',
    '#16d620',
    '#b91383',
    '#f4359e',
    '#9c5935',
    '#a9c413',
    '#2a778d',
    '#668d1c',
    '#bea413',
    '#0c5922',
    '#743411',
]


export default function Chart({ logs, active, people }) {

    if (active.length == 0) {
        return
    }

    const timeFormatter = (millis) => {
        let date = new Date()
        date.setTime(millis)
        return date.toLocaleDateString('en-US')
    }

    return (
        <ResponsiveContainer width={'100%'} height={500}>
            <LineChart data={logs}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="milles"
                    domain={['auto', 'auto']}
                    name='Time'
                    tickFormatter={timeFormatter}
                    tick={<CustomizedXAxisTick />}
                    type='number' />
                <YAxis tickFormatter={asPercent} domain={[0, 1]} />
                <Tooltip formatter={asPercent} labelFormatter={timeFormatter} />
                {/* <Legend /> */}

                {people.map((name, i) => {
                    if (active[name]) {
                        return <Line key={name} type="monotone" dataKey={name} stroke={colors[i]} />
                    }
                })}
            </LineChart>
        </ ResponsiveContainer>
    )
}

function asPercent(x) {
    x *= 100
    let num = (Math.round(x * 1 * 10) / 1 / 10)
    return `${num}%`
}

const timeFormatter = (millis) => {
    let date = new Date()
    date.setTime(millis)
    return date.toLocaleDateString('en-US')
}

function CustomizedXAxisTick({ x, y, payload }) {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-40} y={30}
                textAnchor="start"
                fill="#666">{timeFormatter(payload.value)}</text>
        </g>
    );
}
