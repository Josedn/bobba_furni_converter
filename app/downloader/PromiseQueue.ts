export default class PromiseQueue {
    queue: { (): Promise<any> }[];
    currentPromises: number;
    maxConcurrentPromises: number;

    constructor(maxConcurrentPromises: number) {
        this.queue = [];
        this.currentPromises = 0;
        this.maxConcurrentPromises = maxConcurrentPromises;
    }

    push(promise: () => Promise<any>) {
        this.queue.push(promise);
        if (this.currentPromises <= this.maxConcurrentPromises) {
            this._moveNext();
        }
    }

    _moveNext() {
        if (this.currentPromises <= this.maxConcurrentPromises && this.queue.length > 0) {
            const currentPromise = this.queue.shift();
            if (currentPromise != null) {
                currentPromise().then(() => {
                    this.currentPromises--;
                    this._moveNext();
                });
            }
            this.currentPromises++;
        }
    }
}