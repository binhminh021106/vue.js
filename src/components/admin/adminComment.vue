<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

const comment = ref([])
const searchQuery = ref("")
const filterStatus = ref("")

const readComment = async () => {
    try {
        const res = await axios.get('http://localhost:3000/comment')
        comment.value = res.data
    } catch (err) {
        console.error("Err admin comment: ", err)
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

const successComment = async (id) => {
    try {
        await axios.patch(`http://localhost:3000/comment/${id}`, {
            status: "Approved"
        })

        const index = comment.value.findIndex(c => c.id === id)
        if (index !== -1) comment.value[index].status = "Approved"

        Swal.fire({
            icon: 'success',
            title: 'Duyệt bình luận thành công',
            text: 'Bình luận đã được chuyển sang trạng thái Approved!',
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Err admin Comment: ", err)
    }
}

const RejectedComment = async (id) => {
    try {
        await axios.patch(`http://localhost:3000/comment/${id}`, {
            status: "Rejected"
        })

        const index = comment.value.findIndex(c => c.id === id)
        if (index !== -1) comment.value[index].status = "Rejected"

        Swal.fire({
            icon: 'success',
            title: 'Duyệt bình luận thành công',
            text: 'Bình luận đã được chuyển sang trạng thái Rejected!',
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Err admin comment: ", err)
    }
}

onMounted(readComment)
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold text-center mb-4">💬 Quản Lý Bình Luận</h2>

        <!-- Thanh tìm kiếm & bộ lọc -->
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div class="input-group" style="max-width: 300px;">
                <span class="input-group-text bg-white"><i class="fa fa-search"></i></span>
                <input v-model="searchQuery" type="text" class="form-control"
                    placeholder="Tìm kiếm theo tên hoặc nội dung..." />
            </div>

            <select v-model="filterStatus" class="form-select" style="max-width: 200px;">
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
            </select>
        </div>

        <!-- Bảng bình luận -->
        <div class="table-responsive shadow-sm rounded-3 border">
            <table class="table align-middle mb-0">
                <thead class="table-dark text-nowrap">
                    <tr>
                        <th>#</th>
                        <th>Người bình luận</th>
                        <th>Email</th>
                        <th>Nội dung</th>
                        <th>Sản phẩm</th>
                        <th>Ngày</th>
                        <th style="width: 10%;">Trạng thái</th>
                        <th style="width: 15%;" class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="value in comment" :key="value.id">
                        <td>#{{ value.id }}</td>
                        <td>{{ value.username }}</td>
                        <td>{{ value.email }}</td>
                        <td style="max-width: 250px;">{{ value.comment }}</td>
                        <td>{{ value.product }}</td>
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
                            <button :disabled="value.status === 'Approved' || value.status === 'Rejected'"
                                @click="successComment(value.id)" class="btn btn-outline-success btn-sm me-2">
                                <i class="fa fa-check"></i>
                            </button>
                            <button @click="RejectedComment(value.id)"
                                :disabled="value.status === 'Approved' || value.status === 'Rejected'"
                                class="btn btn-outline-danger btn-sm me-2">
                                <i class="fa fa-times"></i>
                            </button>
                        </td>
                    </tr>

                    <tr v-if="comment.length === 0">
                        <td colspan="8" class="text-center py-4 text-muted">
                            Không có bình luận nào
                        </td>
                    </tr>
                </tbody>
            </table>
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
