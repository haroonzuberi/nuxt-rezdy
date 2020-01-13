import { format, parseISO } from 'date-fns'
import { es, it, pt, fr, de } from 'date-fns/locale'

const translations = require('../components/lib/lang.json')

const dateLocales = { es, it, pt, fr, de }

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
      if (val === 0) {
        return translations[locale].free
      }
      return (+val).toLocaleString(locale || 'en', {
        style: 'currency',
        currency: currency || 'EUR'
      })
    },
    localeParse (text, locale) {
      return text
      /* const locales = Object.keys(dateLocales).filter(l => l !== locale).join('|')
      const exp = `(?<=${locale}:).*?(?:(?!(^(${locales}):|\Z)).)*(?=((${locales}):)|$)`
      // s (dotaAll) not supported by many browsers
      const results = text.match(new RegExp(exp, 'gmis'))
      if (!results) {
        const fbregex = new RegExp(`^.*?(?=(^(${locales}):)|$)`, 'gmis')
        const [fbres] = text.match(fbregex)
        return fbres.trim()
      }
      return results.join('\n').trim() */
    }
  }
}
