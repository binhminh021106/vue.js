<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

const reviews = ref([]);
const searchQuery = ref("");
const filterRating = ref("");
const selectedId = ref(null)
const selectedName = ref("")

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const readReview = async () => {
    try {
        const res = await axios.get(`${API_URL}/reviews`, ngrokHeaderConfig)
        reviews.value = res.data
    } catch (err) {
        console.error("Err admin review: ", err)
    }
}

const askDelete = (id, name) => {
    selectedId.value = id,
    selectedName.value = name
}

const confirmDelete = async () => {
    if (!selectedId.value) return
    try {
        await axios.delete(`${API_URL}/reviews/${selectedId.value}`, ngrokHeaderConfig)
        reviews.value = reviews.value.filter(c => c.id !== selectedId.value)
        selectedName.value = ""
        Swal.fire({
            icon: 'success',
            title: 'Xoá đánh giá thành công',
            text: `Bạn đã xoá đánh giá thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

const successReview = async (id) => {
    try {
        await axios.patch(`${API_URL}/reviews/${id}`, {
            status: "Approved"
        }, ngrokHeaderConfig)

        const index = reviews.value.findIndex(c => c.id === id)
        if (index !== -1) reviews.value[index].status = "Approved"

        Swal.fire({
            icon: 'success',
            title: 'Duyệt đánh giá thành công',
            text: 'Đánh giá đã được chuyển sang trạng thái Approved!',
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

const RejectedReview = async (id) => {
    try {
        await axios.patch(`${API_URL}/reviews/${id}`, {
            status: "Rejected"
        }, ngrokHeaderConfig)

        const index = reviews.value.findIndex(c => c.id === id)
        if (index !== -1) reviews.value[index].status = "Rejected"

        Swal.fire({
            icon: 'success',
            title: 'Duyệt đánh giá thành công',
            text: 'Đánh giá đã được chuyển sang trạng thái Rejected!',
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

const formatDateTimeVN = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }
    return date.toLocaleString('vi-VN', options).replace('lúc', '')
}

onMounted(readReview);
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold text-center mb-4">⭐ Quản Lý Đánh Giá</h2>

        <!-- Thanh tìm kiếm & bộ lọc -->
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div class="input-group" style="max-width: 300px;">
                <span class="input-group-text bg-white"><i class="fa fa-search"></i></span>
                <input v-model="searchQuery" type="text" class="form-control"
                    placeholder="Tìm kiếm theo tên hoặc sản phẩm..." />
            </div>

            <select v-model="filterRating" class="form-select" style="max-width: 200px;">
                <option value="">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
            </select>
        </div>

        <!-- Bảng đánh giá -->
        <div class="table-responsive shadow-sm rounded-3 border">
            <table class="table align-middle mb-0">
                <thead class="table-dark text-nowrap">
                    <tr>
                        <th>#</th>
                        <th>Người đánh giá</th>
                        <th>Email</th>
                        <th>Sản phẩm</th>
                        <th>Đánh giá</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Trạng thái</th>
                        <th class="text-center" style="width: 12%;">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="value in reviews" :key="value.id">
                        <td>#{{ value.id }}</td>
                        <td>{{ value.username }}</td>
                        <td>{{ value.email }}</td>
                        <td>{{ value.product }}</td>
                        <td>
                            <span v-for="star in 5" :key="star">
                                <i class="fa-star"
                                    :class="star <= value.rating ? 'fa-solid text-warning' : 'fa-regular text-muted'"></i>
                            </span>
                        </td>
                        <td style="max-width: 250px;">{{ value.comment }}</td>
                        <td>{{ formatDateTimeVN(value.date) }}</td>
                        <td>
                            <span class="badge px-3 py-2 rounded-2 text-nowrap" :class="{
                                'bg-warning text-dark': value.status === 'Pending',
                                'bg-success text-white': value.status === 'Approved',
                                'bg-danger text-white': value.status === 'Rejected'
                            }">
                                {{ value.status }}
                            </span>
                        </td>
                        <td class="text-center">
                            <button @click="successReview(value.id)"
                                :disabled="value.status === 'Approved' || value.status === 'Rejected'"
                                class="btn btn-outline-success btn-sm me-2">
                                <i class="fa fa-check"></i>
                            </button>
                            <button @click="RejectedReview(value.id)"
                                :disabled="value.status === 'Approved' || value.status === 'Rejected'"
                                class="btn btn-outline-danger btn-sm me-2">
                                <i class="fa fa-times"></i>
                            </button>
                            <button @click="askDelete(value.id, value.name)" class="btn btn-outline-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>

                    <tr v-if="reviews.length === 0">
                        <td colspan="8" class="text-center py-4 text-muted">
                            Không có đánh giá nào
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Xác nhận xoá</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <i class="fa fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                        <p>Bạn có chắc muốn xoá <strong>{{ selectedName }}</strong> không?</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Huỷ</button>
                        <button @click="confirmDelete" data-bs-dismiss="modal" class="btn btn-danger">Xoá</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.table {
    background-color: #fff;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 10px;
    overflow: hidden;
}

.table thead th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.3px;
    border: none;
}

.table tbody tr {
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
}

.table tbody tr:hover {
    background-color: #f6f6f6;
}

.badge {
    font-size: 0.8rem;
    font-weight: 500;
}

.btn {
    border-radius: 6px;
    transition: all 0.25s ease;
}

.btn:hover {
    transform: translateY(-1px);
}
</style>
