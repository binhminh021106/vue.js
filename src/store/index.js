// src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    product: null,
    categories: [],
    relatedProducts: [],
    loadingStatus: 'idle',
  },

  getters: {
    getProduct: (state) => state.product,
    getCategories: (state) => state.categories,
    getRelatedProducts: (state) => state.relatedProducts,
    isLoading: (state) => state.loadingStatus === 'loading',
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
  },

  actions: {
    async fetchProductData({ commit, dispatch }, productId) {
      commit('SET_LOADING_STATUS', 'loading');
      commit('CLEAR_PRODUCT_DATA');
      try {
        await dispatch('fetchProductDetailAndRelated', productId);
        await dispatch('fetchCategories');
        commit('SET_LOADING_STATUS', 'success');
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu sản phẩm:', error);
        commit('SET_LOADING_STATUS', 'error');
      }
    },

    async fetchProductDetailAndRelated({ commit }, productId) {
      try {
        const res = await axios.get(`http://localhost:3000/products/${productId}`);
        const product = res.data || null;
        commit('SET_PRODUCT', product);

        if (product?.categoryId) {
          const relatedRes = await axios.get(
            `http://localhost:3000/products?categoryId=${product.categoryId}&id_ne=${product.id}&_limit=4`
          );
          commit('SET_RELATED_PRODUCTS', relatedRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching product detail or related products:', error);
        commit('SET_RELATED_PRODUCTS', []);
      }
    },

    async fetchCategories({ commit, state }) {
      if (state.categories.length > 0) return;
      try {
        const res = await axios.get('http://localhost:3000/categories');
        commit('SET_CATEGORIES', res.data || []);
      } catch (error) {
        console.error('Lỗi khi fetch categories:', error);
      }
    },

    async addToCart({ state }, { product, quantity }) {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) throw new Error('User not logged in');

        const { data: cart } = await axios.get(`http://localhost:3000/cart?userId=${user.id}`);
        const existingItem = cart.find((item) => item.productId === product.id);

        if (existingItem) {
          return axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
            quantity: existingItem.quantity + quantity,
          });
        } else {
          const catObj = state.categories.find((c) => String(c.id) === String(product.categoryId));
          const categoryName = catObj?.nameCategory || catObj?.name || 'Unknown';

          return axios.post('http://localhost:3000/cart', {
            userId: user.id,
            productId: product.id,
            name: product.name,
            category: categoryName,
            price: product.price,
            discount: product.discount,
            image: product.image?.[0] || '',
            quantity: quantity,
          });
        }
      } catch (error) {
        console.error('Error in addToCart:', error);
        throw error; 
      }
    },

    async addToWishlist({ }, product) {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) throw new Error('User not logged in');

        const { data: existingItems } = await axios.get(
          `http://localhost:3000/wishlist?userId=${user.id}&productId=${product.id}`
        );
        if (existingItems?.length > 0) throw new Error('Product already in wishlist');

        const newWishlistItem = {
          userId: user.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          discount: product.discount,
          image: product.image?.[0] || '',
          addedAt: new Date().toISOString(),
        };

        return axios.post('http://localhost:3000/wishlist', newWishlistItem);
      } catch (error) {
        console.error('Error in addToWishlist:', error);
        throw error;
      }
    },
  },

  modules: {},
});
