<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

const user = ref({
  id: null,
  fullname: '',
  email: '',
  phone: '',
  address: '',
  role: '',
  password: ''
})

const formOrder = ref({
  city: '',
  orderNote: ''
})

const selectPayment = ref('')
const cart = ref([])

const readUser = async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (storedUser) {
    try {
      const res = await axios.get(`http://localhost:3000/user/${storedUser.id}`)
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
    const res = await axios.get(`http://localhost:3000/cart?userId=${storedUser.id}`)
    cart.value = res.data
  } catch (err) {
    console.error('Err: ', err)
  }
}

const total = computed(() => {
  return cart.value.reduce((sum, item) => {
    const price = item.discount || item.price
    return sum + price * item.quantity
  }, 0)
})

const placeOrder = async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (!storedUser) {
    Swal.fire({
      icon: 'warning',
      title: 'Please log in',
      text: 'You must be logged in to place an order!',
      confirmButtonColor: '#000'
    })
    router.push('/login')
    return
  }

  if (!user.value.fullname || !user.value.email || !user.value.phone || !user.value.address || !formOrder.value.city) {
    Swal.fire({
      icon: 'warning',
      title: 'Please enter complete information',
      text: 'You must enter complete information to place your order!',
      confirmButtonColor: '#000'
    })
    return
  }

  if (!selectPayment.value) {
    Swal.fire({
      icon: 'info',
      title: 'Select Payment Method',
      text: 'Please choose a payment method before continuing.',
      confirmButtonColor: '#000'
    })
    return
  }

  try {
    const orderData = {
      userId: storedUser.id,
      fullname: user.value.fullname,
      email: user.value.email,
      phone: user.value.phone,
      cityProvince: formOrder.value.city,
      fulladdress: user.value.address,
      orderNote: formOrder.value.orderNote,
      payment: selectPayment.value,
      total: total.value,
      status: "Pending",
      date: new Date().toLocaleString('vi-VN'),
      products: cart.value
    }

    const res = await axios.post('http://localhost:3000/order', orderData)
    localStorage.setItem("lastOrder", JSON.stringify(res.data))

    await Promise.all(
      cart.value.map(item => axios.delete(`http://localhost:3000/cart/${item.id}`))
    )

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
              <small class="text-muted">x{{ value.quantity }} — {{ Number(value.discount).toLocaleString('vi-VN') }}
                ₫</small>
            </div>
            <span class="fw-bold text-danger">{{ (value.discount * value.quantity).toLocaleString('vi-VN') }} ₫</span>
          </div>

          <hr />

          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>{{ total.toLocaleString('vi-VN') }} ₫</span>
          </div>

          <div class="d-flex justify-content-between mb-2">
            <span>Shipping Fee</span>
            <span class="text-success">Free</span>
          </div>

          <hr />

          <div class="d-flex justify-content-between fw-bold mb-3">
            <span>Total</span>
            <span class="text-danger fs-5">{{ total.toLocaleString('vi-VN') }} ₫</span>
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

              <label class="payment-option p-3 mb-2 rounded-3 border d-flex align-items-center gap-3">
                <input v-model="selectPayment" type="radio" value="Bank Transfer" class="form-check-input" />
                <i class="fa-solid fa-building-columns text-success fs-5"></i>
                <span>Bank Transfer</span>
              </label>

              <label class="payment-option p-3 rounded-3 border d-flex align-items-center gap-3">
                <input v-model="selectPayment" type="radio" value="Credit / Debit Card" class="form-check-input" />
                <i class="fa-brands fa-cc-visa text-info fs-5"></i>
                <span>Credit / Debit Card</span>
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
