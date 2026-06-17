export function getCurrentTime() {
    return new Date().toLocaleTimeString('es-PE', {
        timeZone: 'America/Lima',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export function buildHeaderOptionsAction(data: {
    date: string
    currency: string
    time?: string
}) {
    return {
        'cbc:IssueDate': { _text: data.date },
        ...(data.time ? {
            'cbc:IssueTime': { _text: data.time }
        } : {}),
        'cbc:DocumentCurrencyCode': { _text: data.currency },
    }
}