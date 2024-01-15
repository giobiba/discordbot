function convertDuration(isoDuration: string): string {
    // regex ISO 8601 duration format
    const regex: RegExp = /P(?:\d+D)?T(?:\d+H)?(?:\d+M)?(?:\d+S)?/;
    const matches: RegExpMatchArray | null = isoDuration.match(regex);

    // safeguard
    if (!matches) {
        return '??:??:??';
    }

    let hours: number = 0;
    let minutes: number = 0;
    let seconds: number = 0;

    const hoursMatch: RegExpMatchArray | null= isoDuration.match(/(\d+)H/);
    const minutesMatch: RegExpMatchArray | null = isoDuration.match(/(\d+)M/);
    const secondsMatch: RegExpMatchArray | null = isoDuration.match(/(\d+)S/);

    if (hoursMatch) {
        hours = parseInt(hoursMatch[1]);
    }
    if (minutesMatch) {
        minutes = parseInt(minutesMatch[1]);
    }
    if (secondsMatch) {
        seconds = parseInt(secondsMatch[1]);
    }

    // HH:MM:SS
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
    ].join(':');
}

export { convertDuration };
