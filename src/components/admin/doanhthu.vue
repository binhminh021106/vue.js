<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const totalRevenue = ref(0);
const totalOrders = ref(0);
const monthlyRevenue = ref({});
const chartRef = ref(null);
let chartInstance = null;

const fetchOrders = async () => {
  try {
    const res = await axios.get("http://localhost:3000/order");
    const orders = res.data;

    const deliveredOrders = orders.filter(o => o.status === "Delivered");

    totalOrders.value = deliveredOrders.length;
    totalRevenue.value = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const grouped = {};
    deliveredOrders.forEach(o => {
      const datePart = o.date.split(" ")[1];
      const [day, month] = datePart.split("/");
      grouped[month] = (grouped[month] || 0) + o.total;
    });
    monthlyRevenue.value = grouped;

    renderChart();
  } catch (err) {
    console.error("Lỗi lấy đơn hàng:", err);
  }
};

const renderChart = () => {
  if (chartInstance) chartInstance.destroy();

  const labels = Object.keys(monthlyRevenue.value).map(m => `Tháng ${m}`);
  const data = Object.values(monthlyRevenue.value);

  chartInstance = new Chart(chartRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          borderRadius: 10
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

onMounted(fetchOrders);
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold text-center mb-4">📊 Thống kê doanh thu</h2>

    <div class="row text-center mb-5">
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

    <div class="card shadow-sm border-0 rounded-4 p-4">
      <h5 class="fw-semibold mb-3 text-center">Biểu đồ doanh thu theo tháng</h5>
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
</style>
