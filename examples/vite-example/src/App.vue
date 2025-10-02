<template>
  <div id="app">
    <h1>Vite + Vue + Mockfly</h1>
    <div class="container">
      <div class="section">
        <h2>用户列表</h2>
        <button @click="fetchUsers" :disabled="loading.users">获取用户</button>
        <div v-if="loading.users" class="loading">加载中...</div>
        <div v-else-if="users.length > 0" class="data">
          <div v-for="user in users" :key="user.id" class="user-card">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <small>{{ user.company }}</small>
          </div>
        </div>
        <div v-else-if="error.users" class="error">{{ error.users }}</div>
      </div>

      <div class="section">
        <h2>产品列表</h2>
        <button @click="fetchProducts" :disabled="loading.products">获取产品</button>
        <div v-if="loading.products" class="loading">加载中...</div>
        <div v-else-if="products.length > 0" class="data">
          <div v-for="product in products" :key="product.id" class="product-card">
            <h3>{{ product.name }}</h3>
            <p>价格: ${{ product.price }}</p>
            <small>{{ product.category }}</small>
          </div>
        </div>
        <div v-else-if="error.products" class="error">{{ error.products }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const users = ref([])
    const products = ref([])
    const loading = ref({ users: false, products: false })
    const error = ref({ users: null, products: null })

    const fetchUsers = async () => {
      loading.value.users = true
      error.value.users = null
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('获取用户失败')
        users.value = await response.json()
      } catch (err) {
        error.value.users = err.message
      } finally {
        loading.value.users = false
      }
    }

    const fetchProducts = async () => {
      loading.value.products = true
      error.value.products = null
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('获取产品失败')
        products.value = await response.json()
      } catch (err) {
        error.value.products = err.message
      } finally {
        loading.value.products = false
      }
    }

    return {
      users,
      products,
      loading,
      error,
      fetchUsers,
      fetchProducts
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.loading {
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  background: #fdf2f2;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.data {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.user-card, .product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: left;
}

.user-card h3, .product-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-card p, .product-card p {
  margin: 5px 0;
  color: #666;
}

.user-card small, .product-card small {
  color: #999;
  font-size: 12px;
}
</style>