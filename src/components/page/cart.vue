<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { computed } from 'vue'

const cart = ref([])

const readCart = async () => {
    try {
        const res = await axios.get('http://localhost:3000/cart')
        cart.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}


const decrease = async (item) => {
    if (item.quantity > 1) {
        item.quantity--
        await axios.patch(`http://localhost:3000/cart/${item.id}`, { quantity: item.quantity })
    }
}

const increase = async (item) => {
    if (item.quantity < 100) {
        item.quantity++
        await axios.patch(`http://localhost:3000/cart/${item.id}`, { quantity: item.quantity })
    }
}

const deleteCart = async (id) => {
    Swal.fire({
        title: 'Delete this product?',
        text: "This action cannot be undone.!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'OK!',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/cart/${id}`);
                cart.value = cart.value.filter(c => c.id !== id)
                Swal.fire('Deleted!', 'The product has been removed from the cart.', 'success');
            } catch (err) {
                console.error("Err: ", err)
            }
        }
    });
}

const deleteAllCart = async () => {
    if (cart.value.length === 0) return

    Swal.fire({
        title: 'Clear all cart?',
        text: 'All products will be deleted.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete All',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                for (const items of cart.value) {
                    await axios.delete(`http://localhost:3000/cart/${items.id}`)
                }
                cart.value = []
                Swal.fire('Deleted!', 'The entire cart has been cleared.', 'success')
            } catch (err) {
                console.error("Err: ", err)
            }
        }
    })
}

const total = computed(() => {
    return cart.value.reduce((sum, item) => {
        const price = item.discount || item.price
        return sum + price * item.quantity
    }, 0)
})

onMounted(readCart)
</script>


<template>
    <div class="container my-5">
        <h2 class="fw-bold mb-4 text-center">🛒 Your Cart</h2>

        <!-- Nếu giỏ hàng trống -->
        <div class="text-center text-muted py-5" v-if="cart.length === 0">
            <i class="fa fa-shopping-cart fa-3x mb-3"></i>
            <p>Your cart is empty</p>
            <router-link to="/" class="btn btn-dark">Continue Shopping</router-link>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="row g-4" v-else>
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <table class="table align-middle mb-0">
                            <thead class="table-dark text-center">
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody class="text-center">
                                <tr v-for="items in cart" :key="items.id">
                                    <td>
                                        <div class="d-flex align-items-center text-start">
                                            <img :src="items.image" class="rounded me-3 border" width="70" />
                                            <div>
                                                <h6 class="mb-0">{{ items.name }}</h6>
                                                <small class="text-muted">Danh mục: Thời trang</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="text-danger fw-semibold">{{
                                            Number(items.discount).toLocaleString('vi-VN') }} ₫</span><br />
                                        <small class="text-muted text-decoration-line-through">{{
                                            Number(items.price).toLocaleString('vi-VN') }} ₫</small>
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm mx-auto" style="width: 120px;">
                                            <button @click="decrease(items)" class="btn btn-outline-dark">-</button>
                                            <input v-model="items.quantity" type="number"
                                                class="form-control text-center" min="0" max="100" value="1" />
                                            <button @click="increase(items)" class="btn btn-outline-dark">+</button>
                                        </div>
                                    </td>
                                    <td class="fw-semibold">{{ (items.discount * items.quantity).toLocaleString('vi-VN')
                                        }} ₫</td>
                                    <td>
                                        <button @click="deleteCart(items.id)" class="btn btn-sm btn-danger">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="text-end mt-3">
                    <button @click="deleteAllCart" class="btn btn-outline-danger btn-sm">
                        <i class="fa fa-trash me-1"></i> Delete All
                    </button>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Order Summary</h5>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Provisional</span>
                            <span>{{ total.toLocaleString('vi-VN') }} ₫</span>
                        </div>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping Fee</span>
                            <span class="text-success">Free</span>
                        </div>

                        <hr />

                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total</span>
                            <span>{{ total.toLocaleString('vi-VN') }} ₫</span>
                        </div>

                        <button class="btn btn-dark w-100 mt-4 fw-semibold">Pay Now</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    color: #222;
    letter-spacing: 0.5px;
}

table img {
    object-fit: cover;
    height: 70px;
}

input[type="text"] {
    border: 1px solid #ddd;
}

.card {
    border-radius: 12px;
    overflow: hidden;
    transition: 0.3s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
