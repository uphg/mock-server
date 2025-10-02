const contentTypes = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.json': 'application/json'
}

/**
 * 根据文件扩展名获取 MIME 类型
 * @param {string} ext - 文件扩展名
 * @returns {string} MIME 类型
 */
export function getContentType(ext) {
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream'
}

// 自动检测 blob 文件类型
export const blobExtensions = ['.xlsx', '.xls', '.docx', '.doc', '.pdf', '.zip', '.png', '.jpg', '.jpeg', '.gif', '.txt']