const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy'
const VISTA_DATETIME_FORMAT = 'yyyyMMdd.HHmmss'
const VISTA_DATE_FORMAT = 'yyyyMMdd'
const FILEMAN_DATE_OFFSET = 17000000
const VISTA_DATE_FORMAT_ARRAY = [
  'MM/dd/yyyy HH:mm:ss,SSS',
  'MM/dd/yyyy HH:mm:ss',
  'MM/dd/yyyy HH:mm',
  DEFAULT_DATE_FORMAT,
  'MM/dd/yy',
  VISTA_DATETIME_FORMAT,
  'yyyyMMdd.HHmm',
  'yyyyMMdd.HH',
  'yyyyMMdd.',
  VISTA_DATE_FORMAT,
  "yyyy-MM-dd'T'HH:mm:ss'Z'",
  "yyyy-MM-dd'T'HH:mm:ss.SSSSSSSSS",
  "yyyy-MM-dd'T'HH:mm:ss.SSSSSS",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm'Z'",
  "yyyy-MM-dd'T'HH:mm",
  'yyyy-MM-dd',
  'MM-dd-yyyy HH:mm:ss,SSS',
  'MM-dd-yyyy',
  'M/d/yyyy HH:mm:ss,SSS',
  'M/d/yyyy HH:mm:ss',
  'M/d/yyyy',
  'M-d-yyyy',
  'M/d/yy',
  'dd MMM yyyy @ HHmm',
  'dd MMM yyyy',
  'MMM d, yyyy@HH:mm:ss',
  'MMM d, yyyy@HH:mm',
  'MMM d, yyyy@HH',
  'MMM dd, yyyy',
  'MMMM dd, yyyy',
  'MMM dd yyyy'
]

const VISTA_TIME_PATTERN = [
  'h:mm:ssa',
  'h:mma',
  'hh:mm:ssa',
  'hh:mma',
  'H:mm:ss',
  'H:mm',
  'HH:mm:ss',
  'HH:mm',
  'hmmssa',
  'hmma',
  'ha',
  'hhmmssa',
  'hhmma',
  'hha',
  'Hmmss',
  'Hmm',
  'H',
  'HHmmss',
  'HHmm',
  'HH'
]

const VISTA_DATE_TIME_SEPARATOR = '.'

/**
     * VistA Date/Time format pattern, ensuring the first token is an <b>8</b> digit string, followed by a ".", or a "."
     * with additional time digits.
     */
const VISTA_DATE_FORMAT_PATTERN = /^\\d{8}$|^\\d{8}\\.$|^\\d{8}\\.\\d*$'/

/**
     * FileMan Date/Time format pattern, ensuring the first token is an <b>7</b> digit string, followed by a ".", or a
     * "." with additional time digits.
     */
const FILEMAN_DATE_FORMAT_PATTERN = /^\\d{7}$|^\\d{7}\\.$|^\\d{7}\\.\\d*$/

/**
     * VistA & FileMan Date/Time format pattern, ensuring the string is a set of digits separated with a ".".
     */
const VISTA_DATE_TIME_FORMAT_PATTERN = /\\d+\\.\\d+/

/**
     * Format {@link String} for building VistA & FileMan Date/Time strings.
     */
const VISTA_DATE_TIME_FORMAT_STRING = '%s.%s'

module.exports = {
  DEFAULT_DATE_FORMAT,
  VISTA_DATETIME_FORMAT,
  VISTA_DATE_FORMAT,
  FILEMAN_DATE_OFFSET,
  VISTA_DATE_FORMAT_ARRAY,
  VISTA_TIME_PATTERN,
  VISTA_DATE_FORMAT_PATTERN,
  FILEMAN_DATE_FORMAT_PATTERN,
  VISTA_DATE_TIME_FORMAT_PATTERN,
  VISTA_DATE_TIME_FORMAT_STRING,
  VISTA_DATE_TIME_SEPARATOR
}
