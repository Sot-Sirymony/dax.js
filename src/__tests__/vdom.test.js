import VirtualDOM from '../vdom';

describe('VirtualDOM', () => {
    let vdom;

    beforeEach(() => {
        vdom = new VirtualDOM();
    });

    describe('createElement', () => {
        test('creates a simple element', () => {
            const element = vdom.createElement('div');
            expect(element).toEqual({
                type: 'div',
                props: {},
                children: [],
                key: null
            });
        });

        test('creates element with props', () => {
            const element = vdom.createElement('div', { className: 'test', key: 'test-key' });
            expect(element).toEqual({
                type: 'div',
                props: { className: 'test', key: 'test-key' },
                children: [],
                key: 'test-key'
            });
        });

        test('creates element with children', () => {
            const element = vdom.createElement('div', {},
                vdom.createElement('span'),
                'text'
            );
            expect(element.children.length).toBe(2);
            expect(element.children[0].type).toBe('span');
            expect(element.children[1]).toBe('text');
        });
    });

    describe('diff', () => {
        test('returns CREATE patch when old node is null', () => {
            const newNode = vdom.createElement('div');
            const patch = vdom.diff(null, newNode);
            expect(patch).toEqual({ type: 'CREATE', newNode });
        });

        test('returns REMOVE patch when new node is null', () => {
            const oldNode = vdom.createElement('div');
            const patch = vdom.diff(oldNode, null);
            expect(patch).toEqual({ type: 'REMOVE' });
        });

        test('returns REPLACE patch when nodes are different', () => {
            const oldNode = vdom.createElement('div');
            const newNode = vdom.createElement('span');
            const patch = vdom.diff(oldNode, newNode);
            expect(patch).toEqual({ type: 'REPLACE', newNode });
        });

        test('returns PATCH for children changes', () => {
            const oldNode = vdom.createElement('div', {}, vdom.createElement('span'));
            const newNode = vdom.createElement('div', {}, vdom.createElement('p'));
            const patch = vdom.diff(oldNode, newNode);
            expect(patch.type).toBe('PATCH');
            expect(patch.patches[0].type).toBe('REPLACE');
        });
    });

    describe('hasChanged', () => {
        test('detects type changes', () => {
            const oldNode = vdom.createElement('div');
            const newNode = vdom.createElement('span');
            expect(vdom.hasChanged(oldNode, newNode)).toBe(true);
        });

        test('detects key changes', () => {
            const oldNode = vdom.createElement('div', { key: 'old' });
            const newNode = vdom.createElement('div', { key: 'new' });
            expect(vdom.hasChanged(oldNode, newNode)).toBe(true);
        });
    });
});