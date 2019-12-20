import Vue from 'vue'
import Buefy from 'buefy'

/* TODO: deal with potential of multiple buefy css files */

// import 'buefy/dist/buefy.css'

Vue.use(Buefy, {
    materialDesignIcons: false,
    defaultIconComponent: 'fa-icon',
    defaultIconPack: 'fas',
    customIconPacks: {
      fas: {
        sizes: {
          default: 'sm',
          'is-small': 'xs',
          'is-medium': 'lg',
          'is-large': '2x'
        },
        iconPrefix: ''
      }
    }
})