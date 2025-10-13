<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const product = ref(null)
const route = useRoute()
const router = useRouter()
const categories = ref([])
const userQuantity = ref(1)
const relatedProducts = ref([])

const readProductDetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

const readCategories = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/categories`)
        categories.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

const readRelatedProducts = async () => {
    try {
        if (!product.value) return
        const res = await axios.get(`http://localhost:3000/products?categoryId=${product.value.categoryId}&_limit=4`)
        relatedProducts.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const addtocart = async (product) => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))

    if (!user) {
        Swal.fire({
            icon: "warning",
            title: "Please log in",
            text: "You must be logged in to add products to your cart.",
            confirmButtonColor: "#000"
        })
        router.push("/login")
        return
    }

    try {
        const { data: cart } = await axios.get(`http://localhost:3000/cart?userId=${user.id}`)
        const existingItem = cart.find(item => item.productId === product.id)

        if (existingItem) {
            await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
                quantity: existingItem.quantity + 1
            })
        } else {
            await axios.post("http://localhost:3000/cart", {
                userId: user.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount,
                image: product.image[0],
                quantity: 1
            })
        }

        Swal.fire({
            icon: 'success',
            title: 'Product added to cart',
            text: 'Your product has been added to your cart successfully!',
            showConfirmButton: false,
            timer: 1500
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

const decrease = () => {
    if (userQuantity.value > 1) userQuantity.value--
}

const increase = () => {
    if (userQuantity.value < 100) userQuantity.value++
}

onMounted(async () => {
    await readProductDetail()
    await readCategories()
    await readRelatedProducts()
})
</script>

<template>
    <div v-if="product" class="container my-5">
        <div class="row g-4">
            <!-- Hình ảnh & thông tin chi tiết -->
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image[0]" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2">
                        <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="img-thumbnail small-img"
                            alt="gallery" />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3">
                    <h2 class="fw-bold mb-2">{{ product.name }}</h2>

                    <p class="text-muted mb-1">
                        Category:
                        {{categories.find(c => c.id === product.categoryId)?.nameCategory || "Không có"}}
                    </p>

                    <div class="mb-3">
                        <span class="text-muted text-decoration-line-through me-2">
                            {{ Number(product.price).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="fw-bold text-danger fs-4">
                            {{ Number(product.discount).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="badge bg-success ms-2">
                            -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
                        </span>
                    </div>

                    <p class="text-secondary">
                        Đôi giày huyền thoại mang phong cách cổ điển, chất liệu da cao cấp,
                        đế cao su chống trơn trượt. Phù hợp cho mọi phong cách thời trang.
                    </p>

                    <div class="mt-4">
                        <p class="fw-semibold mb-2">Choose Quantity:</p>
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button @click="decrease(product)" class="btn btn-outline-dark">-</button>
                            <input v-model="userQuantity" type="number" class="form-control text-center" min="1"
                                max="100" />
                            <button @click="increase(product)" class="btn btn-outline-dark">+</button>
                        </div>
                    </div>

                    <div class="mt-4 d-flex gap-3">
                        <button @click="addtocart(product)" class="btn btn-dark px-4 py-2">
                            <i class="fa fa-shopping-cart me-2"></i>Add to cart
                        </button>
                        <button class="btn btn-outline-danger px-4 py-2">
                            <i class="fa fa-heart me-2"></i>Favorite
                        </button>
                    </div>

                    <hr class="my-4" />

                    <div>
                        <h5 class="fw-bold mb-2">Description</h5>
                        <p class="text-muted">
                            {{ product.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="related-products mt-5 pt-4 border-top">
            <h4 class="fw-bold mb-4 text-center">Related Products</h4>

            <div v-if="relatedProducts.length > 0" class="row g-4 justify-content-center">
                <div v-for="items in relatedProducts" :key="items.id" class="col-md-3 col-sm-6">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                        <img :src="items.image[0]" class="card-img-top" :alt="items.name"
                            style="height: 220px; object-fit: cover;" />
                        <div class="card-body text-center">
                            <h6 class="fw-semibold mb-1">{{ items.name }}</h6>
                            <p class="text-danger fw-bold mb-2"> {{ Number(items.discount).toLocaleString('vi-VN') }} ₫
                            </p>
                            <router-link :to="`/productDetail/${items.id}`" class="btn btn-outline-dark btn-sm w-100">
                                <i class="fa fa-shopping-cart me-2"></i>View Details
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center text-muted mt-5">No related products</div>
        </div>
    </div>

    <p v-else class="text-center text-muted mt-5">Loading Product...</p>
</template>

<style scoped>
.main-img {
    height: 400px;
    object-fit: cover;
}

.small-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

button.btn-outline-dark:hover {
    background-color: #000;
    color: #fff;
    transition: 0.3s;
}

.related-products {
    background-color: #fafafa;
    padding-bottom: 40px;
    border-radius: 10px;
}

.hover-card {
    transition: all 0.3s ease;
}

.hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
