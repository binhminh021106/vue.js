<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex'; // Dùng Vuex
import axios from 'axios';
import Swal from 'sweetalert2'; // Thêm Swal cho đẹp

const API_URL = import.meta.env.VITE_API_BASE_URL; // Cổng 8080 (json-server)
const route = useRoute();
const router = useRouter();
const store = useStore(); // Khởi tạo store

const message = ref('Đang xác thực thanh toán, vui lòng đợi...');
const status = ref('processing'); // 'processing', 'success', 'failed'
const orderId = ref(null);

// Hàm trừ kho và xóa giỏ hàng
const finalizeOrder = async (order) => {
    try {
        // 1. Trừ kho (Dùng 'order.products' từ đơn hàng)
        for (let item of order.products) {
            const productId = item.productId || item.id;
            const productRes = await axios.get(`${API_URL}/products/${productId}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const product = productRes.data;
            if (product.quantity !== undefined) {
                const newQuantity = Math.max(product.quantity - item.quantity, 0);
                await axios.patch(`${API_URL}/products/${productId}`, { quantity: newQuantity }, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
            }
        }

        // 2. Xóa giỏ hàng (Dùng Vuex)
        store.dispatch('cart/deleteAllCart'); // Giả sử action của bạn tên là 'deleteAllCart'

    } catch (err) {
        console.error('Lỗi khi trừ kho/xóa giỏ hàng:', err);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi cập nhật đơn hàng!',
            text: 'Thanh toán đã thành công nhưng có lỗi khi cập nhật kho.',
            confirmButtonColor: '#000'
        });
    }
};


onMounted(async () => {
    const queryParams = route.query;
    orderId.value = queryParams.vnp_TxnRef; // Lấy orderId từ VNPAY

    try {
        // 1. GỌI SERVER BẢO MẬT (CỔNG 3002) ĐỂ XÁC THỰC
        const response = await axios.get('http://localhost:3002/vnpay_return', {
            params: queryParams // Gửi toàn bộ query lên
        });

        // 2. KIỂM TRA KẾT QUẢ TỪ SERVER 3002 (response.data.code)
        if (response.data.code === '00') {
            // BẢO MẬT: Chữ ký hợp lệ và thanh toán thành công
            status.value = 'success';
            message.value = `Giao dịch thành công! Cảm ơn bạn đã mua hàng.`;

            // 3. CẬP NHẬT DATABASE (CỔNG API_URL / 8080)
            // Dùng 'PATCH' để cập nhật status (An toàn hơn GET + PUT)
            await axios.patch(`${API_URL}/order/${orderId.value}`, {
                status: "Đã thanh toán",
                paymentInfo: "Thanh toán thành công qua VNPay."
            }, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });

            // 4. TRỪ KHO & XÓA GIỎ HÀNG
            // Lấy lại đơn hàng từ localStorage (đã lưu ở checkout) để biết trừ kho
            const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
            if (lastOrder && lastOrder.id === orderId.value) {
                await finalizeOrder(lastOrder);
            } else {
                // Nếu mất localStorage, ít nhất cũng xóa giỏ hàng (nếu cartId lưu trong store)
                console.warn("Không tìm thấy lastOrder trong localStorage, không thể trừ kho.");
                store.dispatch('cart/deleteAllCart');
            }

        } else {
            // BẢO MẬT: Chữ ký KHÔNG hợp lệ, hoặc giao dịch thất bại (code != 00)
            status.value = 'failed';
            message.value = `Giao dịch thất bại (${response.data.message}). Đơn hàng đang ở trạng thái "Chờ thanh toán".`;

            // Không cần làm gì cả, vì đơn hàng vẫn là "Pending Payment"
        }
    } catch (error) {
        console.error('Lỗi khi xác thực thanh toán:', error);
        status.value = 'failed';
        message.value = 'Lỗi kết nối khi xác thực thanh toán.';
    }
});
</script>

<!-- PHẦN TEMPLATE CỦA BẠN RẤT TỐT, GIỮ NGUYÊN -->
<template>
        <div class="container my-5" style="min-height: 300px;">
                <div class="card shadow-sm border-0 rounded-4">
                        <div class="card-body text-center p-5">

                <!-- Thêm spinner khi đang xử lý -->
                                <div v-if="status === 'processing'" class="spinner-border text-dark fa-4x mb-3"
                    role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>

                                <i v-if="status === 'success'" class="fa fa-check-circle text-success fa-4x mb-3"></i>
                                <i v-else-if="status === 'failed'"
                    class="fa fa-times-circle text-danger fa-4x mb-3"></i>

                                <h2 v-if="status === 'success'" class="fw-bold">Thanh toán thành công!</h2>
                                <h2 v-else-if="status === 'failed'" class="fw-bold">Thanh toán thất bại</h2>
                                <h2 v-else class="fw-bold">Đang xử lý...</h2>


                                <p class="text-muted fs-5 mt-3">{{ message }}</p>
                                <p v-if="orderId" class="text-muted">Mã đơn hàng của bạn là: <strong>{{ orderId
                }}</strong></p>

                                <div class="mt-4">
                                        <router-link to="/shop" class="btn btn-dark me-2">Tiếp tục mua sắm</router-link>
                                        <router-link to="/profile" class="btn btn-outline-dark">Xem lịch sử đơn
                        hàng</router-link>
                                    </div>
                           
            </div>
                    </div>
            </div>
</template>

<style scoped>
.rounded-4 {
    border-radius: 15px;
}
</style>