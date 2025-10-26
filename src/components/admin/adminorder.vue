<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const adminorder = ref([]);
const searchQuery = ref("");
const filterStatus = ref("");
const selectedId = ref(null)
const selectedName = ref("")

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const readorder = async () => {
    try {
        const res = await axios.get(`${API_URL}/order`, ngrokHeaderConfig);
        adminorder.value = res.data.filter(o => o.date).sort((a, b) => {
            const [timeA, dateA] = a.date.split(', ')
            const [timeB, dateB] = b.date.split(', ')
            const dA = new Date(`${dateA} ${timeA}`)
            const dB = new Date(`${dateB} ${timeB}`)
            return dB - dA
        })
    } catch (err) {
        console.error("Err: ", err);
    }
};

const askDelete = (id, name) => {
    selectedId.value = id
    selectedName.value = name
}

const deleteOrder = async () => {
    if (!selectedId.value) return
    try {
        await axios.delete(`${API_URL}/order/${selectedId.value}`, ngrokHeaderConfig)
        adminorder.value = adminorder.value.filter(c => c.id !== selectedId.value)
        selectedId.value = null
        selectedName.value = ""
        Swal.fire({
            icon: 'success',
            title: 'Xoá order thành công',
            text: `Bạn đã xoá order thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error('Err delete order: ', err)
    }
}

const filteredOrders = computed(() => {
    return adminorder.value.filter(order => {
        const matchSearch =
            order.fullname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            order.id.toString().includes(searchQuery.value);

        const matchStatus = filterStatus.value ? order.status === filterStatus.value : true;
        return matchSearch && matchStatus;
    });
});

onMounted(readorder);
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold text-center mb-4">📦 Quản Lý Đơn Hàng</h2>

        <!-- Bộ lọc -->
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div class="input-group" style="max-width: 300px;">
                <span class="input-group-text bg-white"><i class="fa fa-search"></i></span>
                <input v-model="searchQuery" type="text" class="form-control"
                    placeholder="Tìm kiếm theo tên hoặc mã đơn..." />
            </div>

            <select v-model="filterStatus" class="form-select" style="max-width: 200px;">
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Delivering">Delivering</option>
                <option value="Delivered">Delivered</option>
                <option value="Processing">Processing</option>
                <option value="Canceled">Canceled</option>
            </select>
        </div>

        <!-- Bảng đơn hàng -->
        <div class="table-responsive shadow-sm rounded-3 border">
            <table class="table align-middle mb-0">
                <thead class="table-dark text-nowrap">
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Email</th>
                        <th style="width: 10%;">Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Ngày đặt</th>
                        <th style="width: 10%;">Trạng thái</th>
                        <th style="width: 15%;" class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in filteredOrders" :key="order.id">
                        <td>#ODR2025-{{ order.id }}</td>
                        <td>{{ order.fullname }}</td>
                        <td>{{ order.email }}</td>
                        <td class="text-danger fw-semibold">{{ order.total.toLocaleString('vi-VN') }} ₫</td>
                        <td>{{ order.payment }}</td>
                        <td>{{ order.date }}</td>
                        <td>
                            <span class="badge px-3 py-2 rounded-2 text-nowrap" :class="{
                                'bg-warning text-dark': order.status === 'Pending',
                                'bg-info text-dark': order.status === 'Processing',
                                'bg-primary text-white': order.status === 'Confirmed',
                                'bg-success text-white': order.status === 'Delivered',
                                'bg-secondary text-white': order.status === 'Delivering',
                                'bg-danger text-white': order.status === 'Canceled' || order.status === 'Cancelled'
                            }">
                                {{ order.status }}
                            </span>
                        </td>
                        <td class="text-center">
                            <router-link class="btn btn-outline-info btn-sm me-2"
                                :to="`/admin/AdminOrderView/${order.id}`">
                                <i class="fa fa-eye"></i>
                            </router-link>
                            <button @click="askDelete(order.id, order.fullname)" class="btn btn-outline-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="fa fa-trash me-1"></i>
                            </button>
                        </td>
                    </tr>

                    <tr v-if="filteredOrders.length === 0">
                        <td colspan="8" class="text-center py-4 text-muted">
                            Không tìm thấy đơn hàng nào
                        </td>
                    </tr>
                </tbody>
            </table>

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
                            <button @click="deleteOrder" data-bs-dismiss="modal" class="btn btn-danger">Xoá</button>
                        </div>
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
