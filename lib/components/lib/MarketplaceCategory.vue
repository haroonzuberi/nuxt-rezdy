<template>
    <span>
        {{ $t(category)}}
    </span>
</template>

<i18n src="./lang.json" ></i18n>

<script>
export default {
    name: 'MarketplaceCategory',
    props: {
        category: {
            type: String,
            default: ''
        }
    }
}
</script>