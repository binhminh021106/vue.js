<template>
    <div class="container text-center py-5">
        <div class="success-card shadow-sm p-5 mx-auto mt-5">
            <div class="check-icon mb-4">
                <i class="fa-solid fa-circle-check text-success fa-4x"></i>
            </div>

            <h2 class="fw-bold mb-3">Order Placed Successfully 🎉</h2>
            <p class="text-muted mb-4">
                Thank you for shopping with <b>OutfitVN</b>!
                Your order is being processed.
                We'll send you the shipping details to your email soon.
            </p>

            <div class="order-summary text-start bg-light p-4 rounded-4 mx-auto mb-4">
                <h5 class="fw-semibold mb-3">Order Information</h5>
                <div class="d-flex justify-content-between mb-2">
                    <span>Order ID:</span>
                    <span><b>#ODR2025-001</b></span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Total Amount:</span>
                    <span class="text-danger fw-bold">2,350,000 ₫</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Payment Method:</span>
                    <span>Cash on Delivery (COD)</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Order Date:</span>
                    <span>October 9, 2025</span>
                </div>
            </div>

            <div class="d-flex justify-content-center gap-3">
                <router-link to="/" class="btn btn-dark px-4">
                    <i class="fa fa-home me-2"></i>Back to Home
                </router-link>
                <router-link to="/profile" class="btn btn-outline-dark px-4">
                    <i class="fa fa-box me-2"></i>View Orders
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.success-card {
    max-width: 600px;
    background-color: #fff;
    border-radius: 16px;
    animation: fadeInUp 0.6s ease;
}

.check-icon {
    animation: popIn 0.5s ease;
}

.order-summary {
    max-width: 450px;
    margin: 0 auto;
    font-size: 0.95rem;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes popIn {
    from {
        transform: scale(0.5);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.btn {
    border-radius: 10px;
    transition: 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}
</style>
