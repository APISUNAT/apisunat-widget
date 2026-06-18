const TODAY = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
const DEFAULT_CURRENCY = "PEN";

export function getCurrentTime() {
    return new Date().toLocaleTimeString('es-PE', {
        timeZone: 'America/Lima',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

export function resolveHeaderOptions(doc: Record<string, any>) {
    const hasDate     = !!doc["cbc:IssueDate"]?._text;
    const hasTime     = !!doc["cbc:IssueTime"]?._text;
    const hasCurrency = !!doc["cbc:DocumentCurrencyCode"]?._text;

    const date     = hasDate ? doc["cbc:IssueDate"]._text : TODAY();
    const currency = hasCurrency ? doc["cbc:DocumentCurrencyCode"]._text : DEFAULT_CURRENCY;

    // Solo generamos time si tampoco vino, Y la fecha tampoco vino
    // (si ya había fecha pero no hora, no inventamos hora)
    const time = hasTime
        ? doc["cbc:IssueTime"]._text
        : (hasDate ? undefined : getCurrentTime());

    return {
        values: { date, time, currency },
        needsSync: !hasDate || !hasCurrency,
    };
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