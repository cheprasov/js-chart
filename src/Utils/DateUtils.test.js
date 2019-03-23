
import DateUtils from './DateUtils';

const getTimeByDate = (date) => {
    return (new Date(date)).getTime();
};

describe('DateUtils', () => {
    describe('getMonDate', () => {
        it ('should return correct date by time', () => {
            expect(DateUtils.getMonDate(getTimeByDate('10/10/1984'))).toEqual('Oct 10');
            expect(DateUtils.getMonDate(getTimeByDate('12/30/1982'))).toEqual('Dec 30');
            expect(DateUtils.getMonDate(getTimeByDate('03/10/2019'))).toEqual('Mar 10');
            expect(DateUtils.getMonDate(getTimeByDate('03/24/2019'))).toEqual('Mar 24');
        });
    });

    describe('getDayMonDate', () => {
        it ('should return correct date by time', () => {
            expect(DateUtils.getDayMonDate(getTimeByDate('10/10/1984'))).toEqual('Wed, Oct 10');
            expect(DateUtils.getDayMonDate(getTimeByDate('12/30/1982'))).toEqual('Thu, Dec 30');
            expect(DateUtils.getDayMonDate(getTimeByDate('03/10/2019'))).toEqual('Sun, Mar 10');
            expect(DateUtils.getDayMonDate(getTimeByDate('03/24/2019'))).toEqual('Sun, Mar 24');
        });
    });
});
