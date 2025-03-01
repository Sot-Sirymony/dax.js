class LifecycleManager {
    constructor(component) {
        this.component = component;
        this.hooks = new Map();
    }

    addHook(name, callback) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name).push(callback);
    }

    runHook(name, ...args) {
        const hooks = this.hooks.get(name) || [];
        hooks.forEach(hook => hook.apply(this.component, args));
    }
}

export default LifecycleManager;