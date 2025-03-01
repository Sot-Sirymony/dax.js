/**
 * @jest-environment jsdom
 */

import VirtualDOM from '../vdom';

describe('VirtualDOM Key-based Reconciliation', () => {
    let vdom;
    let container;

    beforeEach(() => {
        vdom = new VirtualDOM();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    });

    describe('list reconciliation', () => {
        test('reorders elements based on keys', () => {
            // Initial list
            const initialList = ['A', 'B', 'C'].map(key =>
                vdom.createElement('div', { key }, key)
            );
            const initialRoot = vdom.createElement('div', {}, ...initialList);
            container.appendChild(vdom.create(initialRoot));

            // Reordered list
            const reorderedList = ['B', 'C', 'A'].map(key =>
                vdom.createElement('div', { key }, key)
            );
            const newRoot = vdom.createElement('div', {}, ...reorderedList);

            // Apply patches
            const patches = vdom.diff(initialRoot, newRoot);
            vdom.patch(container, patches, 0);

            // Verify order
            const children = Array.from(container.firstChild.children);
            expect(children.map(child => child.textContent)).toEqual(['B', 'C', 'A']);
        });

        test('efficiently updates list with key-based diffing', () => {
            const createItem = (key, text) => vdom.createElement('div', { key }, text);

            // Initial list
            const initialItems = [
                createItem('1', 'First'),
                createItem('2', 'Second'),
                createItem('3', 'Third')
            ];
            const initialRoot = vdom.createElement('div', {}, ...initialItems);
            container.appendChild(vdom.create(initialRoot));

            // Modified list (reordered + modified)
            const modifiedItems = [
                createItem('3', 'Third'),
                createItem('1', 'First Updated'),
                createItem('4', 'Fourth')
            ];
            const newRoot = vdom.createElement('div', {}, ...modifiedItems);

            // Apply patches
            const patches = vdom.diff(initialRoot, newRoot);
            vdom.patch(container, patches, 0);

            // Verify DOM updates
            const children = Array.from(container.firstChild.children);
            expect(children.map(child => child.textContent))
                .toEqual(['Third', 'First Updated', 'Fourth']);
        });

        test('handles nested keyed elements', () => {
            const createNestedItem = (key, children) => {
                return vdom.createElement('div', { key },
                    ...children.map(([childKey, text]) =>
                        vdom.createElement('span', { key: childKey }, text)
                    )
                );
            };

            // Initial nested structure
            const initialRoot = vdom.createElement('div', {},
                createNestedItem('1', [['a', 'A'], ['b', 'B']]),
                createNestedItem('2', [['c', 'C'], ['d', 'D']])
            );
            container.appendChild(vdom.create(initialRoot));

            // Modified nested structure
            const newRoot = vdom.createElement('div', {},
                createNestedItem('2', [['d', 'D'], ['c', 'C-updated']]),
                createNestedItem('1', [['b', 'B'], ['e', 'E']])
            );

            // Apply patches
            const patches = vdom.diff(initialRoot, newRoot);
            vdom.patch(container, patches, 0);

            // Verify nested structure
            const topLevel = Array.from(container.firstChild.children);
            const firstNestedChildren = Array.from(topLevel[0].children);
            const secondNestedChildren = Array.from(topLevel[1].children);

            expect(firstNestedChildren.map(child => child.textContent))
                .toEqual(['D', 'C-updated']);
            expect(secondNestedChildren.map(child => child.textContent))
                .toEqual(['B', 'E']);
        });
    });
});