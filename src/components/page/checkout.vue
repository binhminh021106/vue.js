<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_BASE_URL;

const cart = ref([])
const user = ref({})
const formOrder = ref({
  city: '',
  orderNote: ''
})
const selectPayment = ref('')

const coupons = ref([])
const discountCode = ref('')
const discountAmount = ref(0)
const discountMessage = ref('')

const readUser = async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (storedUser) {
    try {
      const res = await axios.get(`${API_URL}/user/${storedUser.id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      user.value = res.data
    } catch (err) {
      console.error('Error reading user:', err)
    }
  }
}

const readCart = async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (!storedUser) return
  try {
    const res = await axios.get(`${API_URL}/cart?userId=${storedUser.id}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    cart.value = res.data
  } catch (err) {
    console.error('Error reading cart:', err)
  }
}

const readCoupon = async () => {
  try {
    const res = await axios.get(`${API_URL}/coupon`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    coupons.value = res.data
  } catch (err) {
    console.error('Error reading coupons:', err)
  }
}

const Subtotal = computed(() => {
  return cart.value.reduce((acc, item) => acc + (item.discount || item.price) * item.quantity, 0)
})

const total = computed(() => {
  return Subtotal.value - discountAmount.value
})

const shippingFee = computed(() => {
  return Subtotal.value >= 500000 ? 0 : 30000
})

const fullTotal = computed(() => {
  return total.value + shippingFee.value
})

const applyDiscount = () => {
  const code = discountCode.value.trim().toUpperCase()
  const found = coupons.value.find(c => c.code.toUpperCase() === code)

  if (!found) {
    discountMessage.value = 'Invalid discount code!'
    discountAmount.value = 0
    return
  }

  const now = new Date()
  const expiry = new Date(found.expiry)
  if (now > expiry) {
    discountMessage.value = 'This coupon has expired!'
    discountAmount.value = 0
    return
  }

  if (Subtotal.value < found.condition) {
    discountMessage.value = `Minimum order value: ${Number(found.condition).toLocaleString('vi-VN')} ₫`
    discountAmount.value = 0
    return
  }

  if (found.icon === 'giam%') {
    const percent = parseFloat(found.discount)
    discountAmount.value = (Subtotal.value * percent) / 100
  } else if (found.icon === 'giamthang') {
    const flat = parseFloat(found.discount.replace(/[^\d]/g, '')) * 1000
    discountAmount.value = flat
  } else if (found.icon === 'giamdacbiet') {
    const flat = parseFloat(found.discount.replace(/[^\d]/g, '')) * 1000
    discountAmount.value = flat
  } else {
    discountAmount.value = 0
  }

  discountMessage.value = `Coupon ${found.code} applied successfully!`
}

const placeOrder = async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (!storedUser) {
    Swal.fire({
      icon: 'warning',
      title: 'Please log in!',
      text: 'You need to log in before placing an order!',
      confirmButtonColor: '#000'
    })
    router.push('/login')
    return
  }

  if (!user.value.fullname || !user.value.email || !user.value.phone || !user.value.address || !formOrder.value.city) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing information!',
      text: 'Please fill in all required shipping details!',
      confirmButtonColor: '#000'
    })
    return
  }

  if (!selectPayment.value) {
    Swal.fire({
      icon: 'info',
      title: 'Select a payment method!',
      text: 'Please choose your payment method before proceeding.',
      confirmButtonColor: '#000'
    })
    return
  }

  const orderId = "DH" + Date.now();
  const orderData = {
    id: orderId,
    userId: storedUser.id,
    fullname: user.value.fullname,
    email: user.value.email,
    phone: user.value.phone,
    cityProvince: formOrder.value.city,
    fulladdress: user.value.address,
    orderNote: formOrder.value.orderNote,
    payment: selectPayment.value,
    total: fullTotal.value,
    discount: discountAmount.value,
    status: "Pending",
    date: new Date().toLocaleString('en-US'),
    products: cart.value
  }

  if (selectPayment.value === "VNPAY") {
    // Sửa trạng thái thành "Đang chờ thanh toán VNPAY"
    orderData.status = "Pending Payment";

    try {
      // 2.1. LƯU ĐƠN HÀNG VÀO DB.JSON TRƯỚC
      await axios.post(`${API_URL}/order`, orderData, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      // Lưu đơn hàng cuối cùng vào localStorage để trang return dùng
      localStorage.setItem("lastOrder", JSON.stringify(orderData));


      // 2.2. GỌI SERVER (CỔNG 3002) ĐỂ TẠO LINK
      const response = await axios.post("http://localhost:3002/create_payment_url", {
        orderId: orderId, // Dùng orderId đã tạo
        amount: Math.round(fullTotal.value),
        orderDescription: `Thanh toán đơn hàng #${orderId}`,
      });

      // 2.3. CHUYỂN HƯỚNG ĐI THANH TOÁN
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Không nhận được URL từ server");
      }
      return; // Dừng hàm sau khi chuyển hướng

    } catch (error) {
      console.error("VNPay error:", error);
      Swal.fire({
        icon: 'error',
        title: 'VNPay Error',
        text: 'Không thể tạo liên kết thanh toán VNPay!',
        confirmButtonColor: '#000'
      });
      return;
    }
  }

  try {
    const res = await axios.post(`${API_URL}/order`, orderData, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    localStorage.setItem("lastOrder", JSON.stringify(res.data))

    for (let item of cart.value) {
      try {
        const productId = item.productId || item.id

        const productRes = await axios.get(`${API_URL}/products/${productId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        const product = productRes.data

        if (product.quantity !== undefined) {
          if (product.quantity < item.quantity) {
            await Swal.fire({
              icon: 'error',
              title: 'Out of stock!',
              text: `${product.name} only has ${product.quantity} left.`,
              confirmButtonColor: '#000'
            })
            continue
          }

          const newQuantity = Math.max(product.quantity - item.quantity, 0)
          await axios.patch(`${API_URL}/products/${productId}`, { quantity: newQuantity }, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })
        } else {
          console.warn(`Product ${product.name} has no 'quantity' field`)
        }

      } catch (err) {
        console.error(`Error updating stock for ${item.id}:`, err)
      }
    }

    await Promise.all(
      cart.value.map(item => axios.delete(`${API_URL}/cart/${item.id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      }))
    )

    Swal.fire({
      icon: 'success',
      title: 'Order placed successfully!',
      text: 'Your products have been ordered successfully!',
      confirmButtonColor: '#000',
      timer: 1500,
      showConfirmButton: false
    })

    router.push('/checkoutsuccess')
  } catch (err) {
    console.error('Error placing order:', err)
    Swal.fire({
      icon: 'error',
      title: 'Order failed!',
      text: 'An error occurred while placing your order.',
      confirmButtonColor: '#000'
    })
  }
}

onMounted(() => {
  readUser()
  readCart()
  readCoupon()
})
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold text-center mb-4">🛒 Checkout</h2>

    <div class="row g-4">
      <!-- Shipping Information -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-semibold mb-3">Shipping Information</h5>

          <form>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Full Name</label>
                <input v-model="user.fullname" type="text" class="form-control" placeholder="Enter your full name" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email Address</label>
                <input v-model="user.email" type="email" class="form-control" placeholder="Enter your email" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone Number</label>
                <input v-model="user.phone" type="text" class="form-control" placeholder="Enter your phone number" />
              </div>
              <div class="col-md-6">
                <label class="form-label">City/Province</label>
                <input v-model="formOrder.city" type="text" class="form-control" placeholder="Enter your city" />
              </div>
              <div class="col-md-12">
                <label class="form-label">Full Address</label>
                <input v-model="user.address" type="text" class="form-control"
                  placeholder="Street, district, apartment number..." />
              </div>
              <div class="col-md-12">
                <label class="form-label">Order Notes</label>
                <textarea v-model="formOrder.orderNote" class="form-control" rows="3"
                  placeholder="Notes for delivery (optional)"></textarea>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-semibold mb-3">Order Summary</h5>

          <div v-for="value in cart" :key="value.id" class="d-flex align-items-center mb-3 border-bottom pb-2">
            <img :src="value.image" alt="Product" class="rounded border me-3" width="60" height="60"
              style="object-fit: cover;" />
            <div class="flex-grow-1">
              <p class="mb-1 fw-semibold">{{ value.name }}</p>
              <small class="text-muted">x{{ value.quantity }} — {{ Number(value.discount).toLocaleString('en-US') }}
                ₫</small>
            </div>
            <span class="fw-bold text-danger">{{ (value.discount * value.quantity).toLocaleString('en-US') }} ₫</span>
          </div>

          <hr />

          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>{{ Subtotal.toLocaleString('vi-VN') }} ₫</span>
          </div>

          <div class="d-flex justify-content-between mb-2">
            <span>Shipping Fee</span>
            <span :class="{ 'text-success': shippingFee === 0 }">{{ shippingFee === 0 ? 'Free' :
              shippingFee.toLocaleString('vi-VN') + ' ₫' }}</span>
          </div>

          <div class="d-flex justify-content-between mb-2">
            <span>Discount</span>
            <span>-{{ discountAmount.toLocaleString('vi-VN') }} ₫</span>
          </div>

          <hr>

          <div class="input-group">
            <input v-model="discountCode" type="text" class="form-control" placeholder="Enter your discount code" />
            <button class="btn btn-outline-dark" @click="applyDiscount">Apply</button>
          </div>
          <small v-if="discountMessage" class="text-success">{{ discountMessage }}</small>

          <hr />

          <div class="d-flex justify-content-between fw-bold mb-3">
            <span>Total</span>
            <span class="text-danger fs-5">{{ fullTotal.toLocaleString('vi-VN') }} ₫</span>
          </div>

          <!-- Payment Methods -->
          <div class="mt-4">
            <h6 class="fw-semibold mb-3">Select Payment Method 💳</h6>
            <div class="payment-options">
              <label class="payment-option p-3 mb-2 rounded-3 border d-flex align-items-center gap-3">
                <input v-model="selectPayment" type="radio" value="Cash on Delivery (COD)" class="form-check-input" />
                <i class="fa-solid fa-truck-fast text-primary fs-5"></i>
                <span>Cash on Delivery (COD)</span>
              </label>

              <label class="payment-option p-3 mb-2 rounded-3 border d-flex align-items-center gap-3">
                <input v-model="selectPayment" type="radio" value="MoMo E-Wallet" class="form-check-input" />
                <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" width="30" />
                <span>MoMo E-Wallet</span>
              </label>

              <label class="payment-option p-3 rounded-3 border d-flex align-items-center gap-3">
                <input v-model="selectPayment" type="radio" value="VNPAY" class="form-check-input" />
                <img src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg"
                  width="40" />
                <span>VNPAY</span>
              </label>
            </div>
          </div>

          <button @click="placeOrder" class="btn btn-dark w-100 py-2 fw-semibold mt-4">Place Order</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 15px;
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

textarea {
  resize: none;
}

.payment-option {
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  background-color: #f8f9fa;
  border-color: #000;
}

.payment-option input {
  transform: scale(1.2);
}

h2 {
  color: #111;
  letter-spacing: 0.5px;
}
</style>
