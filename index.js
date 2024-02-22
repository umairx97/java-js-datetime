const {
  LocalDateTime,
  LocalDate,
  LocalTime,
  ZoneOffset,
  ZoneId,
  OffsetDateTime,
  DateTimeFormatter
} = require('@js-joda/core')
require('@js-joda/timezone')
require('@js-joda/locale')
const Luxon = require('luxon')
const {
  DEFAULT_DATE_FORMAT,
  VISTA_DATETIME_FORMAT,
  VISTA_DATE_FORMAT,
  VISTA_DATE_FORMAT_PATTERN,
  FILEMAN_DATE_OFFSET,
  FILEMAN_DATE_FORMAT_PATTERN,
  VISTA_DATE_TIME_FORMAT_PATTERN,
  VISTA_DATE_TIME_SEPARATOR
} = require('./constants')

module.exports = {
  createDateFormatsFromArray,
  removeTrailingZeros,
  formatVistaDateTimeWithTimezone,
  formatVistaDateTime,
  endOfDay,
  convertDateFromVistaToFileMan,
  getNow,
  zeroPadVistaDateTime,
  formatFileManDateTime,
  convertDateFromFileManToVista,
  getToday,
  getYesterday,
  isDateRelativeToToday,
  isDatePartToday,
  isDatePartNow,
  isDatePartNoon,
  isDatePartMidnight,
  formatWithPattern,
  formatWithTimezoneAndPattern,
  formatLocalDate,
  formatVistaDate,
  formatLocalDateTime,
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
     * Convert the VistA Date/Time {@link String} ("yyyyMMdd.HHmmss") to a "FileMan" Date/Time format {@link String}
     * ("yyyMMdd.HHmmss"). The Date value is adjusted with the {@link #FILEMAN_DATE_OFFSET} to the appropriate value.
     * <p>
     * If the provided date string does not match the {@link #VISTA_DATE_FORMAT_PATTERN}, the value is returned as is.
     * <p>
     * FileMan Formatting: <a href="http://www.vistapedia.com/index.php/Date_formats">VistA Date Formats</a>
     * <pre>
     * DateUtils.convertDateFromVistaToFileMan(null)                   = null
     * DateUtils.convertDateFromVistaToFileMan("")                     = null
     * DateUtils.convertDateFromVistaToFileMan("Invalid Date")         = null
     *
     * DateUtils.convertDateFromVistaToFileMan("20181021")             = "3181021"
     * DateUtils.convertDateFromVistaToFileMan("20181021.061245")      = "3181021.061245"
     * DateUtils.convertDateFromVistaToFileMan("10/21/2018")           = "10/21/2018"
     * </pre>
     *
     * @param dateString
     *         the VistA Date/Time {@link String} to convert to a "FileMan" Date/Time format
     *
     * @return a "FileMan" Date/Time formatted {@link String}, the original Date/Time {@link String}, or {@code null}
     *
     * @see #isNullish(String)
     * @see #VISTA_DATE_FORMAT_PATTERN
     * @see #FILEMAN_DATE_OFFSET
     */

function convertDateFromVistaToFileMan (dateString) {
  if (isNullish(dateString)) return null

  const VISTA_DATE_TIME_SEPARATOR = '\\.'

  if (VISTA_DATE_FORMAT_PATTERN.test(dateString)) {
    const tokens = dateString.split(new RegExp(VISTA_DATE_TIME_SEPARATOR))

    const dateToken = parseInt(tokens[0], 10) - FILEMAN_DATE_OFFSET

    if (tokens.length > 1) {
      return `${dateToken}.${tokens[1]}`
    } else {
      return dateToken.toString()
    }
  }
  return dateString
}

/**
     * Format the provided {@link LocalDateTime} into a date string using the "yyyyMMdd.HHmmss" date pattern. If the
     * provided {@link LocalDateTime} is {@code null}, {@code null} is returned.
     * <pre>
     * DateUtils.formatVistaDateTime(null)                = null
     * DateUtils.formatVistaDateTime(2018-10-21T06:12:45) = "20181021.061245"
     * DateUtils.formatVistaDateTime(2018-10-21T00:00)    = "20181021"
     * DateUtils.formatVistaDateTime(2018-10-21T20:00)    = "20181021.2"
     * </pre>
     *
     * @param dateTime
     *         the {@link LocalDateTime} to format into a date string
     *
     * @return a date string in the "yyyyMMdd.HHmmss" date pattern or {@code null}
     *
     * @see LocalDateTime
     * @see #VISTA_DATETIME_FORMAT
     */
function formatVistaDateTime (dateTime) {
  const isJodaInstance = dateTime instanceof LocalDateTime
  const dTime = isJodaInstance ? dateTime : LocalDateTime.parse(dateTime)
  return formatWithPattern(dTime, VISTA_DATETIME_FORMAT)
}

/**
     * Format the provided {@link LocalDateTime} into a date string using the FileMan "yyyMMdd.HHmmss" date pattern. If
     * the provided {@link LocalDateTime} is {@code null}, {@code null} is returned.
     * <p>
     * FileMan Formatting: <a href="http://www.vistapedia.com/index.php/Date_formats">VistA Date Formats</a>
     * <pre>
     * DateUtils.formatFileManDateTime(null)                = null
     * DateUtils.formatFileManDateTime(2018-10-21T06:12:45) = "20181021.061245"
     * DateUtils.formatFileManDateTime(2018-10-21T00:00)    = "20181021"
     * DateUtils.formatFileManDateTime(2018-10-21T20:00)    = "20181021.2"
     * </pre>
     *
     * @param dateTime
     *         the {@link LocalDateTime} to format into a date string
     *
     * @return a date string in the FileMan "yyyMMdd.HHmmss" date pattern or {@code null}
     *
     * @see LocalDateTime
     * @see #VISTA_DATETIME_FORMAT
     * @see #formatVistaDateTime(LocalDateTime)
     * @see #convertDateFromVistaToFileMan(String)
     */
function formatFileManDateTime (dateTime) {
  const dTime = dateTime instanceof LocalDateTime ? dateTime : LocalDateTime.parse(dateTime)
  const vistaDate = formatVistaDateTime(dTime)
  return convertDateFromVistaToFileMan(vistaDate)
}

console.log(formatFileManDateTime(LocalDate.of(2018, 10, 21)
  .atTime(6, 12, 45)))

/**
     * Format the provided {@link OffsetDateTime} into a date string using the "yyyyMMdd.HHmmss" date pattern, adjusting
     * the time according to the provided TimeZone {@link String}. If the provided {@link OffsetDateTime} is
     * {@code null}, {@code null} is returned.
     * <p>
     * If the {@link OffsetDateTime} has a TZ Offset that is the same as the provided {@code timeZone}, the output
     * date/time value is not adjusted.
     * <p>
     * If the {@link OffsetDateTime} has a TZ Offset that is different from the provided {@code timeZone}, the output
     * date/time is adjusted to local time at the TZ.
     * <p>
     * The "Time" of the {@link OffsetDateTime} is adjusted to match the same "Instant" at the {@code timeZone}. This
     * means the "Date" of the resulting object can be different from the input.
     * <pre>
     * DateUtils.formatVistaDateTime(null,                      "America/New_York") = null
     * DateUtils.formatVistaDateTime(2018-10-21T06:12:45Z,      null)               = IllegalArgumentException
     *
     * DateUtils.formatVistaDateTime(2018-10-21T06:12:45Z,      "America/New_York") = "20181021.021245"
     * DateUtils.formatVistaDateTime(2018-10-22T03:12:45Z,      "America/New_York") = "20181021.231245"
     *
     * DateUtils.formatVistaDateTime(2018-10-21T00:00-04:00,    "America/New_York") = "20181021"
     * DateUtils.formatVistaDateTime(2018-10-21T20:00-04:00,    "America/New_York") = "20181021.2"
     *
     * DateUtils.formatVistaDateTime(2018-10-21T06:12:45-04:00, "America/New_York") = "20181021.061245"
     * DateUtils.formatVistaDateTime(2018-10-22T03:12:45-04:00, "America/New_York") = "20181022.031245"
     * </pre>
     *
     * @param dateTime
     *         the {@link OffsetDateTime} to format into a date string
     * @param timeZone
     *         the TimeZone {@link String} used in Date/Time conversions
     *
     * @return a date string in the "yyyyMMdd.HHmmss" date pattern or {@code null}
     *
     * @see OffsetDateTime
     * @see #VISTA_DATETIME_FORMAT
     * @see #formatVistaDateTime(LocalDateTime)
     */
function formatVistaDateTimeWithTimezone (dateTime, timeZone) {
  const isJodaTime = dateTime instanceof OffsetDateTime
  const dTime = isJodaTime ? dateTime : OffsetDateTime.parse(dateTime)
  return formatWithTimezoneAndPattern(dTime, timeZone, VISTA_DATETIME_FORMAT)
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
    dateTime = Luxon.DateTime.fromJSDate(input)
  }

  if (typeof input === 'string') {
    dateTime = Luxon.DateTime.fromISO(input)
  }

  if (input instanceof Luxon.DateTime) {
    dateTime = input // Input is already a Luxon DateTime object
  }

  // Sets the time to the end of the day (23:59:59.999) in the local time zone
  return dateTime.endOf('day').toISO({ includeOffset: false }) + 'Z'
}

/**
     * Zero-Pad a VistA Date/Time {@link String}. If the date is determined to be "null" according to
     * {@link #isNullish(String)}, {@code null} is returned. If the date does not match the pattern
     * {@code "[\d]+\.[\d]+"}, the value is returned as is. If the date ends with a {@code "."}, the {@code "."} is
     * stripped from the end before returning.
     * <pre>
     * DateUtils.zeroPadVistaDateTime(null)                   = null
     * DateUtils.zeroPadVistaDateTime("")                     = null
     * DateUtils.zeroPadVistaDateTime("Invalid Date")         = null
     *
     * DateUtils.zeroPadVistaDateTime("20181021")             = "20181021"
     * DateUtils.zeroPadVistaDateTime("20181021.")            = "20181021"
     * DateUtils.zeroPadVistaDateTime("20181021.06")          = "20181021.060000"
     * DateUtils.zeroPadVistaDateTime("20181021.060000")      = "20181021.060000"
     * DateUtils.zeroPadVistaDateTime("10/21/2018")           = "10/21/2018"
     * </pre>
     *
     * @param dateString
     *         the VistA Date/Time {@link String} to zero-pad
     *
     * @return the zero-padded Date/Time {@link String} or {@code null}
     *
     * @see #isNullish(String)
     * @see #VISTA_DATE_TIME_FORMAT_PATTERN
     */
function zeroPadVistaDateTime (dateString) {
  if (isNullish(dateString)) return null

  if (VISTA_DATE_TIME_FORMAT_PATTERN.test(dateString)) {
    const tokens = dateString.split(VISTA_DATE_TIME_SEPARATOR)
    // Ensure date is filled
    const dateToken = tokens[0].padEnd(6, '0') // Right pad string until 6 characters long
    // Ensure second precision; Remove any sub-second precision
    const timeToken = tokens[1].padEnd(6, '0').substring(0, 6) // Right pad string until 6 characters long, then take first 6 characters
    return `${dateToken}.${timeToken}` // Using template literals for string formatting
  }
  if (dateString.endsWith('.')) {
    return dateString.slice(0, -1) // Remove the last character if it is a dot
  }
  return dateString
}

/**
     * Convert the "FileMan" Date/Time {@link String} ("yyyMMdd.HHmmss") to a VistA Date/Time format {@link String}
     * ("yyyyMMdd.HHmmss"). The Date value is adjusted with the {@link #FILEMAN_DATE_OFFSET} to the appropriate value.
     * <p>
     * If the provided date string does not match the {@link #FILEMAN_DATE_FORMAT_PATTERN}, the value is returned as
     * is.
     * <p>
     * FileMan Formatting: <a href="http://www.vistapedia.com/index.php/Date_formats">VistA Date Formats</a>
     * <pre>
     * DateUtils.convertDateFromFileManToVista(null)                   = null
     * DateUtils.convertDateFromFileManToVista("")                     = null
     * DateUtils.convertDateFromFileManToVista("Invalid Date")         = null
     *
     * DateUtils.convertDateFromFileManToVista("3181021")              = "20181021"
     * DateUtils.convertDateFromFileManToVista("3181021.061245")       = "20181021.061245"
     *
     * DateUtils.convertDateFromFileManToVista("20181021")             = "20181021"
     * DateUtils.convertDateFromFileManToVista("20181021.061245")      = "20181021.061245"
     * DateUtils.convertDateFromFileManToVista("10/21/2018")           = "10/21/2018"
     * </pre>
     *
     * @param dateString
     *         the "FileMan" Date/Time {@link String} to convert to a VistA Date/Time format
     *
     * @return a VistA Date/Time formatted {@link String}, the original Date/Time {@link String}, or {@code null}
     *
     * @see #isNullish(String)
     * @see #FILEMAN_DATE_FORMAT_PATTERN
     * @see #FILEMAN_DATE_OFFSET
     */
function convertDateFromFileManToVista (dateString) {
  if (isNullish(dateString)) return null

  if (FILEMAN_DATE_FORMAT_PATTERN.test(dateString)) {
    const tokens = dateString.split(VISTA_DATE_TIME_SEPARATOR)
    const dateToken = parseInt(tokens[0], 10) + FILEMAN_DATE_OFFSET

    if (tokens.length > 1) {
      // Adjust accordingly if it involves more complex formatting
      return `${dateToken}${VISTA_DATE_TIME_SEPARATOR}${tokens[1]}`
    } else {
      return dateToken.toString()
    }
  }
  return dateString
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
  if (VISTA_DATE_TIME_FORMAT_PATTERN.test(dateString)) {
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
  return dateFormats.map(format => `[${format}]`).join(' ')
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

  return OffsetDateTime
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
function isDatePartNoon (datePart = '') {
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
/**
     * Format the provided {@link OffsetDateTime} into a date string according to the provided {@code pattern},
     * adjusting the time according to the provided TimeZone {@link String}. If the provided {@link OffsetDateTime} is
     * {@code null}, {@code null} is returned.
     * <p>
     * If the {@link OffsetDateTime} has a TZ Offset that is the same as the provided {@code timeZone}, the output
     * date/time value is not adjusted.
     * <p>
     * If the {@link OffsetDateTime} has a TZ Offset that is different from the provided {@code timeZone}, the output
     * date/time is adjusted to local time at the TZ.
     * <p>
     * The "Time" of the {@link OffsetDateTime} is adjusted to match the same "Instant" at the {@code timeZone}. This
     * means the "Date" of the resulting object can be different from the input.
     * <pre>
     * DateUtils.format(null,                      "America/New_York", "MM/dd/yyyy")      = null
     * DateUtils.format(2018-10-21T06:12:45Z,      null,               "MM/dd/yyyy")      = IllegalArgumentException
     * DateUtils.format(2018-10-21T06:12:45Z,      "America/New_York", null)              = IllegalArgumentException
     *
     * DateUtils.format(2018-10-21T06:12:45Z,      "America/New_York", "MM/dd/yyyy")      = "10/21/2018"
     * DateUtils.format(2018-10-22T03:12:45Z,      "America/New_York", "MM/dd/yyyy")      = "10/21/2018"
     * DateUtils.format(2018-10-21T06:12:45-04:00, "America/New_York", "MM/dd/yyyy")      = "10/21/2018"
     * DateUtils.format(2018-10-22T03:12:45-04:00, "America/New_York", "MM/dd/yyyy")      = "10/22/2018"
     *
     * DateUtils.format(2018-10-21T06:12:45Z,      "America/New_York", "yyyyMMdd")        = "20181021"
     * DateUtils.format(2018-10-22T03:12:45Z,      "America/New_York", "yyyyMMdd")        = "20181021"
     * DateUtils.format(2018-10-21T06:12:45-04:00, "America/New_York", "yyyyMMdd")        = "20181021"
     * DateUtils.format(2018-10-22T03:12:45-04:00, "America/New_York", "yyyyMMdd")        = "20181022"
     *
     * DateUtils.format(2018-10-21T06:12:45Z,      "America/New_York", "yyyyMMdd.HHmmss") = "20181021.021245"
     * DateUtils.format(2018-10-22T03:12:45Z,      "America/New_York", "yyyyMMdd.HHmmss") = "20181021.231245"
     * DateUtils.format(2018-10-21T00:00,          "America/New_York", "yyyyMMdd.HHmmss") = "20181021"
     * DateUtils.format(2018-10-21T20:00,          "America/New_York", "yyyyMMdd.HHmmss") = "20181021.2"
     * DateUtils.format(2018-10-21T06:12:45-04:00, "America/New_York", "yyyyMMdd.HHmmss") = "20181021.061245"
     * DateUtils.format(2018-10-22T03:12:45-04:00, "America/New_York", "yyyyMMdd.HHmmss") = "20181022.031245"
     * </pre>
     *
     * @param dateTime
     *         the {@link OffsetDateTime} to format into a date string
     * @param timeZone
     *         the TimeZone {@link String} used in Date/Time conversions
     * @param pattern
     *         the date string formatting pattern to use
     *
     * @return a formatted date string or {@code null}
     *
     * @see OffsetDateTime
     * @see #format(LocalDateTime, String)
     */
function formatWithTimezoneAndPattern (dateTime, timeZone, pattern) {
  validateTimeZone(timeZone)

  const dTime = dateTime instanceof OffsetDateTime ? dateTime : OffsetDateTime.parse(dateTime)
  const zoneId = ZoneId.of(timeZone)
  const ldt = dTime.atZoneSameInstant(zoneId).toLocalDateTime()
  return formatWithPattern(ldt.toString(), pattern)
}

function formatWithPattern (dateTime, pattern) {
  if (dateTime === null) {
    return null
  }
  if (pattern === null) {
    throw new Error('Date Format Pattern must not be null')
  }
  const formatter = DateTimeFormatter.ofPattern(pattern)
  let formattedString = null

  const isJodaInstance = dateTime instanceof LocalDateTime || dateTime instanceof LocalDate || dateTime instanceof LocalTime || dateTime instanceof OffsetDateTime

  if (isJodaInstance) {
    formattedString = dateTime.format(formatter)
  } else {
    formattedString = LocalDateTime.parse(dateTime).format(formatter)
  }

  // // Remove trailing zeros when formatting to a VistA Date/Time to avoid trailing precision errors.
  if (VISTA_DATETIME_FORMAT === pattern) {
    return removeTrailingZeros(formattedString)
  }

  return formattedString
}

/**
     * Format the provided {@link LocalDate} into a date string using the "MM/dd/yyyy" date pattern. If the provided
     * {@link LocalDate} is {@code null}, {@code null} is returned.
     * <pre>
     * DateUtils.formatDate(null)       = null
     * DateUtils.formatDate(2018-10-21) = "10/21/2018"
     * </pre>
     *
     * @param date
     *         the {@link LocalDate} to format into a date string
     *
     * @return a date string in the "MM/dd/yyyy" date pattern or {@code null}
     *
     * @see LocalDate
     * @see #DEFAULT_DATE_FORMAT
     */
function formatLocalDate (date) {
  if (date === null) return null

  return formatWithPattern(
    LocalDate.parse(date).atStartOfDay().toString(), DEFAULT_DATE_FORMAT
  )
}

/**
     * Format the provided {@link LocalDateTime} into a date string using the "MM/dd/yyyy" date pattern. If the provided
     * {@link LocalDateTime} is {@code null}, {@code null} is returned.
     * <pre>
     * DateUtils.formatDate(null)                = null
     * DateUtils.formatDate(2018-10-21T06:12:45) = "10/21/2018"
     * </pre>
     *
     * @param dateTime
     *         the {@link LocalDateTime} to format into a date string
     *
     * @return a date string in the "MM/dd/yyyy" date pattern or {@code null}
     *
     * @see LocalDateTime
     * @see #DEFAULT_DATE_FORMAT
     */
function formatLocalDateTime (dateTime) {
  return formatWithPattern(dateTime, DEFAULT_DATE_FORMAT)
}

/**
     * Format the provided {@link LocalDate} into a date string using the "yyyyMMdd" date pattern. If the provided
     * {@link LocalDate} is {@code null}, {@code null} is returned.
     * <pre>
     * DateUtils.formatVistaDate(null)       = null
     * DateUtils.formatVistaDate(2018-10-21) = "20181021"
     * </pre>
     *
     * @param date
     *         the {@link LocalDate} to format into a date string
     *
     * @return a date string in the "yyyyMMdd" date pattern or {@code null}
     *
     * @see LocalDate
     * @see #VISTA_DATE_FORMAT
     */
function formatVistaDate (date) {
  if (date === null) return null

  return formatWithPattern(LocalDate.parse(date).atStartOfDay(), VISTA_DATE_FORMAT)
}
