import BatchUpdate from './batch';
import Memoization from './memo';

class VirtualDOM {
    constructor() {
        this.patches = [];
        this.batchUpdate = new BatchUpdate();
        this.memoization = new Memoization();
    }

    createElement(type, props = {}, ...children) {
        return {
            type,
            props,
            children: children.flat(),
            key: props.key || null
        };
    }

    diff(oldNode, newNode) {
        if (!oldNode) return { type: 'CREATE', newNode };
        if (!newNode) return { type: 'REMOVE' };
        if (this.hasChanged(oldNode, newNode)) return { type: 'REPLACE', newNode };
        if (newNode.type) {
            const patches = [];
            if (oldNode.type === newNode.type) {
                // Handle keyed children
                const oldKeys = this.getChildrenKeys(oldNode.children);
                const newKeys = this.getChildrenKeys(newNode.children);
                const keyedPatches = this.diffKeyedChildren(oldNode.children, newNode.children, oldKeys, newKeys);
                if (keyedPatches) return keyedPatches;
            }
            // Fall back to index-based diffing if no keys are present
            const patchesLength = Math.max(
                oldNode.children.length,
                newNode.children.length
            );
            for (let i = 0; i < patchesLength; i++) {
                patches[i] = this.diff(
                    oldNode.children[i],
                    newNode.children[i]
                );
            }
            return { type: 'PATCH', patches };
        }
    }

    getChildrenKeys(children) {
        const keys = new Map();
        children.forEach((child, index) => {
            if (child && child.key != null) {
                keys.set(child.key, index);
            }
        });
        return keys;
    }

    diffKeyedChildren(oldChildren, newChildren, oldKeys, newKeys) {
        if (oldKeys.size === 0 && newKeys.size === 0) return null;

        const patches = [];
        const moves = [];
        const oldKeyToNode = new Map();
        const newKeyToNode = new Map();
        const remainingKeys = new Set(oldKeys.keys());
        const simulatedOrder = [];

        // Create maps for quick lookups
        oldChildren.forEach((child, index) => {
            if (child && child.key != null) {
                oldKeyToNode.set(child.key, { node: child, index });
                simulatedOrder[index] = child.key;
            }
        });

        newChildren.forEach((child, index) => {
            if (child && child.key != null) {
                newKeyToNode.set(child.key, { node: child, index });
            }
        });

        // First pass: handle updates and removals
        oldChildren.forEach((child, index) => {
            if (child && child.key != null) {
                if (!newKeyToNode.has(child.key)) {
                    patches[index] = { type: 'REMOVE' };
                    simulatedOrder[index] = null;
                } else {
                    const newNode = newKeyToNode.get(child.key).node;
                    if (this.hasChanged(child, newNode)) {
                        patches[index] = { type: 'REPLACE', newNode };
                    }
                    remainingKeys.delete(child.key);
                }
            }
        });

        // Second pass: handle new nodes and moves
        let lastIndex = 0;
        newChildren.forEach((newChild, newIndex) => {
            if (newChild && newChild.key != null) {
                const oldInfo = oldKeyToNode.get(newChild.key);
                if (!oldInfo) {
                    // This is a new node
                    patches[newIndex] = { type: 'CREATE', newNode: newChild };
                } else {
                    // This node exists but might need to move
                    const oldIndex = oldInfo.index;
                    if (oldIndex !== newIndex) {
                        // Node needs to move
                        moves.push({ from: oldIndex, to: newIndex });
                        // Update simulated order
                        const key = simulatedOrder[oldIndex];
                        simulatedOrder.splice(oldIndex, 1);
                        simulatedOrder.splice(newIndex, 0, key);
                    }
                }
            }
        });

        return {
            type: 'KEYED_PATCH',
            patches,
            moves
        };
    }

    hasChanged(oldNode, newNode) {
        return typeof oldNode !== typeof newNode ||
            oldNode.type !== newNode.type ||
            oldNode.key !== newNode.key;
    }

    patch(parent, patches, index = 0) {
        if (!patches) return;
        const update = () => {
            if (patches.type === 'CREATE') {
                const newElement = this.create(patches.newNode);
                parent.appendChild(newElement);
            } else if (patches.type === 'REMOVE') {
                const element = parent.childNodes[index];
                if (element) {
                    parent.removeChild(element);
                }
            } else if (patches.type === 'REPLACE') {
                const oldElement = parent.childNodes[index];
                const newElement = this.create(patches.newNode);
                if (oldElement) {
                    parent.replaceChild(newElement, oldElement);
                } else {
                    parent.appendChild(newElement);
                }
            } else if (patches.type === 'PATCH') {
                const element = parent.childNodes[index];
                if (element) {
                    patches.patches.forEach((patch, i) => {
                        this.patch(element, patch, i);
                    });
                }
            } else if (patches.type === 'KEYED_PATCH') {
                const element = parent.childNodes[index];
                if (!element) return;

                // Store original nodes and create a map for quick lookup
                const originalNodes = Array.from(element.childNodes);
                const nodeMap = new Map();
                const keyToNode = new Map();
                
                // Create maps for quick lookups
                originalNodes.forEach((node, index) => {
                    const key = node.getAttribute('data-key');
                    if (key) {
                        nodeMap.set(key, { node, index });
                        keyToNode.set(key, node);
                    }
                });
                
                // First handle removals
                patches.patches.forEach((patch, i) => {
                    if (patch && patch.type === 'REMOVE') {
                        const node = originalNodes[i];
                        if (node) element.removeChild(node);
                    }
                });

                // Then handle updates and additions
                patches.patches.forEach((patch, i) => {
                    if (!patch) return;
                    
                    if (patch.type === 'CREATE' || patch.type === 'REPLACE') {
                        const newNode = this.create(patch.newNode);
                        if (patch.newNode.key) {
                            keyToNode.set(patch.newNode.key, newNode);
                        }
                        if (i < element.childNodes.length) {
                            element.insertBefore(newNode, element.childNodes[i]);
                        } else {
                            element.appendChild(newNode);
                        }
                    } else if (patch.type !== 'REMOVE') {
                        this.patch(element, patch, i);
                    }
                });

                // Finally handle moves
                if (patches.moves && patches.moves.length > 0) {
                    patches.moves.forEach(({ from, to }) => {
                        const fromNode = element.childNodes[from];
                        if (fromNode) {
                            const toNode = element.childNodes[to];
                            if (toNode !== fromNode) {
                                element.insertBefore(fromNode, toNode || null);
                            }
                        }
                    });
                }
            }
        };
        this.batchUpdate.add(update);
        this.batchUpdate.processSync(); // Use processSync for immediate updates
    }

    create(node) {
        if (typeof node === 'string') {
            return document.createTextNode(node);
        }
        const element = document.createElement(node.type);
        Object.entries(node.props || {}).forEach(([name, value]) => {
            if (name === 'key') {
                element.setAttribute('data-key', value);
            } else if (name.startsWith('on') && typeof value === 'function') {
                const eventName = name.toLowerCase().substring(2);
                element.addEventListener(eventName, value);
            } else if (name === 'className') {
                element.setAttribute('class', value);
            } else {
                element.setAttribute(name, value);
            }
        });
        node.children.forEach(child => {
            element.appendChild(this.create(child));
        });
        return element;
    }
}

export default VirtualDOM;