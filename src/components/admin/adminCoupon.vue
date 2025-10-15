<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const selectedCode = ref("")
const selectedId = ref(null)
const coupon = ref([])
const form = ref({ icon: "", title: "", discount: "", condition: "", expiry: "", code: "" })

const readCoupon = async () => {
    try {
        const res = await axios.get('http://localhost:3000/coupon')
        coupon.value = res.data
    } catch (err) {
        console.error('err: ', err)
    }
}

const askDelete = (id, code) => {
    selectedId.value = id
    selectedCode.value = code
}

const confirmDelete = async () => {
    if (!selectedId.value) return
    try {
        await axios.delete(`http://localhost:3000/coupon/${selectedId.value}`)
        coupon.value = coupon.value.filter(c => c.id !== selectedId.value)
        selectedId.value = null
        selectedCode.value = ""
        Swal.fire({
            icon: 'success',
            title: 'Xoá mã giảm giá thành công',
            text: `Bạn đã xoá mã giảm giá thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("err: ", err)
    }
}

const addCoupon = async () => {
    if (!form.value.icon || !form.value.discount || !form.value.condition || !form.value.expiry || !form.value.code || !form.value.title) {
        Swal.fire({
            icon: 'warning',
            title: 'Bạn nhập thiếu thông tin',
            text: `Vui lòng bạn kiểm tra lại thông tin`,
            showConfirmButton: false,
            timer: 2000
        })
        return
    }

    try {
        const res = await axios.post('http://localhost:3000/coupon', form.value)
        coupon.value.push(res.data)
        Swal.fire({
            icon: 'success',
            title: 'Thêm mã giảm giá thành công',
            text: `Bạn đã thêm mã giảm giá thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
        resetForm()
    } catch (err) {
        console.error("Err: ", err)
    }
}

const askEdit = (item) => {
    selectedId.value = item.id
    form.value = {
        icon: item.icon,
        title: item.title,
        discount: item.discount,
        condition: item.condition,
        expiry: item.expiry,
        code: item.code
    }
}

const editCoupon = async () => {
    if (!selectedId.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Bạn nhập thiếu thông tin',
            text: `Vui lòng bạn kiểm tra lại thông tin`,
            showConfirmButton: false,
            timer: 2000
        })
        return
    }

    try {
        const res = await axios.put(`http://localhost:3000/coupon/${selectedId.value}`, form.value)

        const index = coupon.value.findIndex((p) => p.id === selectedId.value)
        if (index !== -1) {
            coupon.value[index] = res.data
        }

        Swal.fire({
            icon: 'success',
            title: 'Cập nhật mã giảm giá thành công',
            text: `Bạn đã cập nhật mã giảm giá thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
        selectedId.value = null
        resetForm()
    } catch (err) {
        console.error("Err: ", err)
    }
}

const resetForm = () => {
    form.value = {
        icon: "",
        title: "",
        discount: "",
        condition: "",
        expiry: "",
        code: "",
    }
    selectedId.value = null
    selectedCode.value = ""
}

onMounted(() => {
    readCoupon()
})

</script>

<template>
    <div class="container mt-5">
        <h2 class="text-center fw-bold mb-4">Quản Lý Mã Giảm Giá</h2>

        <!-- Nút thêm sản phẩm -->
        <div class="text-end mb-3">
            <button class="btn btn-dark px-3" data-bs-toggle="modal" data-bs-target="#addProductModal">
                <i class="fa fa-plus me-1"></i> Thêm mã giảm giá
            </button>
        </div>

        <!-- Bảng sản phẩm -->
        <div class="table-responsive shadow-sm rounded-3">
            <table class="table table-bordered table-hover align-middle mb-0">
                <thead class="table-dark text-center">
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th>Icon</th>
                        <th>Mã giảm giá</th>
                        <th>Giảm giá</th>
                        <th>Tiêu đề</th>
                        <th>Đơn tối thiểu</th>
                        <th>Ngày hết hạn</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody class="text-center">
                    <tr v-if="coupon.length" v-for="items, index in coupon" :key="items.id">
                        <td>{{ index + 1 }}</td>
                        <td class="coupon-icon">
                            <i v-if="items.icon === 'giam%'" class="fa-solid fa-percent"></i>
                            <i v-else-if="items.icon === 'giamthang'" class="fa-solid fa-tags"></i>
                            <i v-else-if="items.icon === 'giamdacbiet'" class="fa-solid fa-star"></i>
                        </td>
                        <td>{{ items.code }}</td>
                        <td>{{ items.discount }}</td>
                        <td>{{ items.title }}</td>
                        <td>{{ Number(items.condition).toLocaleString('vi-VN') }} ₫</td>
                        <td>{{ items.expiry }}</td>
                        <td>
                            <button @click="askEdit(items)" class="btn btn-outline-warning btn-sm me-2"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button @click="askDelete(items.id, items.code)" class="btn btn-outline-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-else>
                        <td colspan="8" class="text-center text-muted py-3">
                            Chưa có mã giảm giá nào
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal thêm sản phẩm -->
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">Thêm mã giảm giá mới</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Mã giảm giá</label>
                                    <input v-model="form.code" type="text" class="form-control"
                                        placeholder="Nhập mã giảm giá (VD: TECH12K)" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Tiêu đề</label>
                                    <input v-model="form.title" type="text" class="form-control"
                                        placeholder="Nhập tiêu đề" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giảm giá</label>
                                    <input v-model="form.discount" type="text" class="form-control"
                                        placeholder="Nhập giá bạn muốn giảm (VD: 100K hoặc 10%)" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Đơn tối thiểu</label>
                                    <input v-model="form.condition" type="number" class="form-control"
                                        placeholder="Nhập giá đơn tối thiểu" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Ngày hết hạn</label>
                                    <input v-model="form.expiry" type="date" class="form-control" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Chọn phương thức giảm giá</label>
                                     <select v-model="form.icon" class="form-select">
                                        <option disabled value="">-- Chọn phương thức giảm giá --</option>
                                        <option value="giam%">Giảm giá theo %</option>
                                        <option value="giamthang">Giảm giá thẳng</option>
                                        <option value="giamdacbiet">Giảm giá đặc biệt</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button @click="addCoupon" data-bs-dismiss="modal" type="button" class="btn btn-dark">Lưu mã
                            giảm giá</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal sửa sản phẩm -->
        <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-warning text-white">
                        <h5 class="modal-title">Sửa thông tin mã giảm giá</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Mã giảm giá</label>
                                    <input v-model="form.code" type="text" class="form-control"
                                        placeholder="Nhập mã giảm giá (VD: TECH12K)" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Tiêu đề</label>
                                    <input v-model="form.title" type="text" class="form-control"
                                        placeholder="Nhập tiêu đề" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giảm giá</label>
                                    <input v-model="form.discount" type="text" class="form-control"
                                        placeholder="Nhập tiêu đề" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Đơn tối thiểu</label>
                                    <input v-model="form.condition" type="number" class="form-control"
                                        placeholder="Nhập giá đơn tối thiểu" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Ngày hết hạn</label>
                                    <input v-model="form.expiry" type="date" class="form-control" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Phương thức giảm giá</label>
                                    <select v-model="form.icon" class="form-select">
                                        <option disabled value="">-- Chọn phương thức giảm giá --</option>
                                        <option value="giam%">Giảm giá theo %</option>
                                        <option value="giamthang">Giảm giá thẳng</option>
                                        <option value="giamdacbiet">Giảm giá đặc biệt</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0">
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button @click="editCoupon" class="btn btn-warning text-white" data-bs-dismiss="modal">Lưu thay
                            đổi</button>
                    </div>
                </div>
            </div>
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
                        <p>Bạn có chắc muốn xoá mã giảm giá <strong>{{ selectedCode }}</strong> không?</p>
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
