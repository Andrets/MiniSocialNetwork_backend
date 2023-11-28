export function convertToUtcUtil(dateTime: Date): string {
    const inputDate = new Date(dateTime)
    if (isNaN(inputDate.getTime())) {
        throw new Error('error')
    }
    return inputDate.toUTCString()
}