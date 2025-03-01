class Memoization {
    constructor() {
        this.cache = new WeakMap();
        this.memoizedNodes = new Map();
        this.maxCacheSize = 1000;
    }

    memoize(key, vnode, dependencies = []) {
        const cacheKey = this.createCacheKey(key, dependencies);
        
        if (this.shouldUpdateCache(cacheKey, dependencies)) {
            const cachedNode = this.memoizedNodes.get(cacheKey);
            if (cachedNode) {
                return cachedNode.vnode;
            }

            this.memoizedNodes.set(cacheKey, {
                vnode: this.deepClone(vnode),
                dependencies: [...dependencies],
                lastAccessed: Date.now()
            });

            // Cleanup if cache size exceeds limit
            if (this.memoizedNodes.size > this.maxCacheSize) {
                this.cleanup();
            }
        }

        return this.memoizedNodes.get(cacheKey).vnode;
    }

    createCacheKey(key, dependencies) {
        return `${key}-${dependencies.join('-')}`;
    }

    shouldUpdateCache(cacheKey, newDependencies) {
        const cached = this.memoizedNodes.get(cacheKey);
        if (!cached) return true;

        cached.lastAccessed = Date.now();
        return !this.areDepsSame(cached.dependencies, newDependencies);
    }

    areDepsSame(oldDeps, newDeps) {
        if (oldDeps.length !== newDeps.length) return false;
        return oldDeps.every((dep, i) => Object.is(dep, newDeps[i]));
    }

    deepClone(vnode) {
        if (!vnode || typeof vnode !== 'object') return vnode;
        if (Array.isArray(vnode)) {
            return vnode.map(item => this.deepClone(item));
        }
        const clone = {};
        for (const key in vnode) {
            if (vnode.hasOwnProperty(key)) {
                clone[key] = this.deepClone(vnode[key]);
            }
        }
        return clone;
    }

    cleanup() {
        const entries = Array.from(this.memoizedNodes.entries());
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        // Remove oldest 20% of entries
        const removeCount = Math.floor(this.memoizedNodes.size * 0.2);
        entries.slice(0, removeCount).forEach(([key]) => {
            this.memoizedNodes.delete(key);
        });
    }

    clear() {
        this.memoizedNodes.clear();
    }
}

export default Memoization;