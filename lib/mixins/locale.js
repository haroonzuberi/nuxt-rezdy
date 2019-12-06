import { format, parseISO } from 'date-fns'
import { es, it } from 'date-fns/locale'

const dateLocales = { es, it }

export default {
  computed: {
    monthNames () {
      return Object.values(this.$t('months'))
    }
  },
  filters: {
    formatDateLocale (date, dateFormat, locale) {
      if (typeof date === 'string') {
        date = parseISO(date)
      }
      return format(date, dateFormat || 'MMMM d, yyyy', {
        locale: dateLocales[locale]
      })
    },
    currency (val, locale, currency) {
      (+val).toLocaleString(locale || 'en', {
        style: 'currency',
        currency: currency || 'USD'
      })
    }
  }
}
