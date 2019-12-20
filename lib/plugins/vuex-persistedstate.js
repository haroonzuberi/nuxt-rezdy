import createPersistedState from "vuex-persistedstate";

// get the options out using lodash templates
const options = JSON.parse(`<%= JSON.stringify(options) %>`);
// extract the namespace var
const { namespace } = options;

export default ({ store }) => {
    if(process.client) {
        window.onNuxtReady(() => {
            createPersistedState({
            key: namespace,
            paths: [`${namespace}.booking`]
            })(store);
        });
    }
};
