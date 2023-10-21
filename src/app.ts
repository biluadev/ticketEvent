import express, { Application } from 'express';
import { connect } from './infra/database';
import { errorMiddleware } from './middlewares/error.middlewares';
import { EventRoutes } from './routes/event.routes';

class App {
    public app: Application;
    private eventRoutes = new EventRoutes();
    constructor() {
        this.app = express();
        this.middlewaresInitialize();
        this.initializeRoutes();
        this.interceptionErro();
        connect();
    }

    initializeRoutes() {
        this.app.use('/events', this.eventRoutes.router);
    }

    interceptionErro() {
        this.app.use(errorMiddleware);
    }

    middlewaresInitialize() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));//convert texto em rul. hello world => hello%20world
    }

    listen() {
        this.app.listen(3333, () => console.log(`server is running`));
    }
}

export { App };