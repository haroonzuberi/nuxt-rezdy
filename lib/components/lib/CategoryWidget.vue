<template>
    <div>
        <client-only>
            <iframe
                seamless=""
                width="100%"
                height="1000px"
                frameborder="0"
                class="rezdy"
                :src="iframeSrc">
            </iframe>
            <!-- <b-loading slot="placeholder" active /> -->
        </client-only>
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
    mounted() {
        this.ready = true
    },
    computed: {
        iframeSrc() {
            return `https://${this._rezdyOptions.companyAlias}.rezdy.com/catalog/${this.category}/rentals?iframe=true`
        }
    },
    beforeDestroy() {
        // remove rezdy scripts
        console.log(rzdApp.shutdown());

        document.removeEventListener('load', iframeResizeHandler);
        document.querySelectorAll('[id^="rzd-"]').forEach(el => {
            el.remove()
            /* const clone = el.cloneNode(true)
            el.parentNode.replaceChild(clone, el)
            clone.remove() */
        });

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