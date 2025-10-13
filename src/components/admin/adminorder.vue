    <script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';

    const adminorder = ref([]);

    const translateStatus = (status) => {
        switch (status) {
            case 'Pending': return 'Đang chờ';
            case 'Processing': return 'Đang xử lý';
            case 'Delivered': return 'Đã giao';
            case 'Cancelled': return 'Đã hủy';
            default: return status || 'Không rõ';
        }
    };

    const readorder = async () => {
        try {
            const res = await axios.get('http://localhost:3000/order');
            adminorder.value = res.data;
        } catch (err) {
            console.error("Err: ", err);
        }
    };

    onMounted(readorder);
</script>

    <template>
        <div class="container my-5">
            <h2 class="fw-bold text-center mb-4">📦 Quản Lý Đơn Hàng</h2>

            <!-- Bộ lọc -->
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div class="input-group" style="max-width: 300px;">
                    <span class="input-group-text bg-white"><i class="fa fa-search"></i></span>
                    <input type="text" class="form-control" placeholder="Tìm kiếm theo tên hoặc mã đơn..." />
                </div>

                <select class="form-select" style="max-width: 200px;">
                    <option value="">Tất cả trạng thái</option>
                    <option>Đã giao</option>
                    <option>Đang xử lý</option>
                    <option>Đang chờ</option>
                    <option>Đã hủy</option>
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
                        <tr v-for="order in adminorder" :key="order.id">
                            <td>#ODR2025-{{ order.id }}</td>
                            <td>{{ order.fullname }}</td>
                            <td>{{ order.email }}</td>
                            <td class="text-danger fw-semibold">{{ order.total.toLocaleString('vi-VN') }} ₫</td>
                            <td>{{ order.payment }}</td>
                            <td>{{ order.date }}</td>
                            <td>
                                <span class="badge px-3 py-2 rounded-2" :class="{
                                    'bg-success': order.status === 'Delivered',
                                    'bg-warning text-dark': order.status === 'Pending',
                                    'bg-info text-dark': order.status === 'Processing',
                                    'bg-danger': order.status === 'Cancelled',
                                }">
                                    {{ translateStatus(order.status) }}
                                </span>
                            </td>
                            <td class="text-center">
                                <router-link class="btn btn-outline-info btn-sm me-2"
                                    :to="`/admin/AdminOrderView/${order.id}`"><i class="fa fa-eye"></i></router-link>
                                <button class="btn btn-outline-danger btn-sm">
                                    <i class="fa fa-trash me-1"></i>
                                </button>
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
