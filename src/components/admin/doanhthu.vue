<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const totalRevenue = ref(0);
const totalOrders = ref(0);
const revenueData = ref({
  daily: {},
  weekly: {},
  monthly: {}
});
const chartRef = ref(null);
let chartInstance = null;
const selectedView = ref("monthly"); 

function getWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const yearStart = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + yearStart.getUTCDay() + 1) / 7);
  return weekNo;
}

const fetchOrders = async () => {
  try {
    const res = await axios.get("http://localhost:3000/order");
    const orders = res.data;

    const deliveredOrders = orders.filter(o => o.status === "Delivered");

    totalOrders.value = deliveredOrders.length;
    totalRevenue.value = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const grouped = { daily: {}, weekly: {}, monthly: {} };

    deliveredOrders.forEach(o => {
      const date = new Date(o.date);
      if (!isNaN(date)) {
        const dayKey = date.toLocaleDateString("vi-VN"); 
        grouped.daily[dayKey] = (grouped.daily[dayKey] || 0) + o.total;

        const week = getWeek(date);
        grouped.weekly[`Tuần ${week}`] = (grouped.weekly[`Tuần ${week}`] || 0) + o.total;

        const month = date.getMonth() + 1;
        grouped.monthly[`Tháng ${month}`] = (grouped.monthly[`Tháng ${month}`] || 0) + o.total;
      } else {
        console.warn("Ngày không hợp lệ:", o.date);
      }
    });

    revenueData.value = grouped;
    renderChart();
  } catch (err) {
    console.error("Lỗi lấy đơn hàng:", err);
  }
};

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();

  const dataObj = revenueData.value[selectedView.value];
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);

  const chartTitle = {
    daily: "Doanh thu theo ngày (VNĐ)",
    weekly: "Doanh thu theo tuần (VNĐ)",
    monthly: "Doanh thu theo tháng (VNĐ)"
  }[selectedView.value];

  chartInstance = new Chart(chartRef.value, {
    type: selectedView.value === "daily" ? "line" : "bar",
    data: {
      labels,
      datasets: [
        {
          label: chartTitle,
          data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          borderRadius: 10,
          tension: 0.3,
          fill: selectedView.value === "daily"
        }
      ]
    },
    options: {
      responsive: true,
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

watch(selectedView, () => renderChart());

onMounted(fetchOrders);
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold text-center mb-4">📊 Thống kê doanh thu</h2>

    <!-- Tổng quan -->
    <div class="row text-center mb-4">
      <div class="col-md-6 mb-3">
        <div class="card border-0 shadow-sm p-4 bg-success text-white rounded-4">
          <h5>Tổng doanh thu</h5>
          <h3 class="fw-bold">{{ totalRevenue.toLocaleString('vi-VN') }} ₫</h3>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card border-0 shadow-sm p-4 bg-primary text-white rounded-4">
          <h5>Tổng số đơn hàng giao thành công</h5>
          <h3 class="fw-bold">{{ totalOrders }}</h3>
        </div>
      </div>
    </div>

    <!-- Bộ lọc chế độ -->
    <div class="text-center mb-3">
      <select v-model="selectedView" class="form-select w-auto d-inline-block shadow-sm rounded-3">
        <option value="daily">Theo ngày</option>
        <option value="weekly">Theo tuần</option>
        <option value="monthly">Theo tháng</option>
      </select>
    </div>

    <!-- Biểu đồ -->
    <div class="card shadow-sm border-0 rounded-4 p-4">
      <h5 class="fw-semibold mb-3 text-center">
        {{ selectedView === 'daily' ? '🗓️ Biểu đồ doanh thu theo ngày' :
           selectedView === 'weekly' ? '📆 Biểu đồ doanh thu theo tuần' :
           '📅 Biểu đồ doanh thu theo tháng' }}
      </h5>
      <canvas ref="chartRef" height="120"></canvas>
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
select {
  border-color: #ffce00;
}
</style>
