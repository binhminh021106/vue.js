<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const order = ref(null)
const route = useRoute()

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const orderdetail = async () => {
    try {
        const res = await axios.get(`${API_URL}/order/${route.params.id}`, ngrokHeaderConfig)
        order.value = res.data

        const reviewsRes = await axios.get(`${API_URL}/reviews?orderId=${order.value.id}`, ngrokHeaderConfig)
        const reviewedProducts = reviewsRes.data.map(r => r.productId)

        order.value.products.forEach((item) => {
            item.tempRating = 0
            item.tempComment = ''
            item.alreadyReviewed = reviewedProducts.includes(item.productId)
        })
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

const review = async (product) => {
    if (!product.tempRating) {
        Swal.fire('Oops!', 'Please select a rating before submitting.', 'warning')
        return
    }

    try {
        axios.post(`${API_URL}/reviews`, ngrokHeaderConfig, {
            orderId: order.value.id,
            productId: product.productId,
            username: order.value.fullname,
            rating: product.tempRating,
            comment: product.tempComment,
            date: new Date().toLocaleString(),
            status: "Pending",
            product: product.name,
            email: order.value.email
        })
        product.alreadyReviewed = true
        toast.success("Successful product review", {
            autoClose: 3000,
            position: "top-right",
        });
    } catch (err) {
        console.error("Err rating: ", err)
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
            <div class="mb-4 pb-4 border-bottom" v-for="items in order.products" :key="items.productId">
                <div class="d-flex align-items-center mb-3">
                    <img :src="items.image" :alt="items.name" width="70" height="70" class="rounded border me-3" />
                    <div class="flex-grow-1">
                        <p class="fw-semibold mb-1">{{ items.name }}</p>
                        <p class="text-muted mb-0">
                            x{{ items.quantity }} — {{ Number(items.discount).toLocaleString('vi-VN') }}₫
                        </p>
                    </div>
                    <p class="fw-bold text-danger mb-0">
                        {{ (items.discount * items.quantity).toLocaleString('vi-VN') }}₫
                    </p>
                </div>

                <div v-if="order.status === 'Delivered' && !items.alreadyReviewed"
                    class="rating-section mt-3 p-3 bg-light rounded-3">
                    <p class="fw-semibold mb-2">Rate this product</p>

                    <div class="stars mb-3">
                        <i v-for="n in 5" :key="n" class="fa-star fa me-2"
                            :class="n <= items.tempRating ? 'fa-solid text-warning' : 'fa-regular text-secondary'"
                            @click="items.tempRating = n"></i>
                    </div>

                    <textarea class="form-control rounded-3" placeholder="Write your review here..." rows="2"
                        v-model="items.tempComment"></textarea>

                    <div class="text-end mt-3">
                        <button class="btn btn-dark btn-sm px-3" @click="review(items)">
                            <i class="fa fa-paper-plane me-1"></i>Submit Review
                        </button>
                    </div>
                </div>
                <div v-else-if="items.alreadyReviewed" class="alert alert-success mt-3 py-2">
                    <i class="fa-solid fa-check-circle me-1"></i>
                    You have already reviewed this product.
                </div>

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
