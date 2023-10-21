class Event {
    constructor(
        public title: string,
        public location: Location,
        public data: Date,
        public description: string,
        public banner: string,
        public coupons: string[],
        public participants: User[],
        public price: Price[],
        public city: string,
        ) {}
}

export { Event }