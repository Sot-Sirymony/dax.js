class BatchUpdate {
    constructor() {
        this.queue = new Set();
        this.isProcessing = false;
        this.nextTick = Promise.resolve();
    }

    add(update) {
        this.queue.add(update);
        if (!this.isProcessing) {
            this.processSync();
        }
    }

    async process() {
        this.isProcessing = true;
        await this.nextTick;
        
        try {
            this.queue.forEach(update => {
                try {
                    update();
                } catch (error) {
                    console.error('Error in batch update:', error);
                }
            });
        } finally {
            this.queue.clear();
            this.isProcessing = false;
        }
    }

    processSync() {
        this.isProcessing = true;
        try {
            this.queue.forEach(update => {
                try {
                    update();
                } catch (error) {
                    console.error('Error in batch update:', error);
                }
            });
        } finally {
            this.queue.clear();
            this.isProcessing = false;
        }
    }

    clear() {
        this.queue.clear();
        this.isProcessing = false;
    }

    get size() {
        return this.queue.size;
    }

    get isPending() {
        return this.isProcessing;
    }
}

export default BatchUpdate;