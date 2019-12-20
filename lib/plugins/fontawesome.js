import Vue from "vue";
import { library, config } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText
} from "@fortawesome/vue-fontawesome";
import {
  faShoppingCart,
  faLock,
  faCalendar,
  faUser,
  faPlus,
  faMapMarked,
  faMoneyBillWave,
  faCreditCard
} from "@fortawesome/free-solid-svg-icons";
import {
  faCcAmex,
  faCcDiscover,
  faCcJcb,
  faCcMastercard,
  faCcVisa
} from "@fortawesome/free-brands-svg-icons";

// This is important, we are going to let Nuxt.js worry about the CSS
config.autoAddCss = false;

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.
library.add(
  faCcAmex,
  faCcDiscover,
  faCcJcb,
  faCcMastercard,
  faCcVisa,
  faShoppingCart,
  faLock,
  faCalendar,
  faUser,
  faPlus,
  faMapMarked,
  faMoneyBillWave,
  faCreditCard
);

// Register the component globally
Vue.component("fa-icon", FontAwesomeIcon);
Vue.component("fa-layers", FontAwesomeLayers);
Vue.component("fa-layers-text", FontAwesomeLayersText);
