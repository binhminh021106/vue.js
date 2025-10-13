<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

const order = ref(null)
const route = useRoute()

const readorder = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/order/${route.params.id}`)
    order.value = res.data
  } catch (err) {
    console.error("Err: ", err)
  }
}

onMounted(readorder)
</script>

<template>
  <div v-if="order" class="container my-5">
    <router-link class="btn btn-outline-dark mb-4" to="/admin/adminorder"><i class="fa fa-arrow-left me-2"></i> Quay lại
      giỏ hàng</router-link>

    <div class="card shadow-sm border-0 rounded-4 p-4">
      <h3 class="fw-bold mb-4 text-center">📄 Chi Tiết Đơn Hàng</h3>

      <!-- Thông tin khách hàng -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h5 class="fw-semibold mb-3">👤 Thông Tin Khách Hàng</h5>
          <p><strong>Tên:</strong> {{ order.fullname }}</p>
          <p><strong>Email:</strong> {{ order.email }}</p>
          <p><strong>Điện thoại:</strong> {{ order.phone }}</p>
          <p><strong>Địa chỉ:</strong> {{ order.fulladdress }}</p>
        </div>

        <div class="col-md-6">
          <h5 class="fw-semibold mb-3">💳 Thanh Toán & Trạng Thái</h5>
          <p><strong>Phương thức:</strong> {{ order.payment }}</p>
          <p><strong>Ngày đặt:</strong> {{ order.date }}</p>

          <!-- Trạng thái hiện tại -->
          <div class="mb-3">
            <strong>Trạng thái hiện tại:</strong>
            <span class="badge bg-warning text-dark px-3 py-2 rounded-3"> Đang chờ</span>
          </div>

          <!-- Khu chọn trạng thái -->
          <div>
            <h6 class="fw-semibold mb-2">Cập nhật trạng thái:</h6>
            <div class="status-options d-flex flex-wrap gap-2">
              <label class="status-pill">
                <input type="radio" name="status" value="Đang chờ" checked />
                <span>Đang chờ</span>
              </label>

              <label class="status-pill">
                <input type="radio" name="status" value="Đã xác nhận" />
                <span>Đã xác nhận</span>
              </label>

              <label class="status-pill">
                <input type="radio" name="status" value="Đang giao hàng" />
                <span>Đang giao hàng</span>
              </label>

              <label class="status-pill">
                <input type="radio" name="status" value="Đã giao hàng" />
                <span>Đã giao hàng</span>
              </label>

              <label class="status-pill">
                <input type="radio" name="status" value="Đã huỷ" />
                <span>Đã huỷ</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <!-- Danh sách sản phẩm -->
      <h5 class="fw-semibold mb-3">🛍️ Sản Phẩm Trong Đơn</h5>
      <div class="table-responsive mb-4">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="items in order.products" :key="items.productId">
              <td>
                <img :src="items.image" class="rounded border" width="60" height="60" style="object-fit: cover;" />
              </td>
              <td>{{ items.name }}</td>
              <td>{{ items.quantity }}</td>
              <td>{{ Number(items.discount).toLocaleString('vi-VN') }}</td>
              <td class="text-danger fw-semibold">{{ (items.discount * items.quantity).toLocaleString('vi-VN') }} ₫</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tổng kết -->
      <div class="text-end">
        <h5>Tổng cộng:</h5>
        <h3 class="text-danger fw-bold">{{ order.total.toLocaleString('vi-VN') }} ₫</h3>
      </div>

      <!-- Nút lưu -->
      <div class="text-end mt-4">
        <button class="btn btn-dark px-4 py-2 fw-semibold">
          <i class="fa fa-save me-2"></i> Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
  <p v-else class="text-center text-muted mt-5">Loading Order...</p>
</template>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 16px;
  transition: 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.table th {
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}

.table tbody tr:hover {
  background-color: #fafafa;
}

.badge {
  font-size: 0.85rem;
  font-weight: 500;
}

.btn {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

/* Style phần chọn trạng thái */
.status-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-pill {
  background-color: #f5f5f5;
  border-radius: 25px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: 0.3s ease;
}

.status-pill input {
  display: none;
}

.status-pill span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.status-pill:hover {
  background-color: #eee;
}

.status-pill input:checked+span {
  color: #fff;
  font-weight: 600;
}

/* Màu riêng từng trạng thái */
.status-pill input[value="Đang chờ"]:checked+span {
  background-color: #ffc107;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill input[value="Đã xác nhận"]:checked+span {
  background-color: #17a2b8;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill input[value="Đang giao hàng"]:checked+span {
  background-color: #007bff;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill input[value="Đã giao hàng"]:checked+span {
  background-color: #28a745;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill input[value="Đã huỷ"]:checked+span {
  background-color: #dc3545;
  padding: 4px 10px;
  border-radius: 20px;
}
</style>
