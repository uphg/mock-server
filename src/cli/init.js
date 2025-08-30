import fs from 'fs'
import path from 'path'

const SAMPLE_CONFIG = {
  "port": 3000,
  "baseUrl": "http://localhost:3000",
  "mockDir": "./data",
  "cors": {
    "origin": "*",
    "credentials": true
  },
  "routes": [
    {
      "path": "/api/users",
      "method": "GET",
      "response": {
        "data": "{{file:users.json}}"
      }
    },
    {
      "path": "/api/users/:id",
      "method": "GET",
      "response": {
        "data": "{{file:users.json}}",
        "filter": "id === {{params.id}}"
      }
    },
    {
      "path": "/api/products",
      "method": "GET",
      "response": {
        "data": "{{file:products.json}}"
      }
    },
    {
      "path": "/api/products/:id",
      "method": "GET",
      "response": {
        "data": "{{file:product-detail.json}}",
        "filter": "id === {{params.id}}"
      }
    },
    {
      "path": "/api/products",
      "method": "POST",
      "response": {
        "status": 201,
        "data": {
          "id": "{{random.uuid}}",
          "name": "{{body.name}}",
          "price": "{{body.price}}",
          "createdAt": "{{date.now}}"
        }
      }
    }
  ]
}

const SAMPLE_USERS = [
  {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 28,
    "city": "北京"
  },
  {
    "id": 2,
    "name": "李四",
    "email": "lisi@example.com",
    "age": 32,
    "city": "上海"
  },
  {
    "id": 3,
    "name": "王五",
    "email": "wangwu@example.com",
    "age": 25,
    "city": "广州"
  }
]

const SAMPLE_PRODUCTS = [
  {
    "id": 1,
    "name": "iPhone 15",
    "price": 5999,
    "category": "手机",
    "stock": 100
  },
  {
    "id": 2,
    "name": "MacBook Pro",
    "price": 12999,
    "category": "电脑",
    "stock": 50
  },
  {
    "id": 3,
    "name": "AirPods Pro",
    "price": 1999,
    "category": "耳机",
    "stock": 200
  }
]

const SAMPLE_PRODUCT_DETAIL = [
  {
    "id": 1,
    "name": "iPhone 15",
    "price": 5999,
    "category": "手机",
    "description": "最新款iPhone，搭载A17芯片，支持5G网络",
    "specs": {
      "screen": "6.1英寸",
      "storage": "128GB",
      "color": "午夜色"
    },
    "stock": 100,
    "reviews": [
      {
        "userId": 1,
        "rating": 5,
        "comment": "非常好用，拍照效果很棒！"
      }
    ]
  },
  {
    "id": 2,
    "name": "MacBook Pro",
    "price": 12999,
    "category": "电脑",
    "description": "专业级笔记本电脑，搭载M3芯片",
    "specs": {
      "screen": "14英寸",
      "memory": "16GB",
      "storage": "512GB SSD"
    },
    "stock": 50,
    "reviews": [
      {
        "userId": 2,
        "rating": 4,
        "comment": "性能强劲，但价格偏高"
      }
    ]
  }
]

export async function initCommand(options) {
  const targetDir = path.resolve(options.dir)
  const dataDir = path.join(targetDir, 'data')
  const configPath = path.join(targetDir, 'mock.config.json')

  console.log('🚀 Initializing mock server...')

  try {
    // Create data directory
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log('✅ Created data directory')
    } else {
      console.log('📁 Data directory already exists')
    }

    // Create mock.config.json
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(SAMPLE_CONFIG, null, 2))
      console.log('✅ Created mock.config.json')
    } else {
      console.log('📄 mock.config.json already exists')
    }

    // Create sample data files
    const usersPath = path.join(dataDir, 'users.json')
    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify(SAMPLE_USERS, null, 2))
      console.log('✅ Created users.json')
    }

    const productsPath = path.join(dataDir, 'products.json')
    if (!fs.existsSync(productsPath)) {
      fs.writeFileSync(productsPath, JSON.stringify(SAMPLE_PRODUCTS, null, 2))
      console.log('✅ Created products.json')
    }

    const productDetailPath = path.join(dataDir, 'product-detail.json')
    if (!fs.existsSync(productDetailPath)) {
      fs.writeFileSync(productDetailPath, JSON.stringify(SAMPLE_PRODUCT_DETAIL, null, 2))
      console.log('✅ Created product-detail.json')
    }

    const packageJsonPath = path.join(targetDir, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        packageJson.scripts = packageJson.scripts || {}

        // 添加脚本（如果不存在）
        let scriptsAdded = false
        if (!packageJson.scripts['mock:start']) {
          packageJson.scripts['mock:start'] = 'mock-server start --dev'
          scriptsAdded = true
        }
        if (!packageJson.scripts['mock:docs']) {
          packageJson.scripts['mock:docs'] = 'mock-server docs --dev'
          scriptsAdded = true
        }

        if (scriptsAdded) {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
          console.log('✅ 已添加 package.json 脚本')
        } else {
          console.log('📄 package.json 脚本已存在')
        }
      } catch (error) {
        console.warn('⚠️  添加 package.json 脚本失败:', error.message)
      }
    } else {
      console.log('ℹ️  未找到 package.json，跳过添加脚本')
    }

    console.log('\n🎉 Mock server initialized successfully!')
    console.log('\nNext steps:')
    console.log('  1. Run "mock-server start" to start the server')
    console.log('  2. Run "mock-server docs --dev" to start documentation server')
    console.log('  3. Visit http://localhost:3000/api/users to test the API')

  } catch (error) {
    console.error('❌ Error initializing mock server:', error.message)
    process.exit(1)
  }
}