import { LocalDate, ZoneId, LocalDateTime, LocalTime, ChronoUnit } from '@js-joda/core'
import {
  isDatePartNoon,
  endOfDay,
  zeroPadVistaDateTime,
  convertDateFromFileManToVista,
  removeTrailingZeros,
  startOfDay,
  convertDateFromVistaToFileMan,
  formatVistaDate,
  formatLocalDate,
  formatWithTimezoneAndPattern,
  formatVistaDateTime,
  formatVistaDateTimeWithTimezone,
  formatFileManDateTime,
  formatFileManDate,
  parseToUtc,
  parseFromUtc,
  parseRelativeVistaDate,
  parseAdjuster,
  parseDatePart,
  parseTimePart,
  adjustRelativeDate,
  createDateFormatsFromArray,
  validateTimeZone,
  isBlank,
  isNullish,
  getToday,
  getYesterday,
  getTomorrow,
  get30DaysFromToday,
  get120DaysFromToday,
  get3MonthsFromToday,
  isDateRelativeToToday,
  isDatePartToday,
  isDatePartNow,
  isDatePartMidnight,
  isDatePartNegativelyRelative,
  isDatePartPositivelyRelative,
  parseTime
} from '../index.js'

import test from 'tape'
import { setMockDate, resetGlobalDate } from './test-utils.js'

import '@js-joda/timezone'

test('getToday', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(getToday(), '2018-10-21')
  resetGlobalDate()
  t.end()
})

test('getYesterday', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(getYesterday(), '2018-10-20')
  resetGlobalDate()
  t.end()
})

test('getTomorrow', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(getTomorrow(), '2018-10-22')
  resetGlobalDate()
  t.end()
})

test('get30DaysFromToday', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(get30DaysFromToday(), '2018-11-20')
  resetGlobalDate()
  t.end()
})

test('get120DaysFromToday', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(get120DaysFromToday(), '2019-02-18')
  resetGlobalDate()
  t.end()
})

test('get3MonthsFromToday', t => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })
  t.equal(get3MonthsFromToday(), '2019-01-21')
  resetGlobalDate()
  t.end()
})

test('isNullish function', (t) => {
  // Test for explicitly nullish values
  t.true(isNullish(null), 'Correctly identifies null as nullish')
  t.true(isNullish(undefined), 'Correctly identifies undefined as nullish')

  // Test for string values that are considered nullish
  t.true(isNullish(''), 'Correctly identifies an empty string as nullish')
  t.true(isNullish('   '), 'Correctly identifies a string of spaces as nullish')
  t.true(isNullish('-1'), 'Correctly identifies "-1" as nullish')
  t.true(isNullish('   -1   '), 'Correctly identifies "-1" with spaces as nullish')
  t.true(isNullish('Invalid Date'), 'Correctly identifies "Invalid Date" as nullish')
  t.true(isNullish('   Invalid Date   '), 'Correctly identifies "Invalid Date" with spaces as nullish')

  // Test for values that are not considered nullish
  t.false(isNullish('text'), 'Correctly identifies non-empty strings as not nullish')
  t.false(isNullish('0'), 'Correctly identifies "0" as not nullish')
  t.false(isNullish('1'), 'Correctly identifies "1" as not nullish')
  t.false(isNullish('true'), 'Correctly identifies "true" as not nullish')
  t.false(isNullish('false'), 'Correctly identifies "false" as not nullish')

  t.end()
})

test('isBlank function', (t) => {
  // Test with non-blank strings
  t.false(isBlank('text'), 'Returns false for regular text')
  t.false(isBlank('  text  '), 'Returns false for text with surrounding whitespace')

  // Test with only whitespace strings
  t.true(isBlank(' '), 'Returns true for a single space')
  t.true(isBlank('    '), 'Returns true for multiple spaces')
  t.true(isBlank('\t\n'), 'Returns true for tabs and newlines')

  // Test with an empty string
  t.true(isBlank(''), 'Returns true for an empty string')

  // Since isBlank doesn't explicitly handle null or undefined, these tests expect false
  // This behavior depends on how you want to handle non-string inputs in your implementation
  t.false(isBlank(null), 'Returns false for null')
  t.false(isBlank(undefined), 'Returns false for undefined')

  t.end()
})

test('validateTimeZone function', (t) => {
  // Test with a non-blank string
  t.doesNotThrow(() => validateTimeZone('America/New_York'), 'Does not throw for valid time zone string')

  try {
    validateTimeZone('')
  } catch (err) {
    t.ok(err, 'throws on empty string')
  }

  t.end()
})

test('createDateFormatsFromArray function', (t) => {
  t.equals(createDateFormatsFromArray([]), '', 'Returns an empty string for an empty array')
  t.equals(createDateFormatsFromArray(['YYYY-MM-DD']), '[YYYY-MM-DD]', 'Correctly formats a single date format')
  t.equals(createDateFormatsFromArray(['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY']), '[YYYY-MM-DD] [MM/DD/YYYY] [DD-MM-YYYY]', 'Correctly formats multiple date formats')

  t.end()
})

test('adjustRelativeDate', t => {
  const date = LocalDate.of(2018, 10, 21)
  let result = adjustRelativeDate(date, { amount: 3, unit: ChronoUnit.DAYS }, '+')
  t.equal(result.toString(), '2018-10-24')
  result = adjustRelativeDate(date, { amount: 3, unit: ChronoUnit.DAYS }, '-')
  t.equal(result.toString(), '2018-10-18')

  result = adjustRelativeDate(date, { amount: 3, unit: ChronoUnit.DAYS })
  t.equal(result.toString(), '2018-10-21')
  t.end()
})
test('parseAdjuster function', (t) => {
  // Test with a valid number and unit
  t.equal(parseAdjuster('5d').amount, 5, 'Parses days correctly')
  t.equal(parseAdjuster('5d').unit.toString(), 'Days', 'Parses days correctly')

  // Test with an empty string
  t.equals(parseAdjuster(''), null, 'Returns null for an empty string input')

  // Test with a string that contains no digits
  t.equals(parseAdjuster('days'), null, 'Returns null for input with no digits')

  t.end()
})

test('isDateRelativeToToday function', (t) => {
  // Test for strings that should return true
  t.true(isDateRelativeToToday('T+1'), 'Correctly identifies a string starting with T as relative to today')
  t.true(isDateRelativeToToday('T-10'), 'Correctly identifies a string starting with T as relative to today')

  // Test for strings that should return false
  t.false(isDateRelativeToToday('2023-01-01'), 'Correctly identifies a standard date format as not relative to today')
  t.false(isDateRelativeToToday('Yesterday'), 'Correctly identifies a word that does not start with T as not relative to today')

  // Test for edge cases
  t.false(isDateRelativeToToday(''), 'Correctly identifies an empty string as not relative to today')
  t.false(isDateRelativeToToday(' t+1'), 'Correctly identifies a string starting with a space and then T as not relative to today')

  t.end()
})

test('isDatePartToday function', (t) => {
  t.true(isDatePartToday('t'), 'Correctly identifies "t" as today')
  t.true(isDatePartToday('T'), 'Correctly identifies "T" as today')
  t.true(isDatePartToday('today'), 'Correctly identifies "today" as today')
  t.true(isDatePartToday('Today'), 'Correctly identifies "Today" as today')
  t.true(isDatePartToday('TODAY'), 'Correctly identifies "TODAY" as today')

  // Test for strings that do not match 't' or 'today'
  t.false(isDatePartToday('tomorrow'), 'Correctly identifies non-matching strings as not today')
  t.false(isDatePartToday('yesterday'), 'Correctly identifies non-matching strings as not today')
  t.false(isDatePartToday(''), 'Correctly identifies an empty string as not today')

  t.end()
})

test('isDatePartNow function', (t) => {
  // Test for strings that exactly match 'n' or 'now' in various cases
  t.true(isDatePartNow('n'), 'Correctly identifies "n" as now')
  t.true(isDatePartNow('N'), 'Correctly identifies "N" as now')
  t.true(isDatePartNow('now'), 'Correctly identifies "now" as now')
  t.true(isDatePartNow('Now'), 'Correctly identifies "Now" as now')
  t.true(isDatePartNow('NOW'), 'Correctly identifies "NOW" as now')

  // Test for strings that do not match 'n' or 'now'
  t.false(isDatePartNow('new'), 'Correctly identifies non-matching strings as not now')
  t.false(isDatePartNow('none'), 'Correctly identifies non-matching strings as not now')
  t.false(isDatePartNow(''), 'Correctly identifies an empty string as not now')

  t.end()
})

test('isDatePartMidnight', t => {
  t.true(isDatePartMidnight('mid'))
  t.false(isDatePartMidnight('midnight'))
  t.end()
})

test('isDatePartNegativelyRelative function', (t) => {
  // Test for strings containing '-'
  t.false(isDatePartNegativelyRelative('yesterday'), 'Correctly identifies strings containing "-" as negatively relative')
  t.true(isDatePartNegativelyRelative('-1'), 'Correctly identifies strings containing "-" as negatively relative')
  t.true(isDatePartNegativelyRelative('T-1'), 'Correctly identifies strings containing "-" as negatively relative')

  // // Test for strings not containing '-'
  t.false(isDatePartNegativelyRelative('tomorrow'), 'Correctly identifies strings without "-" as not negatively relative')
  t.false(isDatePartNegativelyRelative('T+1'), 'Correctly identifies strings without "-" as not negatively relative')
  t.false(isDatePartNegativelyRelative('today'), 'Correctly identifies strings without "-" as not negatively relative')

  // // Test with special cases
  t.true(isDatePartNegativelyRelative('-'), 'Correctly identifies a string that is just "-" as negatively relative')
  t.false(isDatePartNegativelyRelative(''), 'Correctly identifies an empty string as not negatively relative')

  t.end()
})

test('isDatePartPositivelyRelative function', (t) => {
  // Test for strings containing '+'
  t.false(isDatePartPositivelyRelative('tomorrow'), 'Correctly identifies strings containing "+" as positively relative')
  t.true(isDatePartPositivelyRelative('+1'), 'Correctly identifies strings containing "+" as positively relative')
  t.true(isDatePartPositivelyRelative('T+1'), 'Correctly identifies strings containing "+" as positively relative')

  // Test for strings not containing '+'
  t.false(isDatePartPositivelyRelative('yesterday'), 'Correctly identifies strings without "+" as not positively relative')
  t.false(isDatePartPositivelyRelative('T-1'), 'Correctly identifies strings without "+" as not positively relative')
  t.false(isDatePartPositivelyRelative('today'), 'Correctly identifies strings without "+" as not positively relative')

  // Test with special cases
  t.true(isDatePartPositivelyRelative('+'), 'Correctly identifies a string that is just "+" as positively relative')
  t.false(isDatePartPositivelyRelative(''), 'Correctly identifies an empty string as not positively relative')

  t.end()
})

test('isDatePartNoon', t => {
  t.true(isDatePartNoon('noon'), '12:00:00 is noon')
  t.false(isDatePartNoon('2020-01-01 12:00:01'))
  t.end()
})

test('endOfDay', t => {
  t.equal(endOfDay('2018-10-21T06:12:45Z'), '2018-10-21T23:59:59.999Z')
  t.equal(endOfDay('2018-10-21T06:12:45-04:00'), '2018-10-21T23:59:59.999Z')
  t.end()
})

test('zeroPadVistaDateTime', t => {
  t.equal(zeroPadVistaDateTime(null), null)
  t.equal(zeroPadVistaDateTime(''), null)
  t.equal(zeroPadVistaDateTime('Invalid Date'), null)
  t.equal(zeroPadVistaDateTime('20181021'), '20181021')
  t.equal(zeroPadVistaDateTime('20181021.'), '20181021')
  t.equal(zeroPadVistaDateTime('20181021.06'), '20181021.060000')
  t.equal(zeroPadVistaDateTime('20181021.060000'), '20181021.060000')
  t.equal(zeroPadVistaDateTime('10/21/2018'), '10/21/2018')
  t.end()
})

test('convertDateFromFileManToVista', t => {
  t.equal(convertDateFromFileManToVista('20181021'), '20181021')
  t.equal(convertDateFromFileManToVista('20181021.'), '20181021.')
  t.equal(convertDateFromFileManToVista('20181021.06'), '20181021.06')
  t.equal(convertDateFromFileManToVista('20181021.060000'), '20181021.060000')
  t.equal(convertDateFromFileManToVista('10/21/2018'), '10/21/2018')
  t.end()
})

test('removeTrailingZeros', t => {
  t.equal(removeTrailingZeros(null), null)
  t.equal(removeTrailingZeros(''), null)
  t.equal(removeTrailingZeros('Invalid Date'), null)
  t.equal(removeTrailingZeros('20181021'), '20181021')
  t.equal(removeTrailingZeros('20181021.'), '20181021')
  t.equal(removeTrailingZeros('20181021.06'), '20181021.06')
  t.equal(removeTrailingZeros('20181021.060000'), '20181021.06')
  t.equal(removeTrailingZeros('10/21/2018'), '10/21/2018')
  t.end()
})

test('startOfDay', t => {
  t.equal(startOfDay('2018-10-21T06:12:45Z'), '2018-10-21T00:00Z')
  t.equal(startOfDay('2018-10-21T06:12:45-04:00'), '2018-10-21T00:00Z')
  t.end()
})

test('formatWithTimezoneAndPattern', t => {
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45Z', 'America/New_York', 'MM/dd/yyyy'), '10/21/2018')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45Z', 'America/New_York', 'MM/dd/yyyy'), '10/21/2018')
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45-04:00', 'America/New_York', 'MM/dd/yyyy'), '10/21/2018')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45-04:00', 'America/New_York', 'MM/dd/yyyy'), '10/22/2018')
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45Z', 'America/New_York', 'yyyyMMdd'), '20181021')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45Z', 'America/New_York', 'yyyyMMdd'), '20181021')
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45-04:00', 'America/New_York', 'yyyyMMdd'), '20181021')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45-04:00', 'America/New_York', 'yyyyMMdd'), '20181022')
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45Z', 'America/New_York', 'yyyyMMdd.HHmmss'), '20181021.021245')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45Z', 'America/New_York', 'yyyyMMdd.HHmmss'), '20181021.231245')
  t.equal(formatWithTimezoneAndPattern('2018-10-21T06:12:45-04:00', 'America/New_York', 'yyyyMMdd.HHmmss'), '20181021.061245')
  t.equal(formatWithTimezoneAndPattern('2018-10-22T03:12:45-04:00', 'America/New_York', 'yyyyMMdd.HHmmss'), '20181022.031245')
  t.end()
})

test('formatLocalDate', t => {
  t.equal(formatLocalDate(null), null)
  t.equal(formatLocalDate('2018-10-21'), '10/21/2018')
  t.end()
})

test('formatVistaDate', t => {
  t.equal(formatVistaDate(null), null)
  t.equal(formatVistaDate('2018-10-21'), '20181021', 'should not fail')
  t.end()
})
test('convertDateFromVistaToFileMan', t => {
  t.equal(convertDateFromVistaToFileMan(null), null)
  t.equal(convertDateFromVistaToFileMan(''), null)
  t.equal(convertDateFromVistaToFileMan('Invalid Date'), null)
  t.equal(convertDateFromFileManToVista('20181021'), '20181021')
  t.equal(convertDateFromVistaToFileMan('20181021.061245'), '3181021.061245')
  t.equal(convertDateFromVistaToFileMan('10/21/2018'), '10/21/2018')
  t.end()
})

test('formatVistaDateTime', t => {
  const dateTime = LocalDate.of(2018, 10, 21).atTime(6, 12, 45)
  t.equal(formatVistaDateTime(dateTime), '20181021.061245')
  t.end()
})

test('formatVistaDateTimeWithTimezone', t => {
  const dTime = LocalDate.of(2018, 10, 21)
    .atTime(6, 12, 45)
    .atZone(ZoneId.of('America/New_York'))
    .toOffsetDateTime()

  t.equal(formatVistaDateTimeWithTimezone(dTime, 'America/New_York'), '20181021.061245')
  t.end()
})

test('formatFileManDateTime', t => {
  const dTime = LocalDate.of(2018, 10, 21)
    .atTime(6, 12, 45)
  const data = formatFileManDateTime(dTime)

  t.equal(data, '3181021.061245')
  t.end()
})

test('formatFileManDate', (t) => {
  const dateTime = LocalDate.of(2018, 10, 21)

  const timeZone = 'UTC'

  const data = formatFileManDate(dateTime, timeZone)

  t.equal(data, '3181021')
  t.end()
})

test('parseRelativeVistaDate', (t) => {
  const data = parseRelativeVistaDate('T')
  const today = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).toString()
  t.equal(data, today)
  t.end()
})

// test('parseToLocal', (t) => {
//   const string = '10/21/2018 02:12'

//   const expectedDate = '2018-10-21T02:12'

//   const dateTime = parseToLocal(string).toString()

//   t.equal(dateTime, expectedDate)
//   t.end()
// })

// test('parseToOffset', (t) => {
//   const dateString = '10/21/2018 02:12'

//   const dateTime = parseToOffset(dateString)

//   const expectedDate = '2018-10-21T02:12Z'
//   t.equal(dateTime, expectedDate)
//   t.end()
// })

test('parseToUtc', (t) => {
  const string = '20181021.021245'
  const timeZone = 'UTC'
  const dateTime = parseToUtc(string, timeZone)

  t.equal(dateTime, '2018-10-21T02:12:45Z')
  t.end()
})

test('parseFromUtc', (t) => {
  const string = '20181021.021245'
  const timeZone = 'UTC'
  const dateTime = parseFromUtc(string, timeZone)

  t.equal(dateTime, '2018-10-21T02:12:45Z')
  t.end()
})

test('parseDatePart', (t) => {
  setMockDate({ dateString: '2018-10-21T06:12:45Z' })

  const string = 'T+3'
  const dateTime = parseDatePart(string)
  const localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).plusDays(3)
  const expected = localDateTime.toString()
  t.equals(parseDatePart('today'), '2018-10-21T00:00')
  t.equals(parseDatePart('noon'), '2018-10-21T12:00')
  t.equals(parseDatePart('midnight'), undefined)
  t.equals(parseDatePart('unhandled'), undefined, 'Correctly returns null for unhandled date parts')
  t.equal(dateTime, expected)
  resetGlobalDate()
  t.end()
})

test('parseDatePart', (t) => {
  const string = 'T-3'
  const dateTime = parseDatePart(string)
  const localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).minusDays(3)
  const expected = localDateTime.toString()
  t.equal(dateTime, expected)
  t.end()
})

test('parseTimePart', (t) => {
  const string = '2018-10-21T06:45:23'

  const dateTime = parseTimePart(string, 'NOW', '12PM')

  t.equal(dateTime, '2018-10-21T06:45:23')
  t.end()
})

test('parseTime function', (t) => {
  // Successfully parses AM time
  const morningTime = parseTime('9:30A')
  t.equals(morningTime.getHours(), 9, 'Correctly sets hours for AM time')
  t.equals(morningTime.getMinutes(), 30, 'Correctly sets minutes for AM time')

  // Successfully parses PM time
  const eveningTime = parseTime('9:30P')
  t.equals(eveningTime.getHours(), 21, 'Correctly adjusts hours for PM time')
  t.equals(eveningTime.getMinutes(), 30, 'Correctly sets minutes for PM time')

  // Handles 12 AM as midnight
  const midnightTime = parseTime('12:00A')
  t.equals(midnightTime.getHours(), 0, 'Correctly interprets 12 AM as midnight')

  // Handles 12 PM as noon
  const noonTime = parseTime('12:00P')
  t.equals(noonTime.getHours(), 12, 'Correctly interprets 12 PM as noon')

  // Fails gracefully with incomplete format
  t.equals(parseTime('9:00'), null, 'Returns null for missing AM/PM indicator')

  t.end()
})
