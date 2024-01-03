import axios from 'axios';
import { Event } from '../entities/Event';
import { HttpException } from '../interfaces/HttpExceptions';
import { EventRepository } from '../repositories/EventRepository';
import { UserRepositoryMongoose } from '../repositories/UserRepositoryMongoose';
class EventUseCase {
    constructor(private eventRepository: EventRepository) { }

    async create(eventData: Event) {
        if (!eventData.banner) {
            throw new HttpException(400, 'Banner is required');
        }

        if (!eventData.flyers) {
            throw new HttpException(400, 'Flyers is required');
        }

        if (!eventData.date) {
            throw new HttpException(400, 'Date is required');
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
            city: cityName.cityName,
            formattedAddress: cityName.formattedAddress,
        }

        const result = await this.eventRepository.add(eventData);
        return result;
    }

    async findEventByLocation(latitude: string, longitude: string) {
        const cityName = await this.getCityNameByCoordinates(latitude, longitude);

        const findEventsByCity = await this.eventRepository.findEventsByCity(cityName.cityName);

        const eventWithRadius = findEventsByCity.filter(event => {
            const distance = this.calculateDistance(
                Number(latitude),
                Number(longitude),
                Number(event.location.latitude),
                Number(event.location.longitude)
            )

            return distance <= 3;
        });

        return eventWithRadius;
    }

    async findEventsByCategory(category: string) {
        if(!category) throw new HttpException(400, 'Category is required')
        const events = await this.eventRepository.findEventsByCategory(category)

        return events;
    }

    async findEventsByName(name: string) {
        if(!name) throw new HttpException(400, 'Name is required')
        const events = await this.eventRepository.findEventsByName(name)

        return events;
    }

    async findEventsById(id: string) {
        if(!id) throw new HttpException(400, 'Id is required')
        const events = await this.eventRepository.findEventById(id)

        return events;
    }

    async addParticipant(id: string, name: string, email: string) {
        const event = await this.eventRepository.findEventById(id)

        if(!event) throw new HttpException(400, 'Event Not Found!')

        const userRepository = new UserRepositoryMongoose()
        const participant = {
            name,
            email
        };

        let user: any = {}
        const verifyIsUserExists = await userRepository.verifyIsUserExists(email)
        if (!verifyIsUserExists){

            user = userRepository.add(participant);

        }else{
            user = verifyIsUserExists
        }

        if(event.participants.includes(user._id))
        throw new HttpException(400, "User already exist")

        event.participants.push(user._id);

        const updateEvent = await this.eventRepository.update(event, id);

        return event;
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

                const formattedAddress = response.data.results[0].formatted_address;
                // console.log(cityType)
                return {
                    cityName: cityType.long_name,
                    formattedAddress,
                };
            }

            throw new HttpException(404, 'City not found');

        } catch (error) {
            throw new HttpException(401, 'Error request city name');
        }

    }

    private calculateDistance(
        latitude1: number,
        longitude1: number,
        latitude2: number,
        longitude2: number
    ): number {
        const R = 6371; //Raio da terra em quilômetros
        const dLatitude = this.deg2rad(latitude2 - latitude1);
        const dLongitude = this.deg2rad(longitude2 - longitude1);
        const a = 
            Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) + 
            Math.cos(this.deg2rad(latitude1)) * 
            Math.cos(this.deg2rad(latitude2)) *
            Math.sin(dLongitude / 2) *
            Math.sin(dLongitude / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}


export { EventUseCase };