<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const order = ref(null)
const route = useRoute()

const orderdetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/order/${route.params.id}`)
        order.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const getStatusClass = (status) => {
    switch (status) {
        case 'Delivered':
            return 'bg-success text-white'
        case 'Pending':
            return 'bg-warning text-dark'
        case 'Cancelled':
            return 'bg-danger text-white'
        case 'Processing':
            return 'bg-info text-dark'
        default:
            return 'bg-secondary text-white'
    }
}

onMounted(orderdetail)
</script>

<template>
    <div v-if="order" class="container my-5">
        <h2 class="fw-bold text-center mb-4">🧾 Order Details</h2>

        <!-- Order Header -->
        <div class="card shadow-sm border-0 rounded-4 p-4 mb-4 order-header">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <h5 class="fw-semibold mb-1">Order #ODR2025-{{ order.id }}</h5>
                    <p class="text-muted mb-0">{{ order.date }}</p>
                </div>
                <span :class="['badge px-3 py-2', getStatusClass(order.status)]">
                    {{ order.status || 'Processing' }}
                </span>
            </div>
        </div>

        <!-- Shipping Info -->
        <div class="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 class="fw-semibold mb-3">📍 Shipping Information</h5>
            <div class="row g-3">
                <div class="col-md-6">
                    <p class="mb-1 text-muted">Full Name</p>
                    <p class="fw-semibold">{{ order.fullname }}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted">Phone</p>
                    <p class="fw-semibold">{{ order.phone }}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted">Email</p>
                    <p class="fw-semibold">{{ order.email }}</p>
                </div>
                <div class="col-md-6">
                    <p class="mb-1 text-muted">Address</p>
                    <p class="fw-semibold">{{ order.fulladdress }}</p>
                </div>
            </div>
        </div>

        <!-- Product List -->
        <div class="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 class="fw-semibold mb-3">🛍️ Ordered Products</h5>

            <!-- Product -->
            <div class="d-flex align-items-center mb-3 pb-3 border-bottom" v-for="items in order.products"
                :key="items.productId">
                <img :src="items.image" :alt="items.name" width="70" height="70" class="rounded border me-3" />
                <div class="flex-grow-1">
                    <p class="fw-semibold mb-1">{{ items.name }}</p>
                    <p class="text-muted mb-0">x{{ items.quantity }} — {{ Number(items.discount).toLocaleString('vi-VN') }}₫</p>
                </div>
                <p class="fw-bold text-danger mb-0">{{ (items.discount * items.quantity).toLocaleString('vi-VN') }}₫</p>
            </div>
        </div>

        <!-- Payment Summary -->
        <div class="card shadow-sm border-0 rounded-4 p-4">
            <h5 class="fw-semibold mb-3">💳 Payment Summary</h5>

            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{{ Number(order.total).toLocaleString('vi-VN') }}₫</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
                <span>Shipping Fee</span>
                <span class="text-success">Free</span>
            </div>

            <hr />

            <div class="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span class="text-danger">{{ Number(order.total).toLocaleString('vi-VN') }}₫</span>
            </div>

            <div class="mt-3">
                <p class="mb-1 text-muted">Payment Method</p>
                <p class="fw-semibold">{{ order.payment }}</p>
            </div>

            <div class="mt-4 text-end">
                <router-link to="/vieworder" class="btn btn-outline-dark px-4">
                    <i class="fa fa-arrow-left me-2"></i>Back to Orders
                </router-link>
            </div>
        </div>
    </div>
    <div v-else class="text-center mt-5">
        <div class="spinner-border text-dark" role="status"></div>
        <p class="text-muted mt-3">Loading order details...</p>
    </div>
</template>

<style scoped>
.card {
    transition: 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.badge {
    font-size: 0.9rem;
    border-radius: 12px;
}

img {
    object-fit: cover;
}

.btn {
    border-radius: 10px;
    transition: 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}
</style>
