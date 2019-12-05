<template>
    <div class="section">
        <div class="container">
            <b-steps :has-navigation="false">
                <b-step-item label="Schedule" icon="calendar">
                    <div class="columns">
                        <b-datepicker
                            class="column"
                            ref="datepicker"
                            inline
                            indicators="bars"
                            v-model="selectedDate"
                            :events="events"
                            :selectable-dates="selectableDates"
                            :unselectable-days-of-week="unselectableDaysOfWeek"
                        >
                            <b-loading :active="loading" :is-full-page="false" />
                        </b-datepicker>
                        <div class="column">
                            {{ selectedDate.toISOString() | formatDate('MMMM d, yyyy')}}
                            <ul>
                                <li v-for="session of sessionTimes" :key="session.id">
                                    <b-button :disabled="!session.seatsAvailable" type="is-success">
                                        {{ session.startTimeLocal | formatDate('H:mm') }}
                                    </b-button>
                                    {{ session.seatsAvailable }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </b-step-item>
                <b-step-item label="Info" icon="user">
                    I'm the guest stuff
                </b-step-item>
                <b-step-item label="Checkout" icon="account-plus">
                    I'm whatever
                </b-step-item>
            </b-steps>
            <div>
                <b-button @click="$parent.close()">
                    {{ $parent.$t('cancel') }}
                </b-button>
            </div>
        </div>
    </div>
</template>
<script>
import { parseISO, format, isSameDay } from 'date-fns'
import debounce from 'lodash/debounce'

export default {
    name: 'ProductBookingFlow',
    props: {
        productCode: {
            type: String,
            default: null
        },
        app: {
            type: Object,
            default: () => null
        }
    },
    data() {
        return {
            sessions: [],
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            loading: false,
            selectedDate: new Date()
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
            this.getSessions()
        }
    },
    methods: {
        getSessions: debounce(async function() {
            this.loading = true;
            const { sessions } = await this.$parent.$rezdy.getSessions({
                productCode: this.productCode,
                startTimeLocal: this.startTimeLocal,
                endTimeLocal: this.endTimeLocal,
                rspc: 1
            })
            this.sessions = sessions
            this.loading = false
        }, 200)
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