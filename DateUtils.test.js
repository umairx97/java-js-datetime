const { LocalDate, ZoneId } = require('@js-joda/core')
const {
  isDatePartNoon,
  endOfDay, zeroPadVistaDateTime,
  convertDateFromFileManToVista,
  removeTrailingZeros,
  startOfDay,
  convertDateFromVistaToFileMan,
  formatVistaDate,
  formatLocalDate,
  formatWithTimezoneAndPattern,
  formatVistaDateTime,
  formatVistaDateTimeWithTimezone,
  formatFileManDateTime
} = require('./')

const test = require('tape')
require('@js-joda/timezone')
require('@js-joda/locale')

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
