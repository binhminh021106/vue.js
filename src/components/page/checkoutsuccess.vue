<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios' // 🟢 Thêm dòng này

const order = ref(null)

onMounted(async () => {
  try {
    const raw = localStorage.getItem('lastOrder')
    order.value = raw ? JSON.parse(raw) : null

    // 🟢 Gửi email xác nhận nếu có order và email khách
    if (order.value && order.value.user && order.value.user.email) {
      await sendConfirmationMail(order.value)
    }
  } catch {
    order.value = null
  }
})

const orderCode = computed(() => {
  if (!order.value) return '—'
  const id = order.value.id ?? order.value._id ?? '—'
  return `#ODR${new Date().getFullYear()}-${id}`
})

const sendConfirmationMail = async (order) => {
  try {
    const emailText = `
From: ${order.user.fullname}
To: ${order.user.email}

Message:
Xin chào ${order.user.fullname},

Cảm ơn bạn đã đặt hàng tại OutfitVN! 🎉

Đơn hàng ${orderCode.value} của bạn đã được xác nhận.
Tổng giá trị đơn hàng: ${Number(order.total).toLocaleString('vi-VN')} ₫
Phương thức thanh toán: ${order.payment}

Chúng tôi sẽ liên hệ để giao hàng sớm nhất có thể.

Trân trọng,
Đội ngũ OutfitVN.
    `

    await axios.post('http://localhost:3001/send-email', {
      to: order.user.email,
      subject: `Xác nhận đơn hàng ${orderCode.value}`,
      text: emailText
    })

    console.log('Email xác nhận đã được gửi!')
  } catch (err) {
    console.error('Lỗi khi gửi email xác nhận:', err)
  }
}
</script>

<template>
  <div class="container text-center py-5">
    <div v-if="order" class="success-card shadow-sm p-5 mx-auto mt-5">
      <div class="check-icon mb-4">
        <i class="fa-solid fa-circle-check text-success fa-4x"></i>
      </div>

      <h2 class="fw-bold mb-3">Order Placed Successfully 🎉</h2>
      <p class="text-muted mb-4">
        Thank you for shopping with <b>OutfitVN</b>! Your order is being processed.
        We'll send you the shipping details to your email soon.
      </p>

      <div class="order-summary text-start bg-light p-4 rounded-4 mx-auto mb-4">
        <h5 class="fw-semibold mb-3">Order Information</h5>

        <div class="d-flex justify-content-between mb-2">
          <span>Order ID:</span>
          <span><b>{{ orderCode }}</b></span>
        </div>

        <div class="d-flex justify-content-between mb-2">
          <span>Total Amount:</span>
          <span class="text-danger fw-bold">
            {{ Number(order.total).toLocaleString('vi-VN') }} ₫
          </span>
        </div>

        <div class="d-flex justify-content-between mb-2">
          <span>Payment Method:</span>
          <span>{{ order.payment }}</span>
        </div>

        <div class="d-flex justify-content-between">
          <span>Order Date:</span>
          <span>{{ order.date }}</span>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3">
        <router-link to="/" class="btn btn-dark px-4">
          <i class="fa fa-home me-2"></i>Back to Home
        </router-link>
        <router-link to="/vieworder" class="btn btn-outline-dark px-4">
          <i class="fa fa-box me-2"></i>View Orders
        </router-link>
      </div>
    </div>

    <div v-else class="mt-5">
      <h4>No order data found</h4>
      <router-link to="/" class="btn btn-dark mt-3">Back to Home</router-link>
    </div>
  </div>
</template>
