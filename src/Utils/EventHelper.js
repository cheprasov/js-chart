// @flow

export default class EventHelper {

    static getClientX(event: MouseEvent | TouchEvent): null | number {
        if (event.touches) {
            if (event.touches.length === 1) {
                return event.touches[0].clientX;
            }
            return null;
        }
        return event.clientX || null;
    }

}
