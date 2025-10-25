import { createStore } from "vuex";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("loggedInUser")) || null,

    product: null,
    categories: [],
    relatedProducts: [],
    loadingStatus: "idle",
    wishlist: [],
    cart: [],
  },

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => !!state.user,

    getProduct: (state) => state.product,
    getCategories: (state) => state.categories,
    getRelatedProducts: (state) => state.relatedProducts,
    isLoading: (state) => state.loadingStatus === "loading",
    getWishlist: (state) => state.wishlist,
    getCart: (state) => state.cart,
    getCartCount: (state) =>
      state.cart.reduce((sum, item) => sum + item.quantity, 0),
    isInWishlist: (state) => (productId) => {
      if (!state.wishlist || state.wishlist.length === 0) {
        return false;
      }
      return state.wishlist.some((item) => item.productId === productId);
    },
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("loggedInUser");
      }
    },

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
      localStorage.setItem("wishlist", JSON.stringify(items));
    },
    REMOVE_WISHLIST_ITEM(state, id) {
      state.wishlist = state.wishlist.filter((item) => item.id !== id);
    },
    SET_CART(state, cart) {
      state.cart = cart;
    },
  },

  actions: {
    login({ commit }, user) {
      commit("SET_USER", user);
    },
    logout({ commit }) {
      commit("SET_USER", null);
      commit("SET_CART", []);
      commit("SET_WISHLIST", []);
    },

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
        const res = await axios.get(`${API_URL}/products/${productId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const product = res.data || null;
        commit("SET_PRODUCT", product);

        if (product?.categoryId) {
          const relatedRes = await axios.get(
            `${API_URL}/products?categoryId=${product.categoryId}&id_ne=${product.id}&_limit=4`,
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
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
        const res = await axios.get(`${API_URL}/categories`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        commit("SET_CATEGORIES", res.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch categories:", error);
      }
    },

    async fetchCart({ commit, state }) {
      const user = state.user;
      if (!user) return commit("SET_CART", []);
      try {
        const res = await axios.get(`${API_URL}/cart?userId=${user.id}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        commit("SET_CART", res.data || []);
      } catch (err) {
        console.error(err);
        commit("SET_CART", []);
      }
    },

    async fetchWishlist({ commit, state }) {
      const user = state.user;
      if (!user) return commit("SET_WISHLIST", []);
      try {
        const res = await axios.get(`${API_URL}/wishlist?userId=${user.id}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        commit("SET_WISHLIST", res.data || []);
      } catch (err) {
        console.error("Lỗi khi fetch wishlist:", err);
        commit("SET_WISHLIST", []);
      }
    },

    async removeFromWishlist({ commit, state, dispatch }, productId) {
      if (!state.user) {
        throw new Error("User not logged in");
      }

      const wishlistItem = state.wishlist.find(
        (item) => item.productId === productId && item.userId === state.user.id
      );

      if (!wishlistItem) {
        console.warn("Item not in wishlist to remove.");
        return;
      }

      try {
        await axios.delete(`${API_URL}/wishlist/${wishlistItem.id}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        await dispatch("fetchWishlist");
      } catch (err) {
        console.error("Error removing from wishlist:", err);
        throw err;
      }
    },

    async addToCart({ state, dispatch }, { product, quantity }) {
      const user = state.user;
      if (!user) throw new Error("User not logged in");

      const existingItem = state.cart.find(
        (item) => item.productId === product.id
      );

      try {
        if (existingItem) {
          await axios.patch(
            `${API_URL}/cart/${existingItem.id}`,
            {
              quantity: existingItem.quantity + quantity,
            },
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
          );
        } else {
          const catObj = state.categories.find(
            (c) => String(c.id) === String(product.categoryId)
          );
          const categoryName =
            catObj?.nameCategory || catObj?.name || "Unknown";

          await axios.post(
            `${API_URL}/cart`,
            {
              userId: user.id,
              productId: product.id,
              name: product.name,
              category: categoryName,
              price: product.price,
              discount: product.discount,
              image: product.image?.[0] || "",
              quantity,
            },
            {
              headers: { "ngrok-skip-browser-warning": "true" },
            }
          );
        }
        await dispatch("fetchCart");
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    async addToWishlist({ state, dispatch }, product) {
      // Thêm 'dispatch'
      const user = state.user;
      if (!user) throw new Error("User not logged in");

      const { data: existingItems } = await axios.get(
        `${API_URL}/wishlist?userId=${user.id}&productId=${product.id}`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
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

      try {
        await axios.post(`${API_URL}/wishlist`, newWishlistItem, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        await dispatch("fetchWishlist");
      } catch (err) {
        console.error("Error adding to wishlist:", err);
        throw err;
      }
    },
  },
});
