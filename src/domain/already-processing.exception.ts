export class AlreadyProcessing extends Error {
    constructor(message: string) {
        super(`Already processing: ${message}`);
        this.name = 'AlreadyProcessing';
    }
}
