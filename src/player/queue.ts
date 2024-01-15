export class Queue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: T): void {
        if (this.size() === this.capacity) throw Error('Queue has reached max capacity');
        this.storage.push(item);
    }

    dequeue(): T | null {
        return this.storage.shift() || null;
    }

    size(): number {
        return this.storage.length;
    }

    clear() {
        this.storage = [];
    }
}
