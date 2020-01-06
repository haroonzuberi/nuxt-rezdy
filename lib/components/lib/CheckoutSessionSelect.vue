<template>
  <div>
    <h2 class="title">{{ $t('select') }} {{ $t('date-and-time') }}</h2>
    <transition-group tag="div" name="date-time" class="columns">
      <div key="date" class="column has-items-centered">
        <b-datepicker
          ref="datepicker"
          v-model="selectedDate"
          inline
          nearby-selectable-month-days
          :month-names="monthNames"
          :events="events"
          :selectable-dates="selectableDates"
          :unselectable-days-of-week="unselectableDaysOfWeek"
        ></b-datepicker>
        <b-loading :active="loading" :is-full-page="false" />
      </div>
      <div
        v-show="showSessionSelect"
        key="time"
        ref="sessionTimesList"
        class="column has-items-centered"
      >
        <div style="width:100%">
          <p class="content has-text-centered subtitle is-5">
            {{ $t('choose-time') }}:
          </p>
          <ul class="columns is-multiline" style="justify-content: center">
            <li
              v-for="s of sessionTimes"
              :key="s.id"
              class="column is-half has-text-centered"
            >
              <b-button
                :disabled="!s.seatsAvailable"
                type="is-success"
                size="is-large"
                @click="selectSession(s)"
              >
                {{ s.startTimeLocal | formatDateLocale('p', $i18n.locale) }}
              </b-button>
              <div
                class="rezdy--seating-availability"
                v-if="$parent.$rezdy.availability"
              >
                <span
                  v-if="
                    s.seatsAvailable > 0 && s.seatsAvailable <= $parent.$rezdy.availability.threshold
                  "
                  class="rezdy--session-availability-remaining"
                  >{{ $t('x-remaining', { amount: s.seatsAvailable }) }}</span
                >
                <span
                  class="rezdy--session-availability-soldout"
                  v-if="s.seatsAvailable === 0"
                  >{{ $t('sold-out') }}</span
                >
              </div>
              <!-- {{ session.seatsAvailable }} -->
            </li>
          </ul>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { parseISO, format, isSameDay, addMinutes } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import debounce from 'lodash/debounce'
import locale from '../../mixins/locale'

export default {
  name: 'CheckoutSessionSelect',
  mixins: [locale],
  props: {
    product: {
      type: Object,
      default: () => null
    },
    session: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      sessions: [],
      selectedDate: new Date(),
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      loading: false
    }
  },
  computed: {
    productCode() {
      return this.product.productCode
    },
    sessionTimes() {
      return this.sessions.filter(session =>
        isSameDay(parseISO(session.startTimeLocal), this.selectedDate)
      )
    },
    startTimeLocal() {
      return format(new Date(this.year, this.month), 'yyyy-MM-dd HH:mm:ss')
    },
    endTimeLocal() {
      return format(new Date(this.year, this.month + 1), 'yyyy-MM-dd HH:mm:ss')
    },
    selectableDates() {
      return this.sessions.map(session => parseISO(session.startTimeLocal))
    },
    unselectableDaysOfWeek() {
      return this.selectableDates.length ? [] : [0, 1, 2, 3, 4, 5, 6]
    },
    events() {
      return this.selectableDates.map(date => ({
        date,
        type: 'is-success'
      }))
    },
    hasDaySelection() {
      if (this.sessionTimes.length === 1) {
        const [session] = this.sessionTimes
        const date = parseISO(session.startTimeLocal)
        return date.getHours() + date.getMinutes() + date.getSeconds() === 0
      }
      return false
    },
    showSessionSelect() {
      return (
        this.sessionTimes && this.sessionTimes.length && !this.hasDaySelection
      )
    }
  },
  watch: {
    sessionTimes(sessions) {
      if (this.hasDaySelection) this.selectSession(sessions[0])
      this.$nextTick(() => {
        this.$refs.sessionTimesList.scrollIntoView({ behavior: 'smooth' })
      })
    },
    startTimeLocal(startTimeLocal) {
      this.getSessionsDebounced()
    },
    selectedDate(date) {
      const year = date.getFullYear()
      const month = date.getMonth()
      if (year !== this.year && month !== this.month) {
        this.year = year
        this.month = month
      }
    }
  },
  mounted() {
    this.getSessions()

    this.$refs.datepicker.$on('change-month', month => {
      this.month = month
    })
    this.$refs.datepicker.$on('change-year', year => {
      this.year = year
    })
  },
  methods: {
    getSessionsDebounced: debounce(function() {
      this.getSessions()
    }, 200),
    async getSessions() {
      this.loading = true
      const { sessions } = await this.$parent.$rezdy.getSessions({
        productCode: this.productCode,
        startTimeLocal: this.startTimeLocal,
        endTimeLocal: this.endTimeLocal,
        rspc: 1
      })
      this.sessions = sessions.filter(session => {
        const nowPlusNoticeTz = utcToZonedTime(
          addMinutes(new Date(), this.product.minimumNoticeMinutes),
          this.product.timezone
        )
        return parseISO(session.startTime) > nowPlusNoticeTz
      })
      this.loading = false
      return sessions
    },
    selectSession(session) {
      this.$emit('update:session', session)
    }
  }
}
</script>

<style scoped>
.has-items-centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

.columns {
  position: relative;
}

.date-time-enter-active,
.date-time-leave-active {
  transition: transform 250ms;
}
.date-time-enter, .date-time-leave-to /* .date-time-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(20px);
}
</style>
