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

        // Verificar se já existe um evento no mesmo local e horário
        const verifyEvent = await this.eventRepository.findByLocationAndDate(
            eventData.location, 
            eventData.date,
        );

        if (verifyEvent) {
            throw new HttpException(400, 'Event already exists');
        }

        const cityName = await this.getCityNameByCoordinates(
            eventData.location.latitude,
            eventData.location.longitude,
        );

        eventData = {
            ...eventData,
            city: cityName,
        }

        const result = await this.eventRepository.add(eventData);
        return result;
    }

    //AIzaSyDc77KQSkLI_q8FecSrTlyFXy-U56hnBs8
    private async getCityNameByCoordinates(latitude: string, longitude: string) {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDc77KQSkLI_q8FecSrTlyFXy-U56hnBs8`
            );

            // console.log(
            //     '~ file: EventUseCase.ts:31 ~ EventUseCase ~ getCityNameByCoordinates ~ response:', 
            //     response.data.results[0].address_components,
            // );

            // Dica da IA no primeiro if (Verificar se a api pega)

            if (response.data.status !== 'OK' || response.data.results.length === 0) {
                throw new HttpException(400, 'Invalid response from Google Maps API');

            } else if (response.data.status === 'OK' && response.data.results.length > 0) {
                const address = response.data.results[0].add
                const cityType = address.find(
                    (type: any) =>
                        type.types.includes('administrative_area_level_2') &&
                        type.types.includes('political'),
                );

                // console.log(cityType)
                return cityType.long_name;
            }

            throw new HttpException(404, 'City not found');

        } catch (error) {
            throw new HttpException(401, 'Error request city name');
        }

    }
}


export { EventUseCase };