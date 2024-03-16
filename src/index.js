import {
  LocalDateTime,
  LocalDate,
  LocalTime,
  ZoneOffset,
  ZoneId,
  OffsetDateTime,
  DateTimeFormatter,
  DateTimeParseException,
  ChronoUnit
} from '@js-joda/core'
import '@js-joda/timezone'
import * as Luxon from 'luxon'
import {
  DEFAULT_DATE_FORMAT,
  VISTA_DATETIME_FORMAT,
  VISTA_DATE_FORMAT,
  VISTA_DATE_FORMAT_PATTERN,
  FILEMAN_DATE_OFFSET,
  FILEMAN_DATE_FORMAT_PATTERN,
  VISTA_DATE_TIME_FORMAT_PATTERN,
  VISTA_DATE_TIME_SEPARATOR,
  VISTA_DATE_FORMAT_ARRAY
} from './constants.js'

const IS_TEST = process.env.NODE_ENV === 'test'

const UNIT_MAP = {
  D: ChronoUnit.DAYS,
  M: ChronoUnit.MONTHS
  // Add other mappings as necessary
}

// Parse adjustment string into components
export function parseAdjuster (dateAdjustment) {
  const amount = parseInt(dateAdjustment, 10)
  const unitToken = dateAdjustment.replace(/^\d+/, '')
  const unit = UNIT_MAP[unitToken] || ChronoUnit.DAYS // Default to DAYS if no unit specified

  if (isNaN(amount)) {
    console.log('Failed to parse relative date adjustment', dateAdjustment)
    return null
  }

  return { amount, unit }
}

// Apply adjustment to a LocalDateTime
export function adjustRelativeDate (localDateTime, { amount, unit }, direction) {
  switch (direction) {
    case '+':
      return localDateTime.plus(amount, unit)
    case '-':
      return localDateTime.minus(amount, unit)
    default:
      return localDateTime // No adjustment if direction is not recognized
  }
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

export function convertDateFromVistaToFileMan (dateString) {
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
export function formatVistaDateTime (dateTime) {
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
export function formatFileManDateTime (dateTime) {
  const dTime = dateTime instanceof LocalDateTime ? dateTime : LocalDateTime.parse(dateTime)
  const vistaDate = formatVistaDateTime(dTime)
  return convertDateFromVistaToFileMan(vistaDate)
}

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
export function formatVistaDateTimeWithTimezone (dateTime, timeZone) {
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

export function endOfDay (input) {
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
export function zeroPadVistaDateTime (dateString) {
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
export function convertDateFromFileManToVista (dateString) {
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

export function removeTrailingZeros (dateString) {
  // Assume isNullish export function is defined elsewhere
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

export function createDateFormatsFromArray (dateFormats = []) {
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
export function validateTimeZone (str) {
  if (isBlank(str)) {
    throw new Error('\'timeZone\' cannot be empty')
  }
};

export function isBlank (str) {
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
export function isNullish (value) {
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
export function getNow () {
  return LocalDateTime.now().toString()
}

/**
     * Return "Today" as an {@link LocalDate}.
     *
     * @return "Today" as an {@link LocalDate}
     *
     * @see LocalDate
     */
export function getToday () {
  return LocalDate.now().toString()
}

/**
     * Return "Yesterday" as an {@link LocalDate}.
     *
     * @return "Yesterday" as an {@link LocalDate}
     *
     * @see LocalDate
     */
export function getYesterday () {
  return LocalDate.now().minusDays(1).toString()
}
/**
     * Return "Tomorrow" as an {@link LocalDate}.
     *
     * @return "Tomorrow" as an {@link LocalDate}
     *
     * @see LocalDate
     */
export function getTomorrow () {
  return LocalDate.now().plusDays(1).toString()
}

/**
     * Return "30 Days From Now" as an {@link LocalDate}.
     *
     * @return "30 Days From Now" as an {@link LocalDate}
     *
     * @see LocalDate
     */
export function get30DaysFromToday () {
  return LocalDate.now().plusDays(30).toString()
}

/**
     * Return "120 Days From Now" as an {@link LocalDate}.
     *
     * @return "120 Days From Now" as an {@link LocalDate}
     *
     * @see LocalDate
     */
export function get120DaysFromToday () {
  return LocalDate.now().plusDays(120).toString()
}

/**
* Return "3 Months From Now" as an {@link LocalDate}.
*
* @return "3 Months From Now" as an {@link LocalDate}
*
* @see LocalDate
*/
export function get3MonthsFromToday () {
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
export function startOfDay (dateTime) {
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

/*
    Parse
     */

/**
   * Parse a Date/Time {@link String} into a {@link LocalDateTime}. If the date is determined to be "null" according
   * to {@link #isNullish(String)}, {@code null} is returned.
   * <p>
   * Dates in either the VistA ("yyyyMMdd.HHmmss") or FileMan ("yyyMMdd.HHmmss") date formats, perform date string
   * correction using {@link #convertDateFromFileManToVista(String)}, to ensure a "VistA" parsable format, and
   * {@link #zeroPadVistaDateTime(String)}, ensuring proper Date/Time precision, to allow for successful parsing.
   * These particular formats are also initially checked for to bypass any "Relative" date parsing, since they are the
   * most commonly converted formats.
   * <p>
   * "Relative" VistA Date/Time values are handled via the {@link #parseRelativeVistaDate(String)} helper, which, if
   * non-relative, returns a {@code null} value.
   * <p>
   * A {@link DateTimeParseException} is thrown if the date cannot be parsed from the VistA, FileMan, Relative, or
   * supported {@link #VISTA_DATE_FORMAT_ARRAY} patterns.
   * <pre>
   * DateUtils.parseToLocal(null)                   = null
   * DateUtils.parseToLocal("")                     = null
   * DateUtils.parseToLocal("Invalid Date")         = null
   *
   * DateUtils.parseToLocal("20181021")             = 2018-10-21T00:00
   * DateUtils.parseToLocal("20181021.02")          = 2018-10-21T02:00
   * DateUtils.parseToLocal("20181021.021245")      = 2018-10-21T02:12:45
   * DateUtils.parseToLocal("20181021.02124579865") = 2018-10-21T02:12:45
   *
   * DateUtils.parseToLocal("3181021.021245")       = 2018-10-21T02:12:45
   *
   * DateUtils.parseToLocal("T")                    = 2018-10-21T00:00
   * DateUtils.parseToLocal("TODAY")                = 2018-10-21T00:00
   * DateUtils.parseToLocal("N")                    = 2018-10-21T06:45:23
   * DateUtils.parseToLocal("NOW")                  = 2018-10-21T06:45:23
   * DateUtils.parseToLocal("NOON")                 = 2018-10-21T12:00:00
   * DateUtils.parseToLocal("MIDNIGHT")             = 2018-10-22T00:00
   *
   * DateUtils.parseToLocal("T+3@NOON")             = 2018-10-24T12:00
   * DateUtils.parseToLocal("T-3M@12PM")            = 2018-07-21T12:00
   * DateUtils.parseToLocal("T+3W@9:45")            = 2018-11-11T09:45
   * DateUtils.parseToLocal("T-3D@064523")          = 2018-10-18T06:45:23
   * DateUtils.parseToLocal("T+3H@")                = 2018-10-21T03:00
   * DateUtils.parseToLocal("T-3'")                 = 2018-10-20T23:57
   *
   * DateUtils.parseToLocal("ABC")                  = DateTimeParseException
   * DateUtils.parseToLocal("123")                  = DateTimeParseException
   * DateUtils.parseToLocal("123@12PM")             = DateTimeParseException
   * DateUtils.parseToLocal("T@12PM@NOON")          = DateTimeParseException
   * DateUtils.parseToLocal("TODAY@ABC")            = DateTimeParseException
   * </pre>
   *
   * @param dateString
   *         the Date/Time {@link String} to parse into a {@link LocalDateTime}
   *
   * @return the parsed {@link LocalDateTime} or {@code null}
   *
   * @throws DateTimeParseException
   *         if the Date/Time {@link String} cannot be parsed
   * @see LocalDateTime
   * @see #isNullish(String)
   * @see #VISTA_DATE_FORMAT_PATTERN
   * @see #FILEMAN_DATE_FORMAT_PATTERN
   * @see #convertDateFromFileManToVista(String)
   * @see #zeroPadVistaDateTime(String)
   * @see #parseRelativeVistaDate(String)
   */

export function parseToLocal (dateString) {
  if (!dateString) {
    return null
  }
  if (VISTA_DATE_FORMAT_PATTERN.test(dateString) || FILEMAN_DATE_FORMAT_PATTERN.test(dateString)) {
    const correctedDateString = convertDateFromFileManToVista(dateString)
    const paddedDateTimeString = zeroPadVistaDateTime(correctedDateString)
    // Parsing the string into a LocalDateTime object
    for (const format of VISTA_DATE_FORMAT_ARRAY) {
      try {
        // Attempt to create a formatter for each pattern and parse the dateString
        const formatter = DateTimeFormatter.ofPattern(format.replace(/,SSS/g, '')) // Simplify format for @js-joda compatibility
        return LocalDateTime.parse(paddedDateTimeString, formatter)
      } catch (error) {
        if (!(error instanceof DateTimeParseException)) {
          // If error is not due to parsing, rethrow it
          throw error
        }
        // If parsing fails, try the next format
      }
    }
    throw new Error('Date string does not match any provided formats.')
  }
  let localDateTime = parseRelativeVistaDate(dateString)
  if (!localDateTime) {
    for (const format of VISTA_DATE_FORMAT_ARRAY) {
      try {
        // Attempt to create a formatter for each pattern and parse the dateString
        const formatter = DateTimeFormatter.ofPattern(format.replace(/,SSS/g, '')) // Simplify format for @js-joda compatibility
        localDateTime = LocalDateTime.parse(dateString, formatter)
      } catch (error) {
        if (!(error instanceof DateTimeParseException)) {
          // If error is not due to parsing, rethrow it
          throw error
        }
        // If parsing fails, try the next format
      }
    }
  }
  return localDateTime
}

/**
     * Parse a Date/Time {@link String} into an {@link OffsetDateTime} at "UTC" Offset. If the date is determined to be
     * "null" according to {@link #isNullish(String)}, {@code null} is returned.
     * <p>
     * Dates can be in a FileMan VistA Date/Time format (yyyMMdd.HHmmss), so
     * {@link #convertDateFromFileManToVista(String)} is used to ensure dates are in a valid parsing format.
     * <p>
     * The input is expected to be at "UTC".
     * <ul>
     *     <li>Input Date TZ  == UTC</li>
     *     <li>Output Date TZ == UTC</li>
     * </ul>
     * <p>
     * If the provided Date/Time has no "Time", it is assumed to be at "Start-Of-Day".
     * <pre>
     * DateUtils.parseToOffset(null)                   = null
     * DateUtils.parseToOffset("")                     = null
     * DateUtils.parseToOffset("Invalid Date")         = null
     *
     * DateUtils.parseToOffset("20181021")             = 2018-10-21T00:00Z
     * DateUtils.parseToOffset("20181021.02")          = 2018-10-21T02:00Z
     * DateUtils.parseToOffset("20181021.021245")      = 2018-10-21T02:12:45Z
     * DateUtils.parseToOffset("20181021.02124579865") = 2018-10-21T02:12:45Z
     *
     * DateUtils.parseToOffset("3181021.021245")       = 2018-10-21T02:12:45Z
     * </pre>
     *
     * @param dateString
     *         the Date/Time {@link String} to parse into a {@link OffsetDateTime}
     *
     * @return the parsed {@link OffsetDateTime} or {@code null}
     *
     * @see OffsetDateTime
     * @see #isNullish(String)
     * @see #parseToLocal(String)
     */

// export function parseToOffset(dateString) {
//   const localDateTime = parseToLocal(dateString);
//   if (localDateTime === null) {
//     return null;
//   }
//   const utcDateTime = new Date(localDateTime.getTime() + (localDateTime.getTimezoneOffset() * 60000));
//   return utcDateTime;
// }

export function parseToOffset (dateString) {
  const localDateTime = parseToLocal(dateString)
  if (localDateTime === null) {
    return null
  }
  return localDateTime.atOffset(ZoneOffset.UTC)?.toString()
}

/**
   * Parse a Date/Time {@link String} into an {@link OffsetDateTime} at "UTC" Offset, adjusting the time according to
   * the provided TimeZone {@link String}. If the date is determined to be "null" according to
   * {@link #isNullish(String)}, {@code null} is returned.
   * <p>
   * Dates can be in a FileMan VistA Date/Time format (yyyMMdd.HHmmss), so
   * {@link #convertDateFromFileManToVista(String)} is used to ensure dates are in a valid parsing format.
   * <p>
   * The input is expected to be at the TimeZone of the provided {@code timeZone} value.
   * <ul>
   *     <li>Input Date TZ  == provided {@code timeZone}</li>
   *     <li>Output Date TZ == UTC</li>
   * </ul>
   * <p>
   * If the provided Date/Time has no "Time", it is assumed to be at "Start-Of-Day".
   * <p>
   * The "Time" of the parsed {@link OffsetDateTime} is adjusted to match the same "Instant" at the "UTC" TZ.
   * This means the "Date" of the resulting object can be different from the input.
   * <pre>
   * DateUtils.parseToUtc(null,                   "America/New_York") = null
   * DateUtils.parseToUtc("",                     "America/New_York") = null
   * DateUtils.parseToUtc("Invalid Date",         "America/New_York") = null
   *
   * DateUtils.parseToUtc("20181021",             "America/New_York") = 2018-10-21T04:00Z
   * DateUtils.parseToUtc("20181021.02",          "America/New_York") = 2018-10-21T06:00Z
   * DateUtils.parseToUtc("20181021.021245",      "America/New_York") = 2018-10-21T06:12:45Z
   * DateUtils.parseToUtc("20181021.02124579865", "America/New_York") = 2018-10-21T06:12:45Z
   *
   * DateUtils.parseToUtc("20181021.021245",      "UTC")              = 2018-10-21T02:12:45Z
   *
   * DateUtils.parseToUtc("20181021.231245",      "America/New_York") = 2018-10-22T03:12:45Z
   *
   * DateUtils.parseToUtc("3181021.021245",       "America/New_York") = 2018-10-21T06:12:45Z
   * </pre>
   *
   * @param dateString
   *         the Date/Time {@link String} to parse into a {@link OffsetDateTime}
   * @param timeZone
   *         the TimeZone {@link String} used in Date/Time conversions
   *
   * @return the converted {@link OffsetDateTime} or {@code null}
   *
   * @see OffsetDateTime
   * @see #isNullish(String)
   * @see #parseToLocal(String)
   */

export function parseToUtc (dateString, timeZone) {
  validateTimeZone(timeZone)

  const localDateTime = parseToLocal(dateString)
  if (localDateTime === null) {
    return null
  }

  const zoneId = ZoneId.of(timeZone)
  const offsetDateTime = localDateTime.atZone(zoneId).toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC)

  return offsetDateTime?.toString()
}

/**
     * Parse a Date/Time {@link String} into an {@link OffsetDateTime} with the provided {@code timeZone}, adjusting the
     * time from the input "UTC" Offset. If the date is determined to be "null" according to {@link #isNullish(String)},
     * {@code null} is returned.
     * <p>
     * Dates can be in a FileMan VistA Date/Time format (yyyMMdd.HHmmss), so
     * {@link #convertDateFromFileManToVista(String)} is used to ensure dates are in a valid parsing format.
     * <p>
     * The input is expected to be at "UTC".
     * <ul>
     *     <li>Input Date TZ  == UTC</li>
     *     <li>Output Date TZ == provided {@code timeZone}</li>
     * </ul>
     * <p>
     * If the provided Date/Time has no "Time", it is assumed to be at "Start-Of-Day".
     * <p>
     * The "Time" of the parsed {@link OffsetDateTime} is adjusted to match the same "Instant" at the provided
     * {@code timeZone} value. This means the "Date" of the resulting object can be different from the input.
     * <pre>
     * DateUtils.parseFromUtc(null,                   "America/New_York") = null
     * DateUtils.parseFromUtc("",                     "America/New_York") = null
     * DateUtils.parseFromUtc("Invalid Date",         "America/New_York") = null
     *
     * DateUtils.parseFromUtc("20181021",             "America/New_York") = 2018-10-20T20:00-04:00
     * DateUtils.parseFromUtc("20181021.06",          "America/New_York") = 2018-10-21T02:00-04:00
     * DateUtils.parseFromUtc("20181021.061245",      "America/New_York") = 2018-10-21T02:12:45-04:00
     * DateUtils.parseFromUtc("20181021.06124579865", "America/New_York") = 2018-10-21T02:12:45-04:00
     *
     * DateUtils.parseFromUtc("20181021.061245",      "UTC")              = 2018-10-21T06:12:45Z
     *
     * DateUtils.parseFromUtc("20181022.031245",      "America/New_York") = 2018-10-21T23:12:45-04:00
     *
     * DateUtils.parseFromUtc("3181021.061245",       "America/New_York") = 2018-10-21T02:12:45-04:00
     * </pre>
     *
     * @param dateString
     *         the Date/Time {@link String} to parse into a {@link OffsetDateTime}
     * @param timeZone
     *         the TimeZone {@link String} used in Date/Time conversions
     *
     * @return the parsed {@link OffsetDateTime} or {@code null}
     *
     * @see OffsetDateTime
     * @see #isNullish(String)
     * @see #parseToLocal(String)
     */

export function parseFromUtc (dateString, timeZone) {
  validateTimeZone(timeZone)

  const localDateTime = parseToLocal(dateString)
  if (localDateTime === null) {
    return null
  }

  // Convert the LocalDateTime, which is in UTC, to the specified time zone.
  const zoneId = ZoneId.of(timeZone)
  const offsetDateTime = localDateTime.atOffset(ZoneOffset.UTC)
    .atZoneSameInstant(zoneId)
    .toOffsetDateTime()

  return offsetDateTime?.toString()
}

export function isDateRelativeToToday (date) {
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
export function isDatePartToday (datePart) {
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
export function isDatePartNow (datePart) {
  const lowerCaseDatePart = datePart.toLowerCase()
  return lowerCaseDatePart === 'n' || lowerCaseDatePart === 'now'
}

/**
     * Attempts to parse the provided {@code datePart} {@link String} into a {@link LocalDateTime} object. If a
     * {@link LocalDateTime} cannot be parsed, {@code null} is returned. The date string can come in 2 forms: the first
     * being a string representing 'Today' or 'Now' (eg: "NOW"); the second be the same string representation as the
     * first form, followed by an adjustment string (eg: "T+1H", "T-3M"). If the date string does not match these
     * supported forms, {@code null} is returned.
     *
     * @param datePart
     *         the date {@link String} to parse into a {@link LocalDateTime}
     * @param regex
     *         the {@link String} used to split the {@code datePart} and used for adjustment direction
     *
     * @return a parsed {@link LocalDateTime} object, or {@code null}
     *
     * @see LocalDateTime
     * @see #isDatePartToday(String)
     * @see #isDatePartNow(String)
     * @see RelativeDateAdjuster
     */
export function parseRelativeDatePart (datePart, regex) {
  const regexPattern = /[+-]/
  const match = datePart.match(regexPattern)

  let direction
  if (match) {
    direction = match[0] // Directly use the matched + or - character
  }
  let localDateTime
  const parts = datePart.split(new RegExp(regex))
  if (parts.length === 1 || parts.length === 2) {
    if (isDatePartToday(parts[0])) {
      // Set to start of the day
      localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)
    } else if (isDatePartNow(parts[0])) {
      // Current date and time
      localDateTime = LocalDateTime.now()
    }
    if (localDateTime !== null && parts.length === 2) {
      // Assuming parseAdjuster and adjustRelativeDate functions are adapted for @js-joda/core
      const relative = parseAdjuster(parts[1])

      if (relative === null) {
        // Failed to parse relative, so return null
        return null
      }

      // Adjust the LocalDateTime based on the relative part
      return adjustRelativeDate(localDateTime, relative, direction)
    }
  }
  return localDateTime
}

/**
     * Determines if the provided {@code datePart} string is expected to be at "Noon".
     *
     * @param datePart
     *         the "Date" string part being parsed
     *
     * @return {@code true} if expected to be at "Noon"; {@code false} otherwise
     */
export function isDatePartNoon (datePart = '') {
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
export function isDatePartMidnight (datePart) {
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
export function isDatePartNegativelyRelative (datePart) {
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
export function isDatePartPositivelyRelative (datePart) {
  return datePart.includes('+')
}

/**
     * Attempts to parse the provided {@code datePart} {@link String} into a {@link LocalDateTime} object. If the date
     * string does not match any relative date pattern, {@code null} is returned.
     * <p>
     * Date strings can be either relative to "Today" or "Now", or may be a constant representing "Today", "Now",
     * "Noon", or "Midnight".
     * <p>
     * Some examples include (assuming the current date is 10/21/2018):
     * <pre>
     * DateUtils.parseDatePart("T")     = 2018-10-21T00:00
     * DateUtils.parseDatePart("TODAY") = 2018-10-21T00:00
     * DateUtils.parseDatePart("N")     = 2018-10-21T06:45:23
     * DateUtils.parseDatePart("NOW")   = 2018-10-21T06:45:23
     * DateUtils.parseDatePart("NOON")  = 2018-10-21T12:00
     * DateUtils.parseDatePart("MID")   = 2018-10-22T00:00
     *
     * DateUtils.parseDatePart("T+3")   = 2018-10-24T00:00
     * DateUtils.parseDatePart("T-3M")  = 2018-07-21T00:00
     * DateUtils.parseDatePart("T+3W")  = 2018-11-11T00:00
     * DateUtils.parseDatePart("T-3D")  = 2018-10-18T00:00
     * DateUtils.parseDatePart("T+3H")  = 2018-10-21T03:00
     * DateUtils.parseDatePart("T-3'")  = 2018-10-20T23:57
     *
     * DateUtils.parseDatePart("ABC")   = null
     * DateUtils.parseDatePart("123")   = null
     * </pre>
     *
     * @param datePart
     *         the date {@link String} to parse into a {@link LocalDateTime}
     *
     * @return a parsed {@link LocalDateTime} object, or {@code null}
     *
     * @see LocalDateTime
     * @see #isDatePartPositivelyRelative(String)
     * @see #isDatePartNegativelyRelative(String)
     * @see #parseRelativeDatePart(String, String)
     * @see #isDatePartToday(String)
     * @see #isDatePartNow(String)
     * @see #isDatePartNoon(String)
     * @see #isDatePartMidnight(String)
     */

export function parseDatePart (datePart) {
  let localDateTime
  if (isDatePartPositivelyRelative(datePart)) {
    localDateTime = parseRelativeDatePart(datePart, '\\+')
  } else if (isDatePartNegativelyRelative(datePart)) {
    localDateTime = parseRelativeDatePart(datePart, '\\-')
  } else if (isDatePartToday(datePart)) {
    // Equivalent to setting the time to the start of the day
    localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)
  } else if (isDatePartNow(datePart)) {
    // Equivalent to the current date and time
    localDateTime = LocalDateTime.now()
  } else if (isDatePartNoon(datePart)) {
    // Equivalent to setting the time to noon
    localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.NOON)
  } else if (isDatePartMidnight(datePart)) {
    // Equivalent to setting the time to midnight at the start of the next day
    localDateTime = LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.MIDNIGHT)
  } else {
    // If no specific condition is met, return null or handle as needed
    localDateTime = null
  }

  return localDateTime?.toString()
}

/**
     * Attempts to parse the provided {@code timePart} {@link String} into a {@link LocalTime} object using the formats
     * defined in {@link #TIME_FORMAT}. If a {@link LocalTime} cannot be parsed, {@code null} is returned instead of
     * throwing any error.
     * <p>
     * If the provided {@code timePart} ends in {@code "A"} or {@code "P"} (shorthand for "AM" / "PM"), an {@code "M"}
     * is appended to the {@link String}, to account for parsing behavior.
     *
     * @param timePart
     *         the {@link String} containing "Time" information to be parsed
     *
     * @return a parsed {@link LocalTime} object, or {@code null}
     *
     * @see LocalTime
     * @see #TIME_FORMAT
     */

export function parseTime (timePart) {
  let timeString = timePart
  if (timeString.endsWith('A') || timeString.endsWith('P')) {
    timeString += 'M'
  }

  // Assuming TIME_FORMAT is something like "hh:mmA" or "hh:mmP"
  // JavaScript Date parsing is more limited, so you may need to adjust the format manually
  const match = timeString.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)
  if (match) {
    // Convert matched time to a Date object
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const isPM = match[3] === 'PM'

    const date = new Date()
    date.setHours(isPM ? hours % 12 + 12 : hours % 12, minutes, 0, 0) // Adjust for AM/PM
    return date
  } else {
    // Log failure to parse time
    if (!IS_TEST) console.trace('Failed to parse relative time [' + timePart + ']')
    return null
  }
}

/**
     * Attempts to parse the provided {@code timePart} {@link String} to a {@link LocalTime} object used to adjust the
     * provided {@link LocalDateTime} parsed from the "Relative Date". If the time string does not match any constant or
     * date pattern defined by {@link #TIME_FORMAT}, {@code null} is returned.
     * <p>
     * If the parsed {@link LocalDateTime} is {@code null} (meaning it failed to parse), {@code null} is returned.
     * <p>
     * If the original {@code datePart} string is not relative to "Today" (starting with "T" or "TODAY"), no "Time"
     * value will be appended.
     * <p>
     * Time strings can be either a parsable time value like "12PM", "9:45", or "064523", or may be a constant
     * representing "Now", "Noon", or "Midnight".
     * <p>
     * Some examples include (assuming the current date is 10/21/2018):
     * <pre>
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "NOW")    = 2018-10-21T06:45:23
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "NOON")   = 2018-10-21T12:00
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "MID")    = 2018-10-22T00:00
     *
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "12PM")   = 2018-10-21T12:00
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "9:45")   = 2018-10-21T09:45
     * DateUtils.parseTimePart(2018-10-21T00:00, "TODAY", "064523") = 2018-10-21T06:45:23
     *
     * DateUtils.parseTimePart(2018-10-21T06:45:23, "NOW", "12PM")  = 2018-10-21T06:45:23
     *
     * DateUtils.parseTimePart(null, "ABC", 12PM)                   = null
     * DateUtils.parseTimePart(2018-10-21T06:45:23, "TODAY", "ABC") = null
     * </pre>
     *
     * @param parsedDate
     *         the {@link LocalDateTime} parsed from the {@code datePart}
     * @param datePart
     *         the date {@link String} previously parsed
     * @param timePart
     *         the date {@link String} to populate the previously parsed Date {@link LocalDateTime}
     *
     * @return a parsed {@link LocalDateTime} object, including "Time", or {@code null}
     *
     * @see LocalDateTime
     * @see LocalTime
     * @see #isDateRelativeToToday(String)
     * @see #parseTime(String)
     * @see #TIME_FORMAT
     */

export function parseTimePart (parsedDate, datePart, timePart) {
  if (!parsedDate) {
    return null
  }

  // If not parsing relative to TODAY, then we're not interested in the time value - only the date
  if (!isDateRelativeToToday(datePart)) {
    return parsedDate
  }

  if (timePart.toUpperCase() === 'U') {
    parsedDate.setHours(0, 0, 0, 0) // Set to start of the day
  } else if (timePart.toUpperCase() === 'NOW') {
    // Current time, no change needed since parsedDate is already set to now
  } else if (timePart.toUpperCase() === 'NOON') {
    parsedDate.setHours(12, 0, 0, 0) // Set to noon
  } else if (timePart.toUpperCase() === 'MID') {
    // Next day at midnight
    parsedDate = new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000)
    parsedDate.setHours(0, 0, 0, 0)
  } else {
    // Assuming parseTime returns a Date object or null
    const time = parseTime(timePart, parsedDate)
    if (time === null) {
      return null
    }
    return time
  }
  return parsedDate
}

/**
     * Attempts to parse the provided {@code dateString} {@link String} into a {@link LocalDateTime} object. If the date
     * string does not match any supported relative date pattern, {@code null} is returned. The date string may or may
     * not have "Time" value. Date values can also have adjustment indicating relative in the past or future from the
     * specified date indicator (eg: "T+1H", "T-3M").
     * <p>
     * Date strings can be either relative to "Today" or "Now", or may be a constant representing "Today", "Now",
     * "Noon", or "Midnight".
     * <p>
     * If the original {@code datePart} string is not relative to "Today" (starting with "T" or "TODAY"), no "Time"
     * value will be appended.
     * <p>
     * Time strings can be either a parsable time value like "12PM", "9:45", or "064523", or may be a constant
     * representing "Now", "Noon", or "Midnight".
     * <p>
     * Some examples include (assuming the current date is 10/21/2018):
     * <pre>
     * DateUtils.parseRelativeVistaDate("T")           = 2018-10-21T00:00
     * DateUtils.parseRelativeVistaDate("TODAY")       = 2018-10-21T00:00
     * DateUtils.parseRelativeVistaDate("N")           = 2018-10-21T06:45:23
     * DateUtils.parseRelativeVistaDate("NOW")         = 2018-10-21T06:45:23
     * DateUtils.parseRelativeVistaDate("NOON")        = 2018-10-21T12:00:00
     * DateUtils.parseRelativeVistaDate("MIDNIGHT")    = 2018-10-22T00:00
     *
     * DateUtils.parseRelativeVistaDate("T+3@NOON")    = 2018-10-24T12:00
     * DateUtils.parseRelativeVistaDate("T-3M@12PM")   = 2018-07-21T12:00
     * DateUtils.parseRelativeVistaDate("T+3W@9:45")   = 2018-11-11T09:45
     * DateUtils.parseRelativeVistaDate("T-3D@064523") = 2018-10-18T06:45:23
     * DateUtils.parseRelativeVistaDate("T+3H@")       = 2018-10-21T03:00
     * DateUtils.parseRelativeVistaDate("T-3'")        = 2018-10-20T23:57
     *
     * DateUtils.parseRelativeVistaDate("ABC")         = null
     * DateUtils.parseRelativeVistaDate("123")         = null
     * DateUtils.parseRelativeVistaDate("123@12PM")    = null
     * DateUtils.parseRelativeVistaDate("T@12PM@NOON") = null
     * DateUtils.parseRelativeVistaDate("TODAY@ABC")   = null
     * </pre>
     *
     * @param dateString
     *         the Date/Time {@link String} to parse into a {@link LocalDateTime}
     *
     * @return a parsed {@link LocalDateTime} object, or {@code null}
     *
     * @see LocalDateTime
     * @see #parseDatePart(String)
     * @see #parseTimePart(LocalDateTime, String, String)
     */

export function parseRelativeVistaDate (dateString) {
  const dateTimeParts = dateString.split('@')
  if (dateTimeParts.length > 2) { // Contains more than 1 @ symbol; invalid
    return null
  }

  const datePart = dateTimeParts[0].trim()
  let localDateTime = parseDatePart(datePart)

  if (dateTimeParts.length > 1) {
    const timePart = dateTimeParts[1].trim()
    localDateTime = parseTimePart(localDateTime, datePart, timePart)
  }
  return localDateTime?.toString()
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
export function formatWithTimezoneAndPattern (dateTime, timeZone, pattern) {
  validateTimeZone(timeZone)

  const dTime = dateTime instanceof OffsetDateTime ? dateTime : OffsetDateTime.parse(dateTime)
  const zoneId = ZoneId.of(timeZone)
  const ldt = dTime.atZoneSameInstant(zoneId).toLocalDateTime()
  return formatWithPattern(ldt.toString(), pattern)
}

export function formatWithPattern (dateTime, pattern) {
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
export function formatLocalDate (date) {
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
export function formatLocalDateTime (dateTime) {
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
export function formatVistaDate (date) {
  if (date === null) return null
  const isJodaInstance = date instanceof LocalDate
  const dateTime = isJodaInstance ? date : LocalDate.parse(date)
  return format(dateTime, VISTA_DATE_FORMAT)
}

/**
     * Format the provided {@link LocalDate} into a date string using the FileMan "yyyMMdd" date pattern. If the
     * provided {@link LocalDate} is {@code null}, {@code null} is returned.
     * <p>
     * FileMan Formatting: <a href="http://www.vistapedia.com/index.php/Date_formats">VistA Date Formats</a>
     * <pre>
     * DateUtils.formatFileManDate(null)       = null
     * DateUtils.formatFileManDate(2018-10-21) = "3181021"
     * </pre>
     *
     * @param date
     *         the {@link LocalDate} to format into a date string
     *
     * @return a date string in the FileMan "yyyMMdd" date pattern or {@code null}
     *
     * @see LocalDate
     * @see #VISTA_DATE_FORMAT
     * @see #formatVistaDate(LocalDate)
     * @see #convertDateFromVistaToFileMan(String)
     */

export function formatFileManDate (dateTime) {
  const dTime = dateTime instanceof LocalDate ? dateTime : LocalDate.parse(dateTime)
  const vistaDate = formatVistaDate(dTime)
  return convertDateFromVistaToFileMan(vistaDate)
}

/**
     * Format the provided {@link OffsetDateTime} into a date string using the "MM/dd/yyyy" date pattern, adjusting the
     * time according to the provided TimeZone {@link String}. If the provided {@link OffsetDateTime} is {@code null},
     * {@code null} is returned.
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
     * DateUtils.formatDate(null,                      "America/New_York") = null
     * DateUtils.formatDate(2018-10-21T06:12:45Z,      null)               = IllegalArgumentException
     *
     * DateUtils.formatDate(2018-10-21T06:12:45Z,      "America/New_York") = "10/21/2018"
     * DateUtils.formatDate(2018-10-22T03:12:45Z,      "America/New_York") = "10/21/2018"
     *
     * DateUtils.formatDate(2018-10-21T06:12:45-04:00, "America/New_York") = "10/21/2018"
     * DateUtils.formatDate(2018-10-22T03:12:45-04:00, "America/New_York") = "10/22/2018"
     * </pre>
     *
     * @param dateTime
     *         the {@link OffsetDateTime} to format into a date string
     * @param timeZone
     *         the TimeZone {@link String} used in Date/Time conversions
     *
     * @return a date string in the "MM/dd/yyyy" date pattern or {@code null}
     *
     * @see OffsetDateTime
     * @see #DEFAULT_DATE_FORMAT
     * @see #formatDate(LocalDateTime)
     */

/**
     * Format the provided {@link LocalDateTime} into a date string according to the provided {@code pattern}. If the
     * provided {@link LocalDateTime} is {@code null}, {@code null} is returned.
     * <p>
     * If the format is {@link #VISTA_DATETIME_FORMAT}, ensure any trailing zeros are trimmed from the end of the
     * formatted string. This is to account for any precision errors from the underlying VistA system. See: <a
     * href="http://www.hardhats.org/fileman/pm/cl_dt.htm">VistA FileMan Date Format</a>
     * <pre>
     * DateUtils.format(null,                "MM/dd/yyyy")      = null
     * DateUtils.format(2018-10-21T06:12:45, null)              = IllegalArgumentException
     *
     * DateUtils.format(2018-10-21T06:12:45, "MM/dd/yyyy")      = "10/21/2018"
     * DateUtils.format(2018-10-21T06:12:45, "yyyyMMdd")        = "20181021"
     * DateUtils.format(2018-10-21T06:12:45, "yyyyMMdd.HHmmss") = "20181021.061245"
     * DateUtils.format(2018-10-21T00:00,    "yyyyMMdd.HHmmss") = "20181021"
     * DateUtils.format(2018-10-21T20:00,    "yyyyMMdd.HHmmss") = "20181021.2"
     * </pre>
     *
     * @param dateTime
     *         the {@link LocalDateTime} to format into a date string
     * @param pattern
     *         the date string formatting pattern to use
     *
     * @return a formatted date string or {@code null}
     *
     * @see LocalDateTime
     * @see #removeTrailingZeros(String)
     */

export function format (dateTime, pattern) {
  if (dateTime === null) {
    return null
  }
  if (pattern === null) {
    throw new Error('Date Format Pattern must not be null')
  }

  const formatter = DateTimeFormatter.ofPattern(pattern)
  const formattedString = dateTime.format(formatter)

  // Assuming VISTA_DATETIME_FORMAT is defined somewhere in your code
  if (VISTA_DATETIME_FORMAT === pattern) {
    return removeTrailingZeros(formattedString)
  }
  return formattedString
}

export function formatDate (dateTime, timeZone) {
  return format(dateTime, timeZone, DEFAULT_DATE_FORMAT)
}
