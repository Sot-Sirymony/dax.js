class EventManager {
    constructor() {
        this.events = new Map();
        this.errorHandler = null;
        this.maxListeners = 10;
    }

    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        const handlers = this.events.get(event);
        if (handlers.size >= this.maxListeners) {
            this.handleError(new Error(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`));
            return;
        }
        handlers.add(handler);
        return () => this.off(event, handler);
    }

    once(event, handler) {
        const wrappedHandler = (...args) => {
            this.off(event, wrappedHandler);
            handler(...args);
        };
        return this.on(event, wrappedHandler);
    }

    off(event, handler) {
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }

    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    this.handleError(error);
                }
            });
        }
    }

    setMaxListeners(n) {
        this.maxListeners = n;
    }

    setErrorHandler(handler) {
        this.errorHandler = handler;
    }

    handleError(error) {
        console.error('EventManager Error:', error);
        if (this.errorHandler) {
            this.errorHandler(error);
        }
    }

    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    destroy() {
        this.removeAllListeners();
        this.errorHandler = null;
    }
}

export default EventManager;