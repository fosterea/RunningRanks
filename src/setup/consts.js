export const events = [
    '100m/women',
    '200m/women',
    "400m/women",
    "800m/women",
    '1500m/women',
    '5000m/women',
    '10000m/women',
    '100mh/women',
    '400mh/women',
    '3000msc/women',
    'marathon/women',
    '100m/men',
    '200m/men',
    '400m/men',
    '800m/men',
    '1500m/men',
    '5000m/men',
    '10000m/men',
    '110mh/men',
    '400mh/men',
    '3000msc/men',
    'marathon/men',
]


export function cleanSlashes(str) {
    return str.replace('/', '-')
}

export function cleanDashes(str) {
    return str.replace('-', ' ')
}

export const cleanEvents = []

for (let i in events) {
    cleanEvents[i] = cleanSlashes(events[i])
}