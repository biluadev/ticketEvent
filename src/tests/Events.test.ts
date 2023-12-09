import request from 'supertest'
import { App } from '../app';
import { EventUseCase } from '../useCases/EventUseCase';
import { Event } from '../entities/Event';
import crypto from 'node:crypto';

const app = new App()
const express = app.app
describe('Event test', () => {
    it('/POST Event', async() => {
        const event = {
            title: 'Jorge e Mateus',
            price: [{sector: 'Pista', amount: '20'}],
            categories: ['Show'],
            description: 'Evento descrição',
            city: 'Belo Horizonte',
            location: {
                latitude: '-19.8658619',
                longitude: '-43.9737064'
            },
            coupons: [],
            date: new Date(),
            participants: [],
        };
        const response = await request(express)
        .post('/events')
        .field('title', event.title)
        .field('description', event.description)
        .field('city', event.city)
        .field('coupons', event.coupons)
        .field('categories', event.categories)
        .field('location[latitude]', event.location.latitude)
        .field('location[longitude]', event.location.longitude)
        .field('date', event.date.toISOString())
        .field('price[sector]', event.price[0].sector)
        .field('price[amount]', event.price[0].amount)
        .attach('banner', '/Users/jeremias/Downloads/banner.jpg')
        .attach('flyers', '/Users/jeremias/Downloads/flayer1.jpg')
        .attach('flyers', '/Users/jeremias/Downloads/flayer2.jpg');

        if(response.error) {
            console.log('file: Events.test.ts:34 ~ it ~ error:', response.error);
        }

        expect(response.status).toBe(201);
        expect(response.body).toEqual({message: 'Evento criado com sucesso!'});
    });

    it('/GET/:id Get Event By Id', async() => {

        const response = await request(express)
        .get('/events/6547cc2a60dda6de73a41566');

        if(response.error) {
            console.log('file: Events.test.ts:34 ~ it ~ error:', response.error);
        }

        expect(response.status).toBe(200);
    });

    it('/GET/ Event By Location', async() => {

        const response = await request(express)
        .get('/events?latitude=-19.8658619&longitude=-43.9737064');

        if(response.error) {
            console.log('file: Events.test.ts:34 ~ it ~ error:', response.error);
        }

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('/GET/ Event By Category', async() => {

        const response = await request(express)
        .get('/events/category/Show');

        if(response.error) {
            console.log('file: Events.test.ts:34 ~ it ~ error:', response.error);
        }

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('/POST event insert user', async() => {

        const response = await request(express)
        .post('/events/6547cc2a60dda6de73a41566/participants').send({
            name: 'Bilua',
            email: crypto.randomBytes(20).toString('hex')+'@teste.com'
        });

        if(response.error) {
            console.log('file: Events.test.ts:34 ~ it ~ error:', response.error);
        }

        expect(response.status).toBe(200);
    });

});
const eventRepository = {
    add: jest.fn(),
    findEventsByCategory: jest.fn(),
    findByLocationAndDate: jest.fn(),
    findEventsByCity: jest.fn(),
    findEventsByName: jest.fn(),
    findEventById: jest.fn(),
    update: jest.fn()
}
const eventUseCase = new EventUseCase(eventRepository);
const event:Event = {
    title: 'Jorge e Mateus',
    price: [{sector: 'Pista', amount: '20'}],
    categories: ['Show'],
    description: 'Evento descrição',
    city: 'Belo Horizonte',
    location: {
        latitude: '-19.8658619',
        longitude: '-43.9737064'
    },
    banner: 'banner.png',
    flyers: ['flyer1.png', 'flyer2.png'],
    coupons: [],
    date: new Date(),
    participants: [],
};
describe('Unit Test', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should return an array of events by category', async () => {

        eventRepository.findEventsByCategory.mockResolvedValue([event]);

        const result = await eventUseCase.findEventsByCategory('show');
        console.log(result);

        expect(result).toEqual([event]);
        expect(eventRepository.findEventsByCategory).toBeCalledWith('Show')
    });

    it('should return an array of events by name', async () => {

        eventRepository.findEventsByName.mockResolvedValue([event]);

        const result = await eventUseCase.findEventsByName('Jorge e Mateus');
        console.log(result);

        expect(result).toEqual([event]);
        expect(eventRepository.findEventsByName).toBeCalledWith('Jorge e Mateus')
    });

    it('should return an event by Id', async () => {

        eventRepository.findEventById.mockResolvedValueOnce(event);

        const result = await eventUseCase.findEventsById('6547cc2a60dda6de73a41566');
        console.log(result);

        expect(result).toEqual(event);
        expect(eventRepository.findEventById).toBeCalledWith('6547cc2a60dda6de73a41566')
    });
})