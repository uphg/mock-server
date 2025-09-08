import Database from 'better-sqlite3'
import fs from 'fs'

// 创建测试数据库
const db = new Database('test-users.db')
db.pragma('journal_mode = WAL')

// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 插入测试数据
const insert = db.prepare(`
  INSERT INTO users (name, email, age, city) 
  VALUES (?, ?, ?, ?)
`)

const users = [
  ['张三', 'zhangsan@example.com', 25, '北京'],
  ['李四', 'lisi@example.com', 30, '上海'],
  ['王五', 'wangwu@example.com', 28, '广州'],
  ['赵六', 'zhaoliu@example.com', 35, '深圳'],
  ['钱七', 'qianqi@example.com', 22, '杭州']
]

users.forEach(user => insert.run(...user))

// 创建产品表
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    category TEXT,
    stock INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 插入产品数据
const insertProduct = db.prepare(`
  INSERT INTO products (name, price, category, stock) 
  VALUES (?, ?, ?, ?)
`)

const products = [
  ['iPhone 15', 5999, '手机', 100],
  ['MacBook Pro', 12999, '电脑', 50],
  ['iPad Air', 4599, '平板', 80],
  ['AirPods Pro', 1899, '耳机', 200],
  ['Apple Watch', 2999, '手表', 150]
]

products.forEach(product => insertProduct.run(...product))

db.close()

console.log('测试数据库创建完成')