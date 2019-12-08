import { format, parseISO } from 'date-fns'
import { es, it, pt } from 'date-fns/locale'

const dateLocales = { es, it, pt }

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
      return (+val).toLocaleString(locale || 'en', {
        style: 'currency',
        currency: currency || 'EUR'
      })
    },
    localeParse (text, locale) {
      const locales = Object.keys(dateLocales).filter(l => l !== locale).join('|')
      const regex = new RegExp(`(?<=${locale}:).*?(?:(?!(^(${locales}):|\Z)).)*(?=((${locales}):)|$)`, 'gmis')
      const results = text.match(regex)
      if (!results) {
        const fbregex = new RegExp(`^.*?(?=(^(${locales}):)|$)`, 'gmis')
        const [fbres] = text.match(fbregex)
        console.log(fbregex, fbres)
        return fbres
      }
      console.log(regex,results)
      return results.join('\n')
    }
  }
}
