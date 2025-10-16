<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const message = ref('Đang xử lý kết quả thanh toán...');
const status = ref('processing'); // processing, success, failed
const orderId = ref(null);

// Hàm cập nhật trạng thái đơn hàng trong db.json
const updateOrderStatus = async (id, newStatus) => {
  try {
    // Đầu tiên, lấy thông tin đơn hàng hiện tại
    const { data: order } = await axios.get(`http://localhost:3000/orders/${id}`);
    
    // Cập nhật trạng thái
    order.status = newStatus;
    
    // Gửi lại để cập nhật
    await axios.put(`http://localhost:3000/orders/${id}`, order);
  } catch (error) {
    console.error(`Lỗi khi cập nhật đơn hàng #${id}:`, error);
  }
};

onMounted(() => {
  const query = route.query;
  orderId.value = query.vnp_TxnRef;

  // Kiểm tra mã phản hồi từ VNPay
  if (query.vnp_ResponseCode === '00') {
    status.value = 'success';
    message.value = `Giao dịch thành công! Cảm ơn bạn đã mua hàng.`;
    // Cập nhật trạng thái đơn hàng thành "Đã thanh toán"
    updateOrderStatus(orderId.value, 'Đã thanh toán');
  } else {
    status.value = 'failed';
    message.value = `Giao dịch thất bại. Nếu bạn đã bị trừ tiền, vui lòng liên hệ với chúng tôi.`;
    // Cập nhật trạng thái đơn hàng thành "Thanh toán thất bại"
    updateOrderStatus(orderId.value, 'Thanh toán thất bại');
  }
});
</script>

<template>
  <div class="container my-5">
    <div class="card shadow-sm border-0">
      <div class="card-body text-center p-5">
        <div v-if="status === 'success'">
          <i class="fa fa-check-circle text-success fa-4x mb-3"></i>
          <h2 class="fw-bold">Thanh toán thành công!</h2>
        </div>
        <div v-else-if="status === 'failed'">
          <i class="fa fa-times-circle text-danger fa-4x mb-3"></i>
          <h2 class="fw-bold">Thanh toán thất bại</h2>
        </div>
        
        <p class="text-muted fs-5 mt-3">{{ message }}</p>
        <p v-if="orderId" class="text-muted">Mã đơn hàng của bạn là: <strong>#{{ orderId }}</strong></p>

        <div class="mt-4">
          <router-link to="/shop" class="btn btn-dark me-2">Tiếp tục mua sắm</router-link>
          <router-link to="/order-history" class="btn btn-outline-dark">Xem lịch sử đơn hàng</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
