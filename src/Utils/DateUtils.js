
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const singletonDate = new Date();

export default class DateUtils {

    static getMonDate(value: number): string {
        singletonDate.setTime(value);
        return `${MONTHS_SHORT[singletonDate.getMonth()]} ${singletonDate.getDate()}`;
    }

    static getDayMonDate(value: number): string {
        singletonDate.setTime(value);
        return `${DAYS_SHORT[singletonDate.getDay()]}, ${MONTHS_SHORT[singletonDate.getMonth()]} ${singletonDate.getDate()}`;
    }
}
