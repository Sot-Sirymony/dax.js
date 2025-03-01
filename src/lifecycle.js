class LifecycleManager {
    constructor(component) {
        this.component = component;
        this.hooks = new Map();
        this.cleanupFunctions = new Set();
        this.isDestroyed = false;
    }

    onBeforeMount(callback) {
        this.addHook('beforeMount', callback);
    }

    onMounted(callback) {
        this.addHook('mounted', callback);
    }

    onBeforeUpdate(callback) {
        this.addHook('beforeUpdate', callback);
    }

    onUpdated(callback) {
        this.addHook('updated', callback);
    }

    onBeforeDestroy(callback) {
        this.addHook('beforeDestroy', callback);
    }

    onDestroyed(callback) {
        this.addHook('destroyed', callback);
    }

    onError(callback) {
        this.addHook('error', callback);
    }

    addHook(name, callback) {
        if (this.isDestroyed) {
            console.warn('Cannot add hook to destroyed component');
            return;
        }

        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name).push(callback);
    }

    runHook(name, ...args) {
        if (this.isDestroyed && name !== 'destroyed') {
            console.warn('Cannot run hooks on destroyed component');
            return;
        }

        const hooks = this.hooks.get(name) || [];
        hooks.forEach(hook => {
            try {
                hook.apply(this.component, args);
            } catch (error) {
                this.handleError(error);
            }
        });
    }

    addCleanup(cleanup) {
        if (typeof cleanup === 'function') {
            this.cleanupFunctions.add(cleanup);
        }
    }

    handleError(error) {
        console.error('Lifecycle Error:', error);
        this.runHook('error', error);
    }

    destroy() {
        if (this.isDestroyed) return;

        try {
            this.runHook('beforeDestroy');
            this.cleanupFunctions.forEach(cleanup => {
                try {
                    cleanup();
                } catch (error) {
                    this.handleError(error);
                }
            });
            this.cleanupFunctions.clear();
            this.hooks.clear();
            this.isDestroyed = true;
            this.runHook('destroyed');
        } catch (error) {
            this.handleError(error);
        } finally {
            this.component = null;
        }
    }
}

export default LifecycleManager;