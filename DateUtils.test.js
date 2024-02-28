const { LocalDate, ZoneId, DateTimeFormatter, LocalDateTime, LocalTime } = require('@js-joda/core')
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
  formatFileManDateTime,
  formatFileManDate,
  parseToLocal,
  parseToOffset,
  parseToUtc,
  parseFromUtc,
  parseRelativeVistaDate,
  parseDatePart,
  parseTimePart,
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

test('formatFileManDate', (t) => {
  const dateTime = LocalDate.of(2018, 10, 21)

  const timeZone = 'UTC';

  const data = formatFileManDate(dateTime, timeZone);

  t.equal(data, '3181021');
  t.end();
});


test('parseRelativeVistaDate', (t) => {

  const data = parseRelativeVistaDate("T");
  const today = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).toString();
  // const expectedFormat = DateTimeFormatter.ofPattern('yyyy-MM-ddT00:00');
  // const expected = today.format(expectedFormat);
  t.equal(data, today);
  t.end();
})

test('parseToLocal',(t) => {
  const string = "10/21/2018 02:12"

  const expectedDate = '2018-10-21T02:12';

  const dateTime = parseToLocal(string).toString();

  t.equal(dateTime, expectedDate);
  t.end();
});

test('parseToOffset',(t) => {
  const dateString = "10/21/2018 02:12"

  const dateTime = parseToOffset(dateString);

  const expectedDate = '2018-10-21T02:12Z';
  t.equal(dateTime, expectedDate);
  t.end();
});

test('parseToUtc',(t) => {
  const string = '20181021.021245'
  const timeZone =   "UTC"
  const dateTime = parseToUtc(string, timeZone);

  t.equal(dateTime, '2018-10-21T02:12:45Z');
  t.end();
});

test('parseFromUtc',(t) => {
  const string = '20181021.021245'
  const timeZone =   "UTC"
  const dateTime = parseFromUtc(string, timeZone);

  t.equal(dateTime, '2018-10-21T02:12:45Z');
  t.end();
});

test('parseDatePart', (t) => {
  const string = 'T+3'
  const dateTime = parseDatePart(string);
  const localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).plusDays(3);
  const expected = localDateTime.toString()
  t.equal(dateTime, expected);
  t.end();
})

test('parseDatePart', (t) => {
  const string = 'T-3'
  const dateTime = parseDatePart(string);
  const localDateTime = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).minusDays(3);
  const expected = localDateTime.toString()
  t.equal(dateTime, expected);
  t.end();
})

test('parseTimePart', (t) => {
  const string = "2018-10-21T06:45:23"
   
  const dateTime = parseTimePart(string, "NOW", "12PM");

  t.equal(dateTime, "2018-10-21T06:45:23");
  t.end();
})