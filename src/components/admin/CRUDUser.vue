<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const users = ref([])
const formUser = ref({ fullname: "", email: "", phone: "", address: "", role: "", password: "" })
const isEditing = ref(false)
const editingId = ref(null)

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const readUser = async () => {
  try {
    const res = await axios.get(`${API_URL}/user`, ngrokHeaderConfig)
    users.value = res.data
  } catch (err) {
    console.log("Fetch posts error:", err)
  }
}

const removeUser = async (id) => {
  Swal.fire({
    title: 'Bạn có chắc chắn muốn xoá?',
    text: `User có ID: ${id} sẽ bị xoá vĩnh viễn!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/user/${id}`, ngrokHeaderConfig)
        users.value = users.value.filter(u => u.id !== id)
        Swal.fire({
          icon: 'success',
          title: 'Đã xoá!',
          text: `User ${id} đã bị xoá khỏi hệ thống.`,
          confirmButtonColor: '#000'
        })
      } catch (err) {
        console.error("err: ", err)
      }
    }
  })
}

const createUser = async () => {
  if (!formUser.value.fullname || !formUser.value.email || !formUser.value.phone || !formUser.value.address || !formUser.value.role || !formUser.value.password) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin!',
      text: 'Vui lòng nhập đầy đủ thông tin',
      timer: 2000,
      showConfirmButton: false
    })
    return
  }
  try {
    const res = await axios.post(`${API_URL}/user`, formUser.value, ngrokHeaderConfig)
    users.value.push(res.data)
    Swal.fire({
      icon: 'success',
      title: 'Tạo user thành công',
      text: 'Bạn đã tạo user thành công',
      timer: 1500,
      showConfirmButton: false
    })
    resetForm()
  } catch (err) {
    console.log("Add user error:", err)
  }
}

const editUser = (item) => {
  formUser.value = { ...item }
  isEditing.value = true
  editingId.value = item.id
}

const updateUser = async () => {
  if (!formUser.value.fullname || !formUser.value.email || !formUser.value.phone || !formUser.value.address || !formUser.value.role) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin',
      text: 'Vui lòng nhập đầy đủ thông tin',
      timer: 2000,
      showConfirmButton: false
    })
    return
  }
  try {
    const res = await axios.put(`${API_URL}/user/${editingId.value}`, formUser.value, ngrokHeaderConfig)
    const index = users.value.findIndex(p => p.id === editingId.value)
    if (index !== -1) users.value[index] = res.data
    Swal.fire({
      icon: 'success',
      title: 'Sửa user thành công',
      text: 'Bạn đã sửa user thành công',
      timer: 1500,
      showConfirmButton: false
    })
    resetForm()
  } catch (err) {
    console.error("Update user error:", err)
  }
}

const resetForm = () => {
  formUser.value = { fullname: "", email: "", phone: "", address: "", role: "", password: "" }
  isEditing.value = false
  editingId.value = null
}

onMounted(readUser)
</script>

<template>
  <div class="container py-5">
    <div class="card shadow-lg border-0 rounded-4 p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-dark mb-0">
          <i class="fa fa-users me-2 text-primary"></i>Quản Lý Người Dùng
        </h3>
        <button class="btn btn-dark px-4" @click="resetForm">
          <i class="fa fa-plus me-2"></i>Thêm người dùng
        </button>
      </div>

      <!-- Bảng danh sách -->
      <div class="table-responsive">
        <table class="table align-middle table-hover text-center">
          <thead class="table-dark">
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length" v-for="(items, index) in users" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ items.fullname }}</td>
              <td>{{ items.email }}</td>
              <td>{{ items.phone }}</td>
              <td>{{ items.address }}</td>
              <td>
                <span class="badge fs-6 px-3 py-2 rounded-pill" :class="{
                  'bg-danger': items.role === 'admin',
                  'bg-success': items.role === 'user'
                }">
                  {{ items.role }}
                </span>
              </td>
              <td>
                <button @click="editUser(items)" class="btn btn-outline-warning btn-sm me-2">
                  <i class="fa fa-edit"></i>
                </button>
                <button @click="removeUser(items.id)" class="btn btn-outline-danger btn-sm" :disabled="items.role === 'admin'">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-else>
              <td colspan="7" class="text-center text-muted py-4">
                <i class="fa fa-inbox fa-2x mb-2"></i><br />Chưa có người dùng nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Form thêm/sửa -->
      <div class="border-top pt-4 mt-4">
        <h5 class="fw-bold mb-3">
          {{ isEditing ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới' }}
        </h5>
        <form @submit.prevent="isEditing ? updateUser() : createUser()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Họ tên</label>
              <input v-model="formUser.fullname" type="text" class="form-control" placeholder="Nhập họ tên" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input v-model="formUser.email" type="email" class="form-control" placeholder="Nhập email" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Số điện thoại</label>
              <input v-model="formUser.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Địa chỉ</label>
              <input v-model="formUser.address" type="text" class="form-control" placeholder="Nhập địa chỉ" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mật khẩu</label>
              <input v-model="formUser.password" type="password" class="form-control" placeholder="Nhập mật khẩu" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Quyền</label>
              <select class="form-select" v-model="formUser.role" required>
                <option disabled value="">-- Chọn quyền --</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <button type="submit" class="btn btn-dark px-4 me-2">
              {{ isEditing ? 'Lưu thay đổi' : 'Thêm người dùng' }}
            </button>
            <button type="button" class="btn btn-outline-secondary px-4" @click="resetForm">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  color: #222;
}

.table th {
  font-weight: 600;
  vertical-align: middle;
}

.card {
  background: #fff;
  border-radius: 16px;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  border-color: #000 !important;
  box-shadow: none;
}
</style>
