
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const singletonDate = new Date();

export default class DateUtils {

    static getMonDate(value: number) {
        singletonDate.setTime(value);
        return `${MONTHS_SHORT[singletonDate.getMonth()]} ${singletonDate.getDate()}`;
    }

}
