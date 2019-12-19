<template>
    <b-field class="birthdate-input">
        <b-field label-position="inside" style="flex: 1 0 28%">
            <b-input
                ref="month"
                v-model="month"
                type="number"
                :placeholder="$t('month-placeholder')"
                size="2"
                maxlength="2"
                min="1"
                max="12"
                :validation-message="$t('valid-month')"
                :required="required"
            />
        </b-field>
        <b-field label-position="inside" style="flex: 1 0 28%">
            <b-input
                ref="day"
                v-model="day"
                type="number"
                :placeholder="$t('day-placeholder')"
                size="2"
                maxlength="2"
                min="1"
                max="31"
                :validation-message="$t('valid-day')"
                :required="required"
            />
        </b-field>
        <b-field label-position="inside" style="flex: 1 0 44%">
            <b-input
                ref="year"
                v-model="year"
                type="number"
                :placeholder="$t('year-placeholder')"
                size="4"
                maxlength="4"
                :min="yearMax - 120"
                :max="yearMax"
                :validation-message="$t('valid-year')"
                :required="required"
            />
        </b-field>
    </b-field>
</template>

<i18n src="./lang.json"></i18n>

<script>
export default {
    name: 'BirthdateInput',
    data() {
        return {
            yearMax: new Date().getFullYear(),
            month: null,
            day: null,
            year: null
        }
    },
    computed: {
        computedDate() {
            return new Date(this.year, this.month, this.day)
        }
    },
    props: {
        value: {
            type: Date,
            default: null
        },
        required: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        computedDate(date) {
            this.$emit('input', date);
        }
    }
}
</script>

<style scoped>
.birthdate-input {
    max-width: 400px;
}
.birthdate-input::v-deep .field {
    margin-bottom: 0;
}
.birthdate-input::v-deep .field .input {
    border-radius: 0;
    text-align: center;
}
.birthdate-input::v-deep .field:first-child .input:not(:focus):not(.is-danger) {
    border-right-color: transparent;
}
.birthdate-input::v-deep .field:last-child .input:not(:focus):not(.is-danger) {
    border-left-color: transparent;
}
.birthdate-input::v-deep .field .input.is-danger {
    z-index: 4;
}
</style>