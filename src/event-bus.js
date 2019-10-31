import Vue from 'vue';
// lightweight state sync between components.
// over-usage indicates that a more sophisticated state machine is needed.
export const EventBus = new Vue();
