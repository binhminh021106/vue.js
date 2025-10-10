<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const vieworder = ref([])
const user = ref(null)

const readview = async () => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
    if (!storedUser) return
    user.value = storedUser

    try {
        const res = await axios.get(`http://localhost:3000/order?userId=${storedUser.id}`)
        vieworder.value = res.data
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


onMounted(readview)
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold text-center mb-4">📦 My Orders</h2>

        <div v-if="vieworder.length > 0" class="order-list">
            <!-- Order card -->
            <div v-for="value in vieworder" :key="value.id" class="card border-0 shadow-sm rounded-4 mb-4 p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 class="fw-semibold mb-1">Order #ODR2025-{{ value.id }}</h5>
                        <small class="text-muted">Placed on {{ value.date }}</small>
                    </div>
                    <span :class="['badge px-3 py-2', getStatusClass(value.status)]">
                        {{ value.status || 'Processing' }}
                    </span>
                </div>

                <!-- Product list -->
                <div v-for="items in value.products" :key="items.productId"
                    class="d-flex align-items-center mb-3 border-bottom pb-2">
                    <img :src="items.image" :alt="items.name" width="60" height="60" class="rounded border me-3" />
                    <div class="flex-grow-1">
                        <p class="mb-1 fw-semibold">{{ items.name }}</p>
                        <small class="text-muted">x{{ items.quantity }} — {{
                            Number(items.discount).toLocaleString('vi-VN') }}₫</small>
                    </div>
                    <span class="fw-bold text-danger">{{ (items.discount * items.quantity).toLocaleString('vi-VN') }}
                        ₫</span>
                </div>

                <!-- Footer info -->
                <div class="d-flex justify-content-between mt-3">
                    <div>
                        <small class="text-muted">Payment:</small>
                        <p class="mb-0 fw-semibold">{{ value.payment }}</p>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">Total:</small>
                        <p class="mb-0 fw-bold text-danger">{{ Number(value.total).toLocaleString('vi-VN') }}₫</p>
                    </div>
                </div>

                <div class="text-end mt-3">
                    <router-link :to="`/orderdetail/${value.id}`" class="btn btn-outline-dark btn-sm">View
                        Details</router-link>
                </div>
            </div>
        </div>
        <div v-else class="text-center py-5">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png" alt="No orders" width="120"
                class="mb-3 opacity-75" />
            <h5 class="text-muted">You haven’t placed any orders yet</h5>
            <router-link to="/" class="btn btn-dark mt-3 px-4 py-2">
                <i class="fa fa-shopping-bag me-2"></i>Start Shopping
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.card {
    transition: 0.3s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.order-list {
    max-width: 800px;
    margin: auto;
}

.badge {
    font-size: 0.85rem;
    border-radius: 12px;
}

img {
    object-fit: cover;
}

.btn {
    border-radius: 10px;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}
</style>
