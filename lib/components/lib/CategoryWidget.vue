<template>
    <div>
        <client-only>
            <iframe
                seamless=""
                width="100%"
                height="1000px"
                frameborder="0"
                class="rezdy"
                :src="iframeSrc"
                @load="ready = true"
            >
            </iframe>
        </client-only>
        <b-loading slot="placeholder" :active="!ready" />
    </div>
</template>
<script>
export default {
    name: 'RezdyCategoryWidget',
    props: {
        category: {
            type: [String, Number],
            default: null
        }
    },
    data() {
        return {
            ready: false
        }
    },
    computed: {
        iframeSrc() {
            return `https://${this._rezdyOptions.companyAlias}.rezdy.com/catalog/${this.category}/rentals?iframe=true`
        }
    },
    beforeDestroy() {
        // remove rezdy scripts
        rzdApp.shutdown()
        document.removeEventListener('load', iframeResizeHandler);
        document.querySelectorAll('[id^="rzd-"]').forEach(el => el.remove());
        rzdApp = null
    },
    head() {
        return {
            script: this.ready ? [
                {
                    hid: 'rezdy-plugin-js',
                    type: 'text/javascript',
                    src: `https://${this._rezdyOptions.companyAlias}.rezdy.com/pluginJs?script=modal`
                }
            ] : []
        }
    }
}
</script>