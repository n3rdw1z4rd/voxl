export type Listener = (...args: any[]) => void;

export class Emitter {
    private listeners: Map<string, Listener[]> = new Map<string, Listener[]>();

    public on(eventName: string, listener: Listener): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(listener);
    }

    public remove(eventName: string, listener: Listener): void {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            this.listeners.set(eventName, eventListeners.filter(l => l !== listener));
        }
    }

    public emit(eventName: string, ...args: any[]): void {
        this.listeners.get(eventName)?.forEach(listener => listener(...args, eventName));
    }
}
