/**
 * Validates phone number format
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    // Allows formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX (10 digits)
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validates email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Formats phone number to standard format
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+${cleaned}`;
    }
    return phone;
};

/**
 * Validates the entire form data
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateForm = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) {
        errors.name = 'Name is required';
    }

    if (!formData.phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
        errors.phone = 'Invalid phone number format';
    }

    if (formData.email && !isValidEmail(formData.email)) {
        errors.email = 'Invalid email format';
    }

    if (!formData.programName) {
        errors.programName = 'Program name is required';
    }

    if (!formData.programDate) {
        errors.programDate = 'Program date is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};