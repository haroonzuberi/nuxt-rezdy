<template>
    <div>
        <h2 class="title">{{$t('select')}} {{$t('date-and-time')}}</h2>
        <div class="columns">
            <div class="column has-items-centered">
                <b-datepicker
                    ref="datepicker"
                    inline
                    v-model="selectedDate"
                    :month-names="monthNames"
                    :events="events"
                    :selectable-dates="selectableDates"
                    :unselectable-days-of-week="unselectableDaysOfWeek"
                >
                    <b-loading :active="loading" :is-full-page="false" />
                </b-datepicker>
            </div>
            <div class="column has-items-centered">
                <div>
                    <p class="content has-text-centered subtitle is-5">
                        {{ $t('choose-time') }}:
                    </p>
                    <ul class="columns is-multiline">
                        <li v-for="session of sessionTimes" :key="session.id" class="column">
                            <b-button
                                :disabled="!session.seatsAvailable"
                                type="is-success"
                                size="is-large"
                                @click="selectSession(session)"
                            >
                                {{ session.startTimeLocal | formatDateLocale("p", $i18n.locale) }}
                            </b-button>
                            <!-- {{ session.seatsAvailable }} -->
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<i18n src="./lang.json"></i18n>

<script>
import { parseISO, format, isSameDay } from 'date-fns'
import locale from '../../mixins/locale'
import debounce from 'lodash/debounce'

export default {
    name: 'CheckoutSessionSelect',
    mixins: [locale],
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

<style scoped>
.has-items-centered {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>