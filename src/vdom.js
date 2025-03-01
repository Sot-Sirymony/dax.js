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

    hasChanged(oldNode, newNode) {
        return typeof oldNode !== typeof newNode ||
            oldNode.type !== newNode.type ||
            oldNode.key !== newNode.key;
    }

    patch(parent, patches, index = 0) {
        if (!patches) return;
        const update = () => {
            if (patches.type === 'CREATE') {
                parent.appendChild(this.create(patches.newNode));
            } else if (patches.type === 'REMOVE') {
                parent.removeChild(parent.childNodes[index]);
            } else if (patches.type === 'REPLACE') {
                parent.replaceChild(
                    this.create(patches.newNode),
                    parent.childNodes[index]
                );
            } else if (patches.type === 'PATCH') {
                const element = parent.childNodes[index];
                patches.patches.forEach((patch, i) => {
                    this.patch(element, patch, i);
                });
            }
        };
        this.batchUpdate.add(update);
    }

    create(node) {
        if (typeof node === 'string') {
            return document.createTextNode(node);
        }
        const element = document.createElement(node.type);
        Object.entries(node.props || {}).forEach(([name, value]) => {
            element.setAttribute(name, value);
        });
        node.children.forEach(child => {
            element.appendChild(this.create(child));
        });
        return element;
    }
}

export default VirtualDOM;