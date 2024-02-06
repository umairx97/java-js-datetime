const { LocalDateTime, LocalDate, LocalTime, ZoneOffset } = require('@js-joda/core')
const { DateTime } = require('luxon')
const Constants = require('./constants')

module.exports = {
  createDateFormatsFromArray,
  removeTrailingZeros,
  endOfDay,
  getNow,
  getToday,
  getYesterday,
  isDateRelativeToToday,
  isDatePartToday,
  isDatePartNow,
  isDatePartNoon,
  isDatePartMidnight,
  isDatePartNegativelyRelative,
  isDatePartPositivelyRelative,
  getTomorrow,
  get30DaysFromToday,
  get120DaysFromToday,
  get3MonthsFromToday,
  startOfDay,
  isBlank,
  isNullish,
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
  if (isNullish(dateString)) return null

  // Adjust the regex pattern to match JavaScript syntax. Example: VISTA_DATE_TIME_FORMAT_PATTERN
  // Note: You need to define the actual regex pattern for VISTA_DATE_TIME_FORMAT_PATTERN based on your requirements
  if (Constants.VISTA_DATE_TIME_FORMAT_PATTERN.test(dateString)) {
    let trimmedString = dateString
    while (trimmedString.includes('.') && (trimmedString.endsWith('0') || trimmedString.endsWith('.'))) {
      trimmedString = trimmedString.slice(0, -1) // Equivalent to chop in Java
    }
    return trimmedString
  }

  if (dateString.endsWith('.')) {
    return dateString.slice(0, -1) // Equivalent to chop in Java
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
  if (isBlank(str)) {
    throw new Error('\'timeZone\' cannot be empty')
  }
};

function isBlank (str) {
  return (/^\s*$/).test(str)
}

/**
     * Determines if the provided {@link String} value is "null". The following are some examples equal to "null":
     isNullish(null)              = true
     isNullish("")                = true
     isNullish(" ")               = true
     isNullish("-1")              = true
     isNullish("Invalid Date")    = true
     isNullish("data")            = false
     isNullish("10/21/2018")      = false
     isNullish("20181021")        = false
     isNullish("20181021.061245") = false
**/
function isNullish (value) {
  return value === null || value === undefined ||
        value.trim() === '' || value.trim() === '-1' || value.trim() === 'Invalid Date'
}

/**
     * Return "Now" as an {@link LocalDateTime}.
     *
     * @return "Now" as an {@link LocalDateTime}
     *
     * @see LocalDateTime
     */
function getNow () {
  return LocalDateTime.now().toString()
}

/**
     * Return "Today" as an {@link LocalDate}.
     *
     * @return "Today" as an {@link LocalDate}
     *
     * @see LocalDate
     */
function getToday () {
  return LocalDate.now().toString()
}

/**
     * Return "Yesterday" as an {@link LocalDate}.
     *
     * @return "Yesterday" as an {@link LocalDate}
     *
     * @see LocalDate
     */
function getYesterday () {
  return LocalDate.now().minusDays(1).toString()
}
/**
     * Return "Tomorrow" as an {@link LocalDate}.
     *
     * @return "Tomorrow" as an {@link LocalDate}
     *
     * @see LocalDate
     */
function getTomorrow () {
  return LocalDate.now().plusDays(1).toString()
}

/**
     * Return "30 Days From Now" as an {@link LocalDate}.
     *
     * @return "30 Days From Now" as an {@link LocalDate}
     *
     * @see LocalDate
     */
function get30DaysFromToday () {
  return LocalDate.now().plusDays(30).toString()
}

/**
     * Return "120 Days From Now" as an {@link LocalDate}.
     *
     * @return "120 Days From Now" as an {@link LocalDate}
     *
     * @see LocalDate
     */
function get120DaysFromToday () {
  return LocalDate.now().plusDays(120).toString()
}

/**
* Return "3 Months From Now" as an {@link LocalDate}.
*
* @return "3 Months From Now" as an {@link LocalDate}
*
* @see LocalDate
*/
function get3MonthsFromToday () {
  return LocalDate.now().plusMonths(3).toString()
}

/**
     * Return the "Start-Of-Day" value for the provided {@link OffsetDateTime} input at UTC. Any existing TZ Offset
     * value is ignored and is treated as UTC. If the provided {@link OffsetDateTime} is {@code null}, {@code null} is
     * returned.
     * <pre>
     * DateUtils.startOfDay(null)                      = null
     *
     * DateUtils.startOfDay(2018-10-21T06:12:45Z)      = 2018-10-21T00:00Z
     * DateUtils.startOfDay(2018-10-21T06:12:45-04:00) = 2018-10-21T00:00Z
     * </pre>
     *
     * @param dateTime
     *         the {@link OffsetDateTime} to get the "Start-Of-Day" value for
     *
     * @return an {@link OffsetDateTime} with Time at "Start-Of-Day"
     *
     * @see OffsetDateTime
     */
function startOfDay (dateTime) {
  if (dateTime === null) return null

  return LocalDateTime
    .parse(dateTime)
    .toLocalDate()
    .atTime(LocalTime.MIN)
    .atOffset(ZoneOffset.UTC)
    .toString()
}

/**
     * Determines if the provided {@code date} string is a relative date adjustment for "Today" (current date at
     * start-of-day).
     *
     * @param date
     *         the "Date" string being parsed
     *
     * @return {@code true} if relative date adjustment for "Today"; {@code false} otherwise
     */
function isDateRelativeToToday (date) {
  return date.startsWith('T')
}

/**
     * Determines if the provided {@code datePart} string is expected to be "Today" (current date at start-of-day).
     *
     * @param datePart
     *         the "Date" string part being parsed
     *
     * @return {@code true} if expected to be "Today"; {@code false} otherwise
     */
function isDatePartToday (datePart) {
  const lower = datePart.toLowerCase()
  return lower === 't' || lower === 'today'
}

/**
     * Determines if the provided {@code datePart} string is expected to be "Now" (current date at current time).
     *
     * @param datePart
     *         the "Date" string part being parsed
     *
     * @return {@code true} if expected to be "Now"; {@code false} otherwise
     */
function isDatePartNow (datePart) {
  const lowerCaseDatePart = datePart.toLowerCase()
  return lowerCaseDatePart === 'n' || lowerCaseDatePart === 'now'
}

/**
     * Determines if the provided {@code datePart} string is expected to be at "Noon".
     *
     * @param datePart
     *         the "Date" string part being parsed
     *
     * @return {@code true} if expected to be at "Noon"; {@code false} otherwise
     */
function isDatePartNoon (datePart) {
  return datePart.toLowerCase() === 'noon'
}

/**
* Determines if the provided {@code datePart} string is expected to be at "Midnight".
*
* @param datePart
*         the "Date" string part being parsed
*
* @return {@code true} if expected to be at "Midnight"; {@code false} otherwise
*/
function isDatePartMidnight (datePart) {
  return datePart.toLowerCase() === 'mid'
}

/**
* Determines if the provided {@code datePart} string is expected to be a "negatively" adjusted relative date.
*
* @param datePart
*         the "Date" string part being parsed
*
* @return {@code true} if expected to be a "negatively" adjusted; {@code false} otherwise
*/
function isDatePartNegativelyRelative (datePart) {
  return datePart.includes('-')
}

/**
* Determines if the provided {@code datePart} string is expected to be a "positively" adjusted relative date.
*
* @param datePart
*         the "Date" string part being parsed
*
* @return {@code true} if expected to be a "positively" adjusted; {@code false} otherwise
*/
function isDatePartPositivelyRelative (datePart) {
  return datePart.includes('+')
}
