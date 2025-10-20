<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex'
import Swal from 'sweetalert2';

const vieworder = ref([])
const user = ref(null)
const store = useStore()

const readview = async () => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
    if (!storedUser) return
    user.value = storedUser

    try {
        const res = await axios.get(`http://localhost:3000/order?userId=${storedUser.id}`)
        vieworder.value = res.data.sort((a, b) => {
            const dateA = new Date(a.date.split(' ')[1].split('/').reverse().join('-') + ' ' + a.date.split(' ')[0])
            const dateB = new Date(b.date.split(' ')[1].split('/').reverse().join('-') + ' ' + b.date.split(' ')[0])
            return dateB - dateA
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

const Canceled = async (orderId) => {
    try {
        const result = await Swal.fire({
            icon: "question",
            title: "Cancel Order?",
            text: "Are you sure you want to cancel this order?",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel it",
            cancelButtonText: "No, keep it",
            confirmButtonColor: "#000",
        });

        if (!result.isConfirmed) return;

        await axios.patch(`http://localhost:3000/order/${orderId}`, { status: "Canceled" });

        const order = (vieworder?.value ?? vieworder)?.find(o => o.id === orderId);
        if (order) order.status = "Canceled";

        await Swal.fire({
            icon: "success",
            title: "Order canceled",
            text: "The order has been successfully canceled.",
            timer: 1500,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("Error:", err);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to cancel the order. Please try again later.",
        });
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

const buyBack = async (products) => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
        if (!storedUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Please log in',
                text: 'You must be logged in to buy back products.',
                confirmButtonColor: '#000'
            })
            return
        }

        if (store.state.categories.length === 0) {
            await store.dispatch('fetchCategories')
        }

        for (let item of products) {
            const res = await axios.get(`http://localhost:3000/products/${item.productId}`)
            const fullProduct = res.data

            const catObj = store.state.categories.find(
                c => String(c.id) === String(fullProduct.categoryId)
            )
            const categoryName = catObj?.nameCategory || catObj?.name || 'Unknown'

            await store.dispatch('addToCart', {
                product: {
                    ...fullProduct,
                    category: categoryName
                },
                quantity: item.quantity
            })
        }

        Swal.fire({
            icon: 'success',
            title: 'Products added to cart',
            text: 'All products from this order are now in your cart!',
            confirmButtonColor: '#000',
            timer: 1500
        })
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Could not add products to cart.', 'error')
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

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div class="d-flex gap-2 flex-wrap">
                        <button v-if="value.status === 'Delivered' || value.status === 'Canceled'"
                            class="btn btn-outline-primary btn-sm" @click="buyBack(value.products)">
                            Buy Back
                        </button>

                        <button v-else-if="value.status === 'Pending'" @click="Canceled(value.id)"
                            class="btn btn-outline-danger btn-sm">
                            Cancel order
                        </button>

                        <button v-if="value.status === 'Delivered'" class="btn btn-outline-danger btn-sm"
                            @click="$router.push(`/orderdetail/${value.id}#review`)">
                            Rate Products
                        </button>
                    </div>

                    <router-link :to="`/orderdetail/${value.id}`" class="btn btn-outline-dark btn-sm">
                        View Details
                    </router-link>
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
