import { BadRequestError } from "@/utils/errors/index"

interface ValidationRule {
    condition: boolean;
    message: string;
};

export const throwIfInvalid = (rules: ValidationRule[]) => {
    const errors = rules
        .filter(rule => rule.condition)
        .map(rule => rule.message);

    if (errors.length > 0) {
        throw new BadRequestError("Validation failed", errors);
    }
};
