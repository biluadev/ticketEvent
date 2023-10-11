import express, { Application } from "express";

class App {
    public app: Application;
    constructor() {
        this.app = express();
        this.middlewaresInitialize();
        this.initializeRoutes();
        this.interceptionErro();
    }

    initializeRoutes() {
        // this.app.use('/',);
    }

    interceptionErro() {
        // this.app.use();
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