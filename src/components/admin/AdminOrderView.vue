<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

const order = ref(null)
const status = ref("")
const route = useRoute()

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
  headers: { 'ngrok-skip-browser-warning': 'true' },
};


const readorder = async () => {
  try {
    const res = await axios.get(`${API_URL}/order/${route.params.id}`, ngrokHeaderConfig)
    order.value = res.data
    status.value = res.data.status || "Pending"
  } catch (err) {
    console.error("Err: ", err)
  }
}

const updateOrder = async () => {
  try {
    await axios.put(`${API_URL}/order/${route.params.id}`, {
      ...order.value,
      status: status.value
    }, ngrokHeaderConfig)
    Swal.fire({
      icon: 'success',
      title: 'Cập nhật thành công!',
      text: `Trạng thái mới: ${status.value}`,
      timer: 2000,
      showConfirmButton: false
    })
  } catch (err) {
    console.error("Err: ", err)
  }
}

onMounted(readorder)
</script>

<template>
  <div v-if="order" class="container my-5">
    <router-link class="btn btn-outline-dark mb-4" to="/admin/adminorder">
      <i class="fa fa-arrow-left me-2"></i> Quay lại giỏ hàng
    </router-link>

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
            <span :class="[
              'badge px-3 py-2 rounded-3',
              order.status === 'Pending' ? 'bg-warning text-dark' :
                order.status === 'Confirmed' ? 'bg-info text-white' :
                  order.status === 'Delivering' ? 'bg-primary' :
                    order.status === 'Delivered' ? 'bg-success' :
                      order.status === 'Canceled' ? 'bg-danger' : 'bg-secondary'
            ]">
              {{ order.status }}
            </span>
          </div>

          <!-- Cập nhật trạng thái -->
          <div>
            <h6 class="fw-semibold mb-2">Cập nhật trạng thái:</h6>
            <div class="status-options d-flex flex-wrap gap-2">
              <label class="status-pill">
                <input v-model="status" type="radio" value="Pending" :disabled="status === 'Canceled'" />
                <span>Đang chờ</span>
              </label>

              <label class="status-pill">
                <input v-model="status" type="radio" value="Confirmed" :disabled="status === 'Canceled'" />
                <span>Đã xác nhận</span>
              </label>

              <label class="status-pill">
                <input v-model="status" type="radio" value="Delivering" :disabled="status === 'Canceled'" />
                <span>Đang giao hàng</span>
              </label>

              <label class="status-pill">
                <input v-model="status" type="radio" value="Delivered" :disabled="status === 'Canceled'" />
                <span>Đã giao hàng</span>
              </label>

              <label class="status-pill">
                <input v-model="status" type="radio" value="Canceled" :disabled="status === 'Delivered'"/>
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
              <td class="text-danger fw-semibold">
                {{ (items.discount * items.quantity).toLocaleString('vi-VN') }} ₫
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tổng cộng -->
      <div class="text-end">
        <h5>Tổng cộng:</h5>
        <h3 class="text-danger fw-bold">{{ order.total.toLocaleString('vi-VN') }} ₫</h3>
      </div>

      <!-- Nút lưu -->
      <div class="text-end mt-4">
        <button @click="updateOrder" class="btn btn-dark px-4 py-2 fw-semibold">
          <i class="fa fa-save me-2"></i> Lưu thay đổi
        </button>
      </div>
    </div>
  </div>

  <p v-else class="text-center text-muted mt-5">Đang tải đơn hàng...</p>
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

/* ======================================= */
/* PHẦN STYLE NÚT TRẠNG THÁI ĐƯỢC LÀM LẠI */
/* ======================================= */

.status-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Bản thân cái label giờ chỉ là "vỏ"
  chứa input và span 
*/
.status-pill {
  display: flex;
  /* Dùng flex để căn giữa */
  align-items: center;
  cursor: pointer;
  /* Bỏ padding và border ở label */
}

/* Ẩn radio input gốc */
.status-pill input {
  display: none;
}

/* Style cho cái SPAN thành cái "pill" thật sự 
*/
.status-pill span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px 16px;
  /* Tăng padding 1 chút */
  border-radius: 25px;
  transition: all 0.25s ease;
  /* Thêm transition mượt mà */
}

/* Khi hover vào label, đổi màu cái span */
.status-pill:hover span {
  background-color: #e9e9e9;
  border-color: #ccc;
}

/* Đây là phần quan trọng:
  Khi input được CHECKED, style cho cái SPAN 
*/
.status-pill input:checked+span {
  color: #fff;
  font-weight: 600;
  border-color: transparent;
  /* Bỏ border khi đã chọn */
  box-shadow: 0 3px 8px -2px rgba(0, 0, 0, 0.2);
  /* Thêm đổ bóng nhẹ */
}

/* (MỚI) Style cho trạng thái DISABLED */
.status-pill input:disabled+span {
  background-color: #f8f9fa;
  /* Màu mờ đi */
  color: #adb5bd;
  /* Màu text mờ đi */
  cursor: not-allowed;
  border-color: #e9ecef;
  box-shadow: none;
  /* Bỏ shadow */
}

/* Không đổi màu khi hover nút disabled 
*/
.status-pill:hover input:disabled+span {
  background-color: #f8f9fa;
  border-color: #e9ecef;
}

/* Màu theo trạng thái (Áp dụng cho input:checked+span) 
*/
.status-pill input[value="Pending"]:checked+span {
  background-color: #ffc107;
  color: #212529;
  /* Đổi màu chữ thành đen cho dễ đọc */
}

.status-pill input[value="Confirmed"]:checked+span {
  background-color: #17a2b8;
}

.status-pill input[value="Delivering"]:checked+span {
  background-color: #007bff;
}

.status-pill input[value="Delivered"]:checked+span {
  background-color: #28a745;
}

.status-pill input[value="Canceled"]:checked+span {
  background-color: #dc3545;
}
</style>
