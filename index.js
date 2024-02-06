const StringUtils = require('./utils')
const { DateTime } = require('luxon')
const Constants = require('./constants')

module.exports = {
  createDateFormatsFromArray,
  removeTrailingZeros,
  validateTimeZone
}

/**
     * Return the "End-Of-Day" value for the provided {@link OffsetDateTime} input at UTC. Any existing TZ Offset value
     * is ignored and is treated as UTC. If the provided {@link OffsetDateTime} is {@code null}, {@code null} is
     * returned.
     * <pre>
     * DateUtils.endOfDay(null)                      = null
     *
     * DateUtils.endOfDay(2018-10-21T06:12:45Z)      = 2018-10-21T23:59:59.999999999Z
     * DateUtils.endOfDay(2018-10-21T06:12:45-04:00) = 2018-10-21T23:59:59.999999999Z
     * </pre>
     *
     * @param dateTime
     *         the {@link OffsetDateTime} to get the "End-Of-Day" value for
     *
     * @return an {@link OffsetDateTime} with Time at "End-Of-Day"
     *
     * @see OffsetDateTime
     */

function endOfDay (input) {
  if (!input) return null

  // Convert input to Luxon DateTime object
  let dateTime
  if (input instanceof Date) {
    dateTime = DateTime.fromJSDate(input)
  }

  if (typeof input === 'string') {
    dateTime = DateTime.fromISO(input)
  }

  if (input instanceof DateTime) {
    dateTime = input // Input is already a Luxon DateTime object
  } else {
    return null // Input is of an unsupported type
  }

  // Sets the time to the end of the day (23:59:59.999) in the local time zone
  return dateTime.endOf('day').toISO({ includeOffset: false }) + 'Z'
}

// function endOfDay (dateTime) {
//   if (!dateTime) return null

//   // Assuming dateTime is a Luxon DateTime object. If not, you might need to convert it first.
//   return DateTime.fromJSDate(new Date(dateTime)).set({
//     hour: 23,
//     minute: 59,
//     second: 59,
//     millisecond: 999
//   }).endOf('day').toUTC().toString()
// }

console.log(
  endOfDay('2018-10-21T06:12:45Z'),
  endOfDay('2018-10-21T06:12:45-04:00')
)

/**
     * Remove trailing zeros from a VistA Date/Time {@link String}. If the date is determined to be "null" according to
     * {@link #isNullish(String)}, {@code null} is returned. If the date does not match the pattern
     * {@code "[\d]+\.[\d]+"}, the value is returned as is. If the date ends with a {@code "."}, the {@code "."} is
     * stripped from the end before returning.
     * <p>
     * The removal of trailing zeros is part of the fileman datetime format <a
     * href="http://www.hardhats.org/fileman/pm/cl_dt.htm">VistA FileMan Date Format</a>. This should only happen if the
     * date contains the time as well (the date contains a {@code "."}).
     * <pre>
     * DateUtils.removeTrailingZeros(null)                   = null
     * DateUtils.removeTrailingZeros("")                     = null
     * DateUtils.removeTrailingZeros("Invalid Date")         = null
     *
     * DateUtils.removeTrailingZeros("20181021")             = "20181021"
     * DateUtils.removeTrailingZeros("20181021.")            = "20181021"
     * DateUtils.removeTrailingZeros("20181021.06")          = "20181021.06"
     * DateUtils.removeTrailingZeros("20181021.060000")      = "20181021.06"
     * DateUtils.removeTrailingZeros("10/21/2018")           = "10/21/2018"
     * </pre>
     *
     * @param dateString
     *         the VistA Date/Time {@link String} to remove trailing zeros from
     *
     * @return the trimmed Date/Time {@link String} or {@code null}
     *
     * @see #isNullish(String)
     * @see #VISTA_DATE_TIME_FORMAT_PATTERN
     */

function removeTrailingZeros (dateString) {
  // Assume isNullish function is defined elsewhere
  if (StringUtils.isNullish(dateString)) return null

  // Adjust the regex pattern to match JavaScript syntax. Example: VISTA_DATE_TIME_FORMAT_PATTERN
  // Note: You need to define the actual regex pattern for VISTA_DATE_TIME_FORMAT_PATTERN based on your requirements
  if (Constants.VISTA_DATE_TIME_FORMAT_PATTERN.test(dateString)) {
    let trimmedString = dateString
    while (trimmedString.includes('.') && (trimmedString.endsWith('0') || trimmedString.endsWith('.'))) {
      trimmedString = trimmedString.slice(0, -1) // Equivalent to StringUtils.chop in Java
    }
    return trimmedString
  }

  if (dateString.endsWith('.')) {
    return dateString.slice(0, -1) // Equivalent to StringUtils.chop in Java
  }

  return dateString
}

function createDateFormatsFromArray (dateFormats = []) {
  return dateFormats.map(format => `[${format}]`).join('')
}

/**
     * Determines if the provided {@link String} TimeZone is valid. If the TimeZone is "blank", according to the
     * {@link StringUtils#isBlank(CharSequence)}, an {@link IllegalArgumentException} is thrown.
     *
     * @param timeZone
     *         the TimeZone {@link String} to validate
     *
     * @see String
     * @see StringUtils#isBlank(CharSequence)
     * @see IllegalArgumentException
     */
function validateTimeZone (str) {
  if (StringUtils.isBlank(str)) {
    throw new Error('\'timeZone\' cannot be empty')
  }
};
