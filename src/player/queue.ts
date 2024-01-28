export class Queue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: T | T[]): void {
        if (this.size() === this.capacity) throw Error('Queue has reached max capacity');
        if (Array.isArray(item)) {
            this.storage.push(...item);
        }
        else {
            this.storage.push(item);
        }
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

    map(func: ((T) => any)) {
        return this.storage.map(func);
    }
}
