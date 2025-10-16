import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    product: null,
    categories: [],
    relatedProducts: [],
    loadingStatus: "idle",
    wishlist: [],
    cart: [],
  },

  getters: {
    getProduct: (state) => state.product,
    getCategories: (state) => state.categories,
    getRelatedProducts: (state) => state.relatedProducts,
    isLoading: (state) => state.loadingStatus === "loading",
    getWishlist: (state) => state.wishlist,
    getCart: (state) => state.cart,
    getCartCount: (state) =>
      state.cart.reduce((sum, item) => sum + item.quantity, 0),
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
    SET_CART(state, cart) {
      state.cart = cart;
    },
  },

  actions: {
    async fetchProductData({ commit, dispatch }, productId) {
      commit("SET_LOADING_STATUS", "loading");
      commit("CLEAR_PRODUCT_DATA");
      try {
        await dispatch("fetchProductDetailAndRelated", productId);
        await dispatch("fetchCategories");
        commit("SET_LOADING_STATUS", "success");
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu sản phẩm:", error);
        commit("SET_LOADING_STATUS", "error");
      }
    },

    async fetchProductDetailAndRelated({ commit }, productId) {
      try {
        const res = await axios.get(
          `http://localhost:3000/products/${productId}`
        );
        const product = res.data || null;
        commit("SET_PRODUCT", product);

        if (product?.categoryId) {
          const relatedRes = await axios.get(
            `http://localhost:3000/products?categoryId=${product.categoryId}&id_ne=${product.id}&_limit=4`
          );
          commit("SET_RELATED_PRODUCTS", relatedRes.data || []);
        }
      } catch (error) {
        console.error(
          "Error fetching product detail or related products:",
          error
        );
        commit("SET_RELATED_PRODUCTS", []);
      }
    },

    async fetchCategories({ commit, state }) {
      if (state.categories.length > 0) return;
      try {
        const res = await axios.get("http://localhost:3000/categories");
        commit("SET_CATEGORIES", res.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
      }
    },

    async fetchCart({ commit }) {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) return commit("SET_CART", []);
      try {
        const res = await axios.get(
          `http://localhost:3000/cart?userId=${user.id}`
        );
        commit("SET_CART", res.data || []);
      } catch (err) {
        console.error(err);
        commit("SET_CART", []);
      }
    },

    async fetchWishlist({ commit }) {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) {
        return commit("SET_WISHLIST", []);
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/wishlist?userId=${user.id}`
        );
        commit("SET_WISHLIST", res.data || []);
      } catch (err) {
        console.error("Lỗi khi fetch wishlist:", err);
        commit("SET_WISHLIST", []);
      }
    },

    async addToCart({ state, dispatch }, { product, quantity }) {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) throw new Error("User not logged in");

      const existingItem = state.cart.find(
        (item) => item.productId === product.id
      );

      try {
        if (existingItem) {
          await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
            quantity: existingItem.quantity + quantity,
          });
        } else {
          const catObj = state.categories.find(
            (c) => String(c.id) === String(product.categoryId)
          );
          const categoryName =
            catObj?.nameCategory || catObj?.name || "Unknown";

          await axios.post("http://localhost:3000/cart", {
            userId: user.id,
            productId: product.id,
            name: product.name,
            category: categoryName,
            price: product.price,
            discount: product.discount,
            image: product.image?.[0] || "",
            quantity,
          });
        }
        await dispatch("fetchCart");
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    async addToWishlist({}, product) {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!user) throw new Error("User not logged in");

      const { data: existingItems } = await axios.get(
        `http://localhost:3000/wishlist?userId=${user.id}&productId=${product.id}`
      );
      if (existingItems?.length > 0)
        throw new Error("Product already in wishlist");

      const newWishlistItem = {
        userId: user.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.image?.[0] || "",
        addedAt: new Date().toISOString(),
      };
      return axios.post("http://localhost:3000/wishlist", newWishlistItem);
    },
  },

  modules: {},
});
