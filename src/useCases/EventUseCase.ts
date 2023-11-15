import axios from 'axios';
import { Event } from '../entities/Event';
import { HttpException } from '../interfaces/HttpExceptions';
import { EventRepository } from '../repositories/EventRepository';
class EventUseCase {
    constructor(private eventRepository: EventRepository) { }

    async create(eventData: Event) {
        if (!eventData.banner) {
            throw new HttpException(400, 'Banner is required');
        }

        if (!eventData.flyers) {
            throw new HttpException(400, 'Flyers is required');
        }

        if (!eventData.location) {
            throw new HttpException(400, 'Location is required');
        }

        const cityName = this.getCityNameByCoordinates(
            eventData.location.latitude,
            eventData.location.longitude,
        );

        const result = await this.eventRepository.add(eventData);
        return result;
    }

    //AIzaSyDc77KQSkLI_q8FecSrTlyFXy-U56hnBs8
    private async getCityNameByCoordinates(latitude: string, longitude: string) {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDc77KQSkLI_q8FecSrTlyFXy-U56hnBs8`
        );

        console.log('CHEGUEI!', response.data);
    }
}

export { EventUseCase };