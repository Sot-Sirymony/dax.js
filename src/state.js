class StateManager {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.batchUpdates = new Set();
        this.isBatchingUpdates = false;
        this.pendingStateUpdates = new Map();
    }

    setState(key, value) {
        if (this.isBatchingUpdates) {
            this.pendingStateUpdates.set(key, value);
            return;
        }
        this.updateState(key, value);
    }

    batchUpdate(updates) {
        this.isBatchingUpdates = true;
        requestAnimationFrame(() => {
            try {
                updates();
                this.flushBatchedUpdates();
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isBatchingUpdates = false;
            }
        });
    }

    flushBatchedUpdates() {
        this.pendingStateUpdates.forEach((value, key) => {
            this.updateState(key, value);
        });
        this.pendingStateUpdates.clear();
    }

    updateState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    this.handleError(error);
                }
            });
        }
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);

        return () => {
            const subscribers = this.subscribers.get(key);
            if (subscribers) {
                subscribers.delete(callback);
                if (subscribers.size === 0) {
                    this.subscribers.delete(key);
                }
            }
        };
    }

    handleError(error) {
        console.error('StateManager Error:', error);
        // Implement state rollback mechanism here
        if (this.errorBoundary) {
            this.errorBoundary(error);
        }
    }

    setErrorBoundary(handler) {
        this.errorBoundary = handler;
    }

    destroy() {
        this.state = {};
        this.subscribers.clear();
        this.pendingStateUpdates.clear();
        this.errorBoundary = null;
    }
}

export default StateManager;