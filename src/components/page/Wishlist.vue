<script setup>
import { ref, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const myWishlist = ref([])
const router = useRouter()
const category = ref([])

const readWishlist = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("loggedInUser"))
        if (!user) {
            router.push("/NotFound")
            console.log("No user login")
            return
        }

        const res = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`)
        myWishlist.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const readCategory = async () => {
    try {
        const res = await axios.get('http://localhost:3000/categories')
        category.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const removeWishlist = async (id) => {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to remove this product from your wishlist?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/wishlist/${id}`)
                myWishlist.value = myWishlist.value.filter(u => u.id !== id)
                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'The product has been removed from your wishlist.',
                    timer: 1300,
                    showConfirmButton: "OK",
                    confirmButtonColor: '#000'
                })
            } catch (err) {
                console.error("Err: ", err)
            }
        }
    })
}

const addtocart = async (wishlistItem) => {
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
        const prodId = wishlistItem.productId ?? wishlistItem.id
        
        let fullProduct = null
        try {
            const pRes = await axios.get(`http://localhost:3000/products/${prodId}`)
            fullProduct = pRes.data
        } catch (err) {
            fullProduct = null
        }

        const { data: cart } = await axios.get(`http://localhost:3000/cart?userId=${user.id}`)
        const existingItem = cart.find(item => String(item.productId) === String(prodId))

        let categoryName = "Unknown"
        if (fullProduct && (fullProduct.categoryId || fullProduct.categoryId === 0)) {
            const catObj = category.value.find(c => String(c.id) === String(fullProduct.categoryId))
            categoryName = catObj ? (catObj.nameCategory || catObj.name) : categoryName
        } else if (wishlistItem.category) {
            categoryName = wishlistItem.category
        }

        const imageToSave = fullProduct?.image?.[0] ?? (Array.isArray(wishlistItem.image) ? wishlistItem.image[0] : wishlistItem.image ?? "")

        const priceToSave = fullProduct?.price ?? wishlistItem.price ?? 0
        const discountToSave = fullProduct?.discount ?? wishlistItem.discount ?? priceToSave

        if (existingItem) {
            await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
                quantity: existingItem.quantity + 1
            })
        } else {
            await axios.post("http://localhost:3000/cart", {
                userId: user.id,
                productId: prodId,
                name: fullProduct?.name ?? wishlistItem.name ?? "Unknown product",
                category: categoryName,
                price: priceToSave,
                discount: discountToSave,
                image: imageToSave,
                quantity: 1
            })
        }

        Swal.fire({
            icon: 'success',
            title: 'Product added to cart',
            text: 'Your product has been added to your cart successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#000',
            timer: 1500
        })
    } catch (err) {
        console.error("Err: ", err)
    }
}

onMounted(async () => {
    await readWishlist()
    await readCategory()
})
</script>

<template>
    <div class="container py-5">
        <h2 class="fw-bold mb-5 text-center text-uppercase tracking-wide">💖 My Wishlist</h2>

        <div v-if="myWishlist.length > 0" class="row g-4 justify-content-center">
            <div class="col-lg-3 col-md-4 col-sm-6" v-for="items in myWishlist" :key="items.id">
                <div class="card wishlist-card border-0 rounded-4 shadow-sm overflow-hidden">
                    <div class="wishlist-img-wrapper position-relative">
                        <img :src="items.image" :alt="items.name" class="wishlist-img" />
                        <span v-if="items.discount < items.price"
                            class="badge discount-badge position-absolute top-0 start-0 m-2 px-2 py-1">
                            -{{ Math.round(100 - (items.discount / items.price) * 100) }}%
                        </span>
                    </div>

                    <div class="card-body d-flex flex-column p-3">
                        <h5 class="card-title fw-semibold mb-1 text-truncate text-dark">
                            {{ items.name }}
                        </h5>
                        <template v-if="items.discount < items.price">
                            <p class="text-muted text-decoration-line-through small mb-1">
                                {{ Number(items.price).toLocaleString('vi-VN') }} ₫
                            </p>
                            <p class="fw-bold mb-1 text-danger">
                                {{ Number(items.discount).toLocaleString('vi-VN') }} ₫
                            </p>
                        </template>

                        <div class="mt-auto d-flex gap-2">
                            <button @click="addtocart(items)"
                                class="btn btn-dark flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                                <i class="fa fa-shopping-cart"></i>
                                <span>Add to Cart</span>
                            </button>
                            <button @click="removeWishlist(items.id)"
                                class="btn btn-light border shadow-sm rounded-circle p-2">
                                <i class="fa fa-trash text-danger"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center text-muted mt-5">
            <i class="fa fa-heart-broken fs-1 mb-3"></i>
            <p>Your wishlist is empty. Start adding some favorites!</p>
        </div>
    </div>
</template>

<style scoped>
/* ======= Layout ======= */
.container {
    max-width: 1100px;
}

/* ======= Card ======= */
.wishlist-card {
    background: #fff;
    transition: all 0.3s ease;
    border-radius: 1.2rem;
}

.wishlist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* ======= Image ======= */
.wishlist-img-wrapper {
    height: 230px;
    overflow: hidden;
}

.wishlist-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.wishlist-card:hover .wishlist-img {
    transform: scale(1.07);
}

/* ======= Discount Badge ======= */
.discount-badge {
    background: linear-gradient(45deg, #ff4b2b, #ff416c);
    color: #fff;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* ======= Buttons ======= */
.btn-dark {
    background: linear-gradient(90deg, #000, #333);
    border: none;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.btn-dark:hover {
    background: linear-gradient(90deg, #333, #000);
    transform: translateY(-2px);
}

.btn-light {
    background: #fff;
    transition: 0.3s ease;
}

.btn-light:hover {
    background: #f8f8f8;
    transform: scale(1.1);
}

/* ======= Empty state ======= */
.text-muted i {
    color: #aaa;
}

.text-muted p {
    font-size: 1.1rem;
}

/* ======= Responsive ======= */
@media (max-width: 768px) {
    .wishlist-img-wrapper {
        height: 180px;
    }

    .card-title {
        font-size: 1rem;
    }
}
</style>
