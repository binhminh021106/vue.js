<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_BASE_URL
const VNPAY_SERVER_URL = 'http://localhost:3002'

const status = ref('loading') 
const message = ref('Processing your transaction, please wait...')
const orderId = ref(route.query.vnp_TxnRef || null)

const updateStock = async (products) => {
    console.log('Updating stock for', products)
    for (let item of products) {
        try {
            const productId = item.productId || item.id
            const productRes = await axios.get(`${API_URL}/products/${productId}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            })
            const product = productRes.data

            if (product.quantity !== undefined) {
                const newQuantity = Math.max(product.quantity - item.quantity, 0)
                await axios.patch(
                    `${API_URL}/products/${productId}`,
                    { quantity: newQuantity },
                    { headers: { 'ngrok-skip-browser-warning': 'true' } }
                )
            }
        } catch (err) {
            console.error(`Lỗi cập nhật tồn kho cho ${item.id}:`, err)
        }
    }
}

const clearCart = async (products) => {
    console.log('Clearing cart...')
    try {
        await Promise.all(
            products.map((item) =>
                axios.delete(`${API_URL}/cart/${item.id}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                })
            )
        )
    } catch (err) {
        console.error('Lỗi xóa giỏ hàng:', err)
    }
}

const handlePaymentReturn = async () => {
    const queryParams = route.query
    if (!orderId.value) {
        status.value = 'failed'
        message.value = 'Order code not found. Transaction is invalid..'
        return
    }

    try {
        const res = await axios.get(`${VNPAY_SERVER_URL}/vnpay_return`, {
            params: queryParams
        })

        const { code } = res.data

        const lastOrder = JSON.parse(localStorage.getItem('lastOrder'))

        if (!lastOrder || lastOrder.id !== orderId.value) {
            status.value = 'failed'
            message.value = `Payment successful (Code: ${code}), but order information could not be found on the browser. Please contact support.`
            localStorage.removeItem('lastOrder')
            return
        }

        if (code === '00') {
            status.value = 'success'
            message.value = 'Payment transaction successful! Your order is being processed.'

            await axios.patch(
                `${API_URL}/order/${lastOrder.id}`,
                { status: 'Pending' },
                { headers: { 'ngrok-skip-browser-warning': 'true' } }
            )

            await updateStock(lastOrder.products)

            await clearCart(lastOrder.products)

            localStorage.removeItem('lastOrder')

        } else {
            status.value = 'failed'
            message.value = `Transaction failed. ${res.data.message || 'Please try again.'} (Error code: ${code})`

            await axios.patch(
                `${API_URL}/order/${lastOrder.id}`,
                { status: 'Payment Failed' },
                { headers: { 'ngrok-skip-browser-warning': 'true' } }
            )
        }
    } catch (error) {
        console.error('Lỗi xác thực thanh toán:', error)
        status.value = 'failed'
        message.value = 'Đã xảy ra lỗi khi xác thực thanh toán. Vui lòng liên hệ hỗ trợ.'
    }
}

onMounted(() => {
    handlePaymentReturn()
})

const goToHome = () => {
    router.push('/')
}

const goToCheckout = () => {
    router.push('/checkout')
}
</script>

<template>
    <div class="container my-5 py-5 text-center">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card border-0 shadow-sm p-4 rounded-4">
                    <div v-if="status === 'loading'">
                        <div class="spinner-border text-dark" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h4 class="mt-3 fw-semibold">Verifying Payment</h4>
                        <p class="text-muted">{{ message }}</p>
                    </div>

                    <div v-if="status === 'success'">
                        <i class="fa-solid fa-circle-check text-success display-3 mb-3"></i>
                        <h3 class="fw-bold mb-2">Payment Successful!</h3>
                        <p class="fs-5 text-muted">{{ message }}</p>
                        <p class="mb-4">Your order ID is: <strong class="text-dark">{{ orderId }}</strong></p>
                        <button @click="goToHome" class="btn btn-dark py-2 px-4 fw-semibold">
                            Continue Shopping
                        </button>
                    </div>

                    <div v-if="status === 'failed'">
                        <i class="fa-solid fa-circle-xmark text-danger display-3 mb-3"></i>
                        <h3 class="fw-bold mb-2">Payment Failed</h3>
                        <p class="fs-5 text-muted">{{ message }}</p>
                        <p v-if="orderId" class="mb-4">Order ID: <strong class="text-dark">{{ orderId }}</strong></p>
                        <div class="d-flex justify-content-center gap-2">
                            <button @click="goToCheckout" class="btn btn-outline-dark py-2 px-4 fw-semibold">
                                Retry Payment
                            </button>
                            <button @click="goToHome" class="btn btn-dark py-2 px-4 fw-semibold">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    transition: 0.3s;
}

.display-3 {
    font-size: 4.5rem;
}
</style>