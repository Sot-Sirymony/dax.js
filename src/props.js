class PropsValidator {
    static types = {
        string: (value) => typeof value === 'string',
        number: (value) => typeof value === 'number',
        boolean: (value) => typeof value === 'boolean',
        array: (value) => Array.isArray(value),
        object: (value) => typeof value === 'object' && value !== null,
        function: (value) => typeof value === 'function'
    };

    static validate(props, schema) {
        const errors = [];
        Object.entries(schema).forEach(([key, rules]) => {
            if (rules.required && props[key] === undefined) {
                errors.push(`Missing required prop: ${key}`);
                return;
            }
            if (props[key] !== undefined && rules.type) {
                const typeValidator = this.types[rules.type];
                if (!typeValidator(props[key])) {
                    errors.push(`Invalid type for prop ${key}`);
                }
            }
            if (rules.validator && !rules.validator(props[key])) {
                errors.push(`Custom validation failed for prop ${key}`);
            }
        });
        return errors;
    }
}

export default PropsValidator;