import Vuex from 'vuex';
import Vue from 'vue';
import devices from './modules/devices';

// Load Vuex
Vue.use(Vuex);

// Export Vuex Store 
export default new Vuex.Store({
    modules: {
        devices,
    }
})