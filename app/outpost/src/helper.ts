/**
 * Gets a datetime string for backup files.
 *
 * This function returns a datetime string in the format of "YYYYMMDD-HHMMSS".
 * For example: "20260630-184624"
 */
export function getDateTimeStringForBackup(): string {
    const date = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const datePart = [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('')
    const timePart = [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].join('')

    return `${datePart}-${timePart}`
}
