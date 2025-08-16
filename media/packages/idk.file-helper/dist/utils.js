/**
 * Example utility functions
 */
export const formatDate = (date) => {
    return date.toISOString();
};
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
//# sourceMappingURL=utils.js.map