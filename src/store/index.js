import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    product: null,
    categories: [],
    relatedProducts: [],
    loadingStatus: "idle",
    wishlist: [],
    cartCount: 0,
  },

  getters: {
    getProduct: (state) => state.product,
    getCategories: (state) => state.categories,
    getRelatedProducts: (state) => state.relatedProducts,
    isLoading: (state) => state.loadingStatus === "loading",
    getWishlist: (state) => state.wishlist,
    getCartCount: (state) => state.cartCount, 
  },

  mutations: {
    SET_LOADING_STATUS(state, status) {
      state.loadingStatus = status;
    },
    SET_PRODUCT(state, product) {
      state.product = product;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_RELATED_PRODUCTS(state, products) {
      state.relatedProducts = products;
    },
    CLEAR_PRODUCT_DATA(state) {
      state.product = null;
      state.relatedProducts = [];
    },
    SET_WISHLIST(state, items) {
      state.wishlist = items;
    },
    REMOVE_WISHLIST_ITEM(state, id) {
      state.wishlist = state.wishlist.filter((item) => item.id !== id);
    },
    SET_CART_COUNT(state, count) { 
      state.cartCount = count;
    },
  },

  actions: {
    async fetchCartCount({ commit }) {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) return commit("SET_CART_COUNT", 0);

      try {
        const res = await axios.get(`http://localhost:3000/cart?userId=${user.id}`);
        commit("SET_CART_COUNT", res.data.length);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    },

    async addToCart({ state, dispatch }, { product, quantity }) {
      try {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) throw new Error("User not logged in");

        const { data: cart } = await axios.get(
          `http://localhost:3000/cart?userId=${user.id}`
        );
        const existingItem = cart.find((item) => item.productId === product.id);

        if (existingItem) {
          await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
            quantity: existingItem.quantity + quantity,
          });
        } else {
          const catObj = state.categories.find(
            (c) => String(c.id) === String(product.categoryId)
          );
          const categoryName = catObj?.nameCategory || catObj?.name || "Unknown";

          await axios.post("http://localhost:3000/cart", {
            userId: user.id,
            productId: product.id,
            name: product.name,
            category: categoryName,
            price: product.price,
            discount: product.discount,
            image: product.image?.[0] || "",
            quantity: quantity,
          });
        }

        dispatch("fetchCartCount");
      } catch (error) {
        console.error("Error in addToCart:", error);
        throw error;
      }
    },
  },

  modules: {},
});
