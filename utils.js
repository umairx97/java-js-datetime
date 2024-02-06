module.exports = {
  isBlank,
  isNullish
}

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
