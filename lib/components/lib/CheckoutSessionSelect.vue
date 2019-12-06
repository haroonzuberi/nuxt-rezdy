<template>
  <div class="columns">
    <b-datepicker
      class="column"
      ref="datepicker"
      inline
      v-model="selectedDate"
      :events="events"
      :selectable-dates="selectableDates"
      :unselectable-days-of-week="unselectableDaysOfWeek"
    >
      <b-loading :active="loading" :is-full-page="false" />
    </b-datepicker>
    <div class="column">
      {{ selectedDate.toISOString() | formatDate("MMMM d, yyyy") }}
      <ul>
        <li v-for="session of sessionTimes" :key="session.id">
          <b-button
            :disabled="!session.seatsAvailable"
            type="is-success"
            @click="selectSession(session)"
          >
            {{ session.startTimeLocal | formatDate("H:mm") }}
          </b-button>
          {{ session.seatsAvailable }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { parseISO, format, isSameDay } from 'date-fns'
import debounce from 'lodash/debounce'

export default {
    name: 'CheckoutSessionSelect',
    props: {
        productCode: {
            type: String,
            default: null
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
        sessionTimes() {
            return this.sessions.filter(session => isSameDay(parseISO(session.startTimeLocal), this.selectedDate))
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
            return this.selectableDates.length ? [] : [0,1,2,3,4,5,6]
        },
        events() {
            return this.selectableDates.map(date => ({
                date,
                type: 'is-success'
            })) 
        }
    },
    watch: {
        startTimeLocal(startTimeLocal) {
            this.getSessionsDebounced()
        },
        selectedDate(date) {
            const year = date.getFullYear()
            const month = date.getMonth()
            if(year !== this.year && month !== this.month) {
                this.year = year
                this.month = month
            }
        }
    },
    methods: {
        getSessionsDebounced: debounce(function() {
            this.getSessions()
        }, 200),
        async getSessions() {
            this.loading = true;
            const { sessions } = await this.$parent.$rezdy.getSessions({
                productCode: this.productCode,
                startTimeLocal: this.startTimeLocal,
                endTimeLocal: this.endTimeLocal,
                rspc: 1
            })
            this.sessions = sessions
            this.loading = false
            return sessions
        },
        selectSession(session) {
            this.$emit('update:session', session)
        }
    },
    mounted: async function(){
        this.getSessions()

        this.$refs.datepicker.$on('change-month', month => {
            this.month = month
        })
        this.$refs.datepicker.$on('change-year', year => {
            this.year = year
        })
    }
}
</script>