import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      cart: JSON.parse(localStorage.getItem("cart")) || [],
    };
  },
});

export default store;
