const REAL_DATE = Date

const IS_TEST = process.env.NODE_ENV === 'test'

module.exports = {
  setMockDate,
  resetGlobalDate
}

function setMockDate ({ dateString, convertToZeroHoursDateString = false }) {
  // Setting mockDate to pass the courseThreshold check
  if (!IS_TEST) return

  if (convertToZeroHoursDateString) dateString = dateString + 'T00:00:00.000Z'
  const mockDate = new Date(dateString)
  global.Date = class extends REAL_DATE {
    constructor (customDate) {
      super(customDate)
      if (customDate) return new REAL_DATE(customDate)
      return mockDate
    }
  }
}

/**
 * resets the global Date object to what it should be originally
 * Always run this function when you have used setMockDate
 */
function resetGlobalDate () {
  global.Date = REAL_DATE
}
