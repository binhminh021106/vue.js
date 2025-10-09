<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { computed } from 'vue'

const user = ref({
    id: null,
    fullname: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    password: ''
})

const cartCount = ref(0)
const cart = ref([])


const readUser = async () => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
    if (storedUser) {
        try {
            const res = await axios.get(`http://localhost:3000/user/${storedUser.id}`)
            user.value = res.data
        } catch (err) {
            console.error("Error reading user:", err)
        }
    }
}

const readCart = async () => {
    const stogedUser = JSON.parse(localStorage.getItem('loggedInUser'))

    if (!stogedUser) {
        cartCount.value = 0;
        return;
    }

    try {
        const res = await axios.get(`http://localhost:3000/cart?userId=${stogedUser.id}`)
        cart.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const total = computed(() => {
    return cart.value.reduce((sum, item) => {
        const price = item.discount || item.price
        return sum + price * item.quantity
    }, 0)
})

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
                                <input v-model="user.fullname" type="text" class="form-control"
                                    placeholder="Enter your full name" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Email Address</label>
                                <input v-model="user.email" type="email" class="form-control"
                                    placeholder="Enter your email" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Phone Number</label>
                                <input v-model="user.phone" type="text" class="form-control"
                                    placeholder="Enter your phone number" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">City</label>
                                <input type="text" class="form-control" placeholder="Enter your city" />
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Full Address</label>
                                <input v-model="user.address" type="text" class="form-control"
                                    placeholder="Street, district, apartment number..." />
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Order Notes</label>
                                <textarea class="form-control" rows="3"
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

                    <!-- Example product -->
                    <div v-for="value in cart" :key="value.id"
                        class="d-flex align-items-center mb-3 border-bottom pb-2">
                        <img :src="value.image" alt="Product" class="rounded border me-3" width="60" height="60"
                            style="object-fit: cover;" />
                        <div class="flex-grow-1">
                            <p class="mb-1 fw-semibold">{{ value.name }}</p>
                            <small class="text-muted">x{{ value.quantity }} —
                                {{ Number(value.discount).toLocaleString('vi-VN') }} ₫</small>
                        </div>
                        <span class="fw-bold text-danger">{{ (value.discount * value.quantity).toLocaleString('vi-VN')
                        }} ₫</span>
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

                    <button class="btn btn-dark w-100 py-2 fw-semibold">Place Order</button>
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

h2 {
    color: #111;
    letter-spacing: 0.5px;
}
</style>
