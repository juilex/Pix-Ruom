export const ImageHelper = {
  /**
   * 复制图片链接到剪贴板
   * @param {string} url - 图片URL
   * @param {string} filename - 文件名
   * @param {string} format - 复制格式 ('url'|'md'|'html')
   */
  async copyImageUrl(url, filename, format) {
    try {
      let copyText = url
      switch(format) {
        case 'md':
          copyText = `![${filename}](${url})`
          break
        case 'html':
          copyText = `<img src="${url}" alt="${filename}" />`
          break
        default:
          copyText = url
      }
      await navigator.clipboard.writeText(copyText)
      ElMessage.success('链接已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
    }
  },

  /**
   * 删除图片
   * @param {Object} storage - 存储实例
   * @param {Object} image - 图片对象
   * @param {Function} onSuccess - 删除成功的回调
   * @param {string} selector - 可选，用于查找图片元素的选择器
   */
  async deleteImage(storage, image, onSuccess, selector) {
    try {
      await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      if (image.key) {
        await storage.delete(image.key)
      }
      ElMessage.success('删除成功')
      onSuccess && onSuccess()

    } catch (err) {
      if (err !== 'cancel') {
        ElMessage.error('删除失败：' + err.message)
      }
    }
  },

  /**
   * 批量清除图片
   * @param {Function} onSuccess - 清除成功的回调
   */
  clearImages(onSuccess) {
    onSuccess && onSuccess()
    ElMessage.success('已清除所有图片')
  }
} 