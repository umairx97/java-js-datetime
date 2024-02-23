const { ChronoUnit } = require('@js-joda/core');
// Helper to map unit tokens to ChronoUnit
const UNIT_MAP = {
    'D': ChronoUnit.DAYS,
    'M': ChronoUnit.MONTHS,
    // Add other mappings as necessary
};

// Parse adjustment string into components
function parseAdjuster(dateAdjustment) {
    const amount = parseInt(dateAdjustment, 10);
    const unitToken = dateAdjustment.replace(/^\d+/, '');
    const unit = UNIT_MAP[unitToken] || ChronoUnit.DAYS; // Default to DAYS if no unit specified

    if (isNaN(amount)) {
        console.log("Failed to parse relative date adjustment", dateAdjustment);
        return null;
    }

    return { amount, unit };
}

// Apply adjustment to a LocalDateTime
function adjustRelativeDate(localDateTime, { amount, unit }, direction) {
    switch (direction) {
        case '+':
            return localDateTime.plus(amount, unit);
        case '-':
            return localDateTime.minus(amount, unit);
        default:
            return localDateTime; // No adjustment if direction is not recognized
    }
}


module.exports = {
    adjustRelativeDate,
    parseAdjuster
}