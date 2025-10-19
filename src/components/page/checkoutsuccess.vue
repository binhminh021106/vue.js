<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const order = ref(null)

onMounted(async () => {
  try {
    const raw = localStorage.getItem('lastOrder')
    order.value = raw ? JSON.parse(raw) : null

    const email = order.value?.user?.email || order.value?.email
    const fullname = order.value?.user?.fullname || order.value?.fullname

    if (email) {
      console.log("Đang gửi mail tới:", email)
      await sendConfirmationMail(order.value)

      localStorage.setItem('emailSent', 'true')
    } else {
      console.warn("Không tìm thấy email")
    }
  } catch (err) {
    console.error("Lỗi trong onMounted:", err)
  }
})




const orderCode = computed(() => {
  if (!order.value) return '—'
  const id = order.value.id ?? order.value._id ?? '—'
  return `#ODR${new Date().getFullYear()}-${id}`
})

const sendConfirmationMail = async (order) => {
  try {
    const email = order.user?.email || order.email
    const fullname = order.user?.fullname || order.fullname

    if (!email) {
      console.warn("Không có email trong order, bỏ qua gửi mail.")
      return
    }

    const emailText = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); overflow: hidden;">
  <div style="background: #000; padding: 20px 30px; color: #fff;">
    <h2 style="margin: 0; font-size: 22px;">🛍️ OutfitVN</h2>
  </div>

  <div style="padding: 30px;">
    <h3 style="color: #333;">Xin chào ${fullname},</h3>
    <p style="font-size: 15px; color: #555;">
      Cảm ơn bạn đã đặt hàng tại <b>OutfitVN</b>! 🎉<br>
      Đơn hàng <b>${order.id}</b> của bạn đã được xác nhận thành công.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <td style="padding: 8px; color: #555;">Mã đơn hàng: #ODR2025-</td>
        <td style="padding: 8px; font-weight: bold;">#ODR${new Date().getFullYear()}-${order.id}</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px; color: #555;">Tổng giá trị:</td>
        <td style="padding: 8px; color: #e63946; font-weight: bold;">${Number(order.total).toLocaleString('vi-VN')} ₫</td>
      </tr>
      <tr>
        <td style="padding: 8px; color: #555;">Phương thức thanh toán:</td>
        <td style="padding: 8px;">${order.payment}</td>
      </tr>
      <tr style="background: #f8f9fa;">
        <td style="padding: 8px; color: #555;">Ngày đặt:</td>
        <td style="padding: 8px;">${order.date}</td>
      </tr>
    </table>

    <p style="margin-top: 25px; color: #444;">
      Chúng tôi sẽ liên hệ để giao hàng sớm nhất có thể.<br>
      Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua:
      <a href="mailto:outfitvn@gmail.com" style="color:#000; text-decoration:none; font-weight:600;">outfitvn@gmail.com</a>.
    </p>

    <div style="text-align:center; margin-top: 30px;">
      <a href="http://localhost:5173/vieworder" style="background: #000; color:#fff; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:500;">
        Xem chi tiết đơn hàng
      </a>
    </div>
  </div>

  <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #888;">
    OutfitVN © ${new Date().getFullYear()} — All rights reserved.
  </div>
</div>
`

    await axios.post('http://localhost:3001/send-email', {
      to: email,
      subject: `Xác nhận đơn hàng ${order.id}`,
      html: emailText,
    })

    await axios.post('http://localhost:3001/send-email', {
      to: "minhdzwama211@gmail.com", 
      subject: `Đơn hàng mới từ ${fullname} - #${order.id}`,
      html: `
        <h3>📦 Có đơn hàng mới!</h3>
        <p><b>Khách hàng:</b> ${fullname} (${email})</p>
        <p><b>Tổng tiền:</b> ${Number(order.total).toLocaleString('vi-VN')} ₫</p>
        <p><b>Phương thức thanh toán:</b> ${order.payment}</p>
        <p><b>Ngày đặt:</b> ${order.date}</p>
        <p><b>Mã đơn hàng:</b> #ODR${new Date().getFullYear()}-${order.id}</p>
      `,
    })

    console.log('Email gửi cho khách và admin thành công!')
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
