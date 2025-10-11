// src/store/index.js

import { createStore } from 'vuex'

// Tạo một store mới
const store = createStore({
  // state là nơi chứa dữ liệu của bạn
  state () {
    return {
      message: 'Vuex hoạt động rồi nè! 🎉',
      count: 0
    }
  },
  // mutations là nơi duy nhất được phép thay đổi state
  mutations: {
    increment (state) {
      state.count++
    },
    // Bạn có thể tạo mutation nhận tham số
    setMessage (state, newMessage) {
        state.message = newMessage
    }
  }
})

export default store