<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const isSaving = ref(false)

const user = ref({
  id: null,
  fullname: '',
  gender: '',
  date_birth: '',
  email: '',
  phone: '',
  address: '',
  role: '',
  password: '',
  image: ''
})

onMounted(() => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (loggedInUser) {
    user.value = { ...loggedInUser }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'You are not logged in',
      text: 'Please log in to view personal information!',
      confirmButtonColor: '#000'
    }).then(() => {
      window.location.href = '/login'
    })
  }
})

const getAge = (dateString) => {
  if (!dateString) return ''
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}



const saveChanges = async () => {
  isSaving.value = true;
  try {
    await axios.put(`${API_URL}/user/${user.value.id}`, user.value, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
    localStorage.setItem('loggedInUser', JSON.stringify(user.value))

    toast.success("Update complete", {
      autoClose: 3000,
      position: "top-right",
    });
  } catch (err) {
    console.error('Update error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Unable to update information, please try again.',
      confirmButtonColor: '#000'
    })
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="card shadow-lg border-0 rounded-4 p-4 profile-card mx-auto" style="max-width: 850px;">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-4">
        <!-- Avatar + Basic Info -->
        <div class="d-flex align-items-center gap-4 flex-wrap">
          <div class="text-center flex-shrink-0">
            <img :src="user.image || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'" alt="avatar"
              class="rounded-circle border shadow-sm" width="140" height="140" />
            <div class="mt-3">
              <input type="file" ref="fileInput" accept="image/*" class="d-none" @change="handleImageChange" />
              <button class="btn btn-outline-dark btn-sm px-3" @click="triggerFileInput">
                <i class="fa fa-camera me-2"></i>Choose image
              </button>
            </div>
          </div>

          <div class="flex-grow-1">
            <h3 class="fw-bold mb-2">{{ user.fullname }}</h3>
            <p class="text-muted mb-1">
              <i class="fa fa-birthday-cake me-2"></i>Age: {{ getAge(user.date_birth) }}
            </p>
            <p class="text-muted mb-1"><i class="fa fa-envelope me-2"></i>{{ user.email }}</p>
            <p class="text-muted mb-1"><i class="fa fa-phone me-2"></i>{{ user.phone }}</p>
            <p class="text-muted mb-1"><i class="fa fa-map-marker me-2"></i>{{ user.address }}</p>
            <span class="badge bg-dark mt-2 text-uppercase">{{ user.role }}</span>
          </div>
        </div>

        <div class="text-center ms-auto d-flex flex-column align-items-center gap-3">
          <router-link to="/vieworder" class="btn btn-dark fw-semibold px-4 py-2 w-100">
            <i class="fa fa-box me-2"></i>View Orders
          </router-link>

          <router-link to="/wishlist" class="btn btn-outline-danger px-4 py-2 w-100">
            <i class="fa fa-heart me-2"></i>My Wishlist
          </router-link>
        </div>
      </div>

      <hr class="my-4" />

      <!-- Edit Form -->
      <div>
        <h5 class="fw-bold mb-3">Edit Profile</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Full Name</label>
            <input v-model="user.fullname" type="text" class="form-control" placeholder="Nhập họ tên" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Gender</label>
            <select class="form-select" v-model="user.gender">
              <option>-- Choose Gender --</option>
              <option value="Men">Men</option>
              <option value="Women">Women </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Date of Birth</label>
            <input v-model="user.date_birth" type="date" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input v-model="user.email" type="email" class="form-control" placeholder="Nhập email" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Phone Number</label>
            <input v-model="user.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Address</label>
            <input v-model="user.address" type="text" class="form-control" placeholder="Nhập địa chỉ" />
          </div>
          <div class="col-md-6">
            <label class="form-label">New Password</label>
            <input v-model="user.password" type="password" class="form-control" placeholder="Nhập mật khẩu mới" />
          </div>
        </div>

        <div class="mt-4 d-flex gap-3">
          <button class="btn btn-dark px-4 py-2" @click="saveChanges" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

            <span v-else>
              <i class="fa fa-save me-2"></i>
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </span>
          </button>
          <button class="btn btn-outline-dark px-4 py-2">
            <i class="fa fa-times me-2"></i>Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: #fff;
}

img {
  object-fit: cover;
  transition: 0.3s ease;
}

img:hover {
  transform: scale(1.03);
}

input:focus {
  border-color: #000 !important;
  box-shadow: none;
}

.btn-dark:hover {
  background-color: #222 !important;
}

.btn {
  border-radius: 10px;
  transition: 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}
</style>
