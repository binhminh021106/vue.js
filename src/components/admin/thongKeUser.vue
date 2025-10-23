<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const customers = ref([]);
const totalCustomers = ref(0);
const chartRef = ref(null);
let chartInstance = null;

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const fetchCustomerStats = async () => {
    try {
        const res = await axios.get(`${API_URL}/order`, ngrokHeaderConfig);
        const orders = res.data;

        const deliveredOrders = orders.filter(o => o.status === "Delivered");

        const customerMap = {};
        deliveredOrders.forEach(o => {
            const user = o.fullname || "Khách không tên";
            const total = o.total || 0;
            if (!customerMap[user]) {
                customerMap[user] = { fullname: user, totalSpent: 0, orders: 0 };
            }
            customerMap[user].totalSpent += total;
            customerMap[user].orders += 1;
        });

        const dataArr = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

        customers.value = dataArr;
        totalCustomers.value = dataArr.length;

        renderChart();
    } catch (err) {
        console.error("Lỗi lấy dữ liệu khách hàng:", err);
    }
};

const renderChart = () => {
    if (chartInstance) chartInstance.destroy();

    const top = customers.value.slice(0, 5);
    const labels = top.map(c => c.fullname);
    const data = top.map(c => c.totalSpent);

    chartInstance = new Chart(chartRef.value, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Tổng chi tiêu (VNĐ)",
                    data,
                    backgroundColor: "rgba(255, 206, 86, 0.6)",
                    borderColor: "rgba(255, 206, 86, 1)",
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => val.toLocaleString("vi-VN") + " ₫"
                    }
                }
            }
        }
    });
};

onMounted(fetchCustomerStats);
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold text-center mb-4">👥 Thống kê khách hàng & Chi tiêu</h2>

        <div class="row text-center mb-4">
            <div class="col-md-12 mb-3">
                <div class="card border-0 shadow-sm p-4 bg-info text-white rounded-4">
                    <h5>Tổng số khách hàng đã mua hàng</h5>
                    <h3 class="fw-bold">{{ totalCustomers }}</h3>
                </div>
            </div>
        </div>

        <!-- Biểu đồ top khách hàng -->
        <div class="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 class="fw-semibold text-center mb-3">🏆 Top 5 khách hàng chi tiêu nhiều nhất</h5>
            <canvas ref="chartRef" height="120"></canvas>
        </div>

        <!-- Bảng danh sách chi tiết -->
        <div class="card shadow-sm border-0 rounded-4 p-4">
            <h5 class="fw-semibold mb-3 text-center">📋 Danh sách chi tiêu của khách hàng</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle text-center">
                    <thead class="table-warning">
                        <tr>
                            <th>#</th>
                            <th>Tên khách hàng</th>
                            <th>Số đơn hàng</th>
                            <th>Tổng chi tiêu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(c, i) in customers" :key="i">
                            <td>{{ i + 1 }}</td>
                            <td>{{ c.fullname }}</td>
                            <td>{{ c.orders }}</td>
                            <td>{{ c.totalSpent.toLocaleString('vi-VN') }} ₫</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    transition: 0.3s ease;
}

.card:hover {
    transform: translateY(-3px);
}

th {
    background-color: #ffe066 !important;
}
</style>
