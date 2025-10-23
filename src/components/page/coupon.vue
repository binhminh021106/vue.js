<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};
const isLoading = ref(true)

const copiedCode = ref(null);
const coupons = ref([])

const readCoupon = async () => {
    isLoading.value = true;
    try {
        const res = await axios.get(`${API_URL}/coupon`, ngrokHeaderConfig)
        coupons.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    } finally {
        isLoading.value = false;
    }
}

const copyCode = async (code) => {
    try {
        await navigator.clipboard.writeText(code);
        copiedCode.value = code;
        setTimeout(() => (copiedCode.value = null), 2000);
    } catch (err) {
        console.error("Failed to copy code: ", err);
    }
};

onMounted(readCoupon)
</script>

<template>
    <div class="coupon-section-wrapper">
        <div class="container">
            <CouponSkeleton v-if="isLoading" />

            <div v-else-if="!isLoading && coupons.length > 0" class="coupons-grid">
                <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
                    <div class="coupon-icon">
                        <i v-if="coupon.icon === 'giam%'" class="fa-solid fa-percent"></i>
                        <i v-else-if="coupon.icon === 'giamthang'" class="fa-solid fa-tags"></i>
                        <i v-else-if="coupon.icon === 'giamdacbiet'" class="fa-solid fa-star"></i>
                    </div>
                    <div class="coupon-info">
                        <div class="discount">{{ coupon.title }}</div>
                        <div class="condition">Minimum order: {{ Number(coupon.condition).toLocaleString('vi-VN') }} ₫
                        </div>
                        <div class="expiry">
                            <i class="fa-regular fa-clock"></i>Expires: {{ coupon.expiry }}
                        </div>
                    </div>
                    <div class="coupon-action">
                        <button class="copy-btn" :class="{ copied: copiedCode === coupon.code }"
                            @click="copyCode(coupon.code)">
                            {{ copiedCode === coupon.code ? "Copied!" : "Get Code" }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="text-center text-muted py-5">
                <i class="fa-regular fa-face-frown"></i> There are no coupon codes.
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");


.container {
    max-width: 1200px;
    margin: 0 auto;
}

.coupon-section-wrapper {
    /* --- BỘ MÀU MỚI CHO GIAO DIỆN SÁNG --- */
    --page-bg: #f4f6f8;
    /* Nền trang màu xám nhạt (giống hình) */
    --card-bg: #ffffff;
    /* Nền coupon màu trắng (giống hình) */
    --text-primary: #212529;
    /* Chữ chính màu đen đậm */
    --text-secondary: #6c757d;
    /* Chữ phụ màu xám */
    --accent-primary: #000000;
    /* Màu nút chính (xanh) */
    --accent-primary-hover: #000000;
    /* Màu nút khi hover */
    --accent-secondary: #ffffff;
    /* Màu nhấn phụ (cam cho icon) */

    /* Giữ nguyên các thuộc tính cũ */
    font-family: "Be Vietnam Pro", sans-serif;
    background-color: var(--page-bg);
    padding: 25px 15px;
    border-radius: 10px;
}

/* --- Coupons grid --- */
.coupons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
}

/* --- Coupon card --- */
.coupon-card {
    background-color: var(--card-bg);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    border-radius: 10px;
    padding: 8px 12px;
    position: relative;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    border: 1px solid #444957;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    min-height: 70px;
}

.coupon-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.25);
}

/* --- Decorative edges --- */
.coupon-card::before,
.coupon-card::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    background-color: var(--page-bg);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
}

.coupon-card::before {
    left: -9px;
}

.coupon-card::after {
    right: -9px;
}

/* --- Icon --- */
.coupon-icon {
    background-color: var(--accent-secondary);
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-right: 10px;
    border: 2px solid var(--card-bg);
}

.coupon-icon i {
    font-size: 16px;
}

/* --- Info section --- */
.coupon-info {
    flex-grow: 1;
    line-height: 1.2;
}

.coupon-info .discount {
    font-size: 15px;
    font-weight: 600;
}

.coupon-info .condition {
    font-size: 12px;
    color: var(--text-secondary);
}

.coupon-info .expiry {
    font-size: 11px;
    margin-top: 3px;
    color: var(--text-secondary);
}

.coupon-info .expiry i {
    margin-right: 4px;
}

/* --- Copy button --- */
.coupon-action {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
    border-left: 2px dashed rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
}

.copy-btn {
    background-color: var(--accent-primary);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    white-space: nowrap;
}

.copy-btn:hover {
    background-color: var(--accent-primary-hover);
    transform: scale(1.05);
}

.copy-btn.copied {
    background-color: var(--accent-secondary);
}

/* --- Responsive --- */
@media (max-width: 480px) {
    .coupon-card {
        padding: 8px 10px;
        min-height: 64px;
    }

    .coupon-icon {
        width: 32px;
        height: 32px;
    }

    .coupon-info .discount {
        font-size: 14px;
    }

    .copy-btn {
        padding: 5px 10px;
        font-size: 12px;
    }
}
</style>
