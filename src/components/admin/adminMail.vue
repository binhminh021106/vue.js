<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const selectedName = ref("")
const selectedId = ref(null)
const email = ref([])

const readEmail = async () => {
    try {
        const res = await axios.get('http://localhost:3000/messages')
        console.log("Dữ liệu trả về:", res.data)
        email.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

onMounted(() => {
    readEmail()
})

</script>

<template>
    <div class="container mt-5">
        <h2 class="text-center fw-bold mb-4">Quản Lý Thông Báo</h2>

        <!-- Bảng sản phẩm -->
        <div class="table-responsive shadow-sm rounded-3">
            <table class="table table-bordered table-hover align-middle mb-0">
                <thead class="table-dark text-center">
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th>Email khách hàng</th>
                        <th>Tiêu đề</th>
                        <th>Nội dung</th>
                        <th>Ngày gửi</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody class="text-center">
                    <tr v-if="email.length" v-for="(i, index) in email" :key="i.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ i.from }}</td>
                        <td>{{ i.subject }}</td>
                        <td>{{ i.text }}</td>
                        <td>{{ i.createdAt }}</td>
                        <td>
                            <router-link class="btn btn-outline-info btn-sm me-2">
                                <i class="fa fa-eye"></i>
                            </router-link>
                            <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal"
                                data-bs-target="#deleteModal">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-else>
                        <td colspan="8" class="text-center text-muted py-3">
                            Chưa có thông báo nào
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal xác nhận xoá -->
        <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Xác nhận xoá</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <i class="fa fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                        <p>Bạn có chắc muốn xoá <strong></strong> không?</p>
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
h2 {
    color: #222;
    letter-spacing: 0.5px;
}

.table-hover tbody tr:hover {
    background-color: #f8f9fa;
    transition: 0.3s;
}

.modal-content {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
