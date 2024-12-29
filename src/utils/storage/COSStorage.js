import COS from 'cos-js-sdk-v5'
import { BaseStorage } from './BaseStorage'

/**
 * 腾讯云COS存储适配器
 */
export class COSStorage extends BaseStorage {
  /**
   * @param {Object} config - COS配置
   * @param {string} config.secretId - 密钥ID
   * @param {string} config.secretKey - 密钥Key
   * @param {string} config.region - 地域
   * @param {string} config.bucket - Bucket名称
   */
  constructor(config) {
    super(config)
    
    this.client = new COS({
      SecretId: config.secretId,
      SecretKey: config.secretKey
    })
    
    this.region = config.region
  }

  async upload(file) {
    try {
      const key = this.fileManager.generatePath(file.name)
      await new Promise((resolve, reject) => {
        this.client.putObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file,
          ContentType: file.type
        }, (err, data) => err ? reject(err) : resolve(data))
      })

      return { 
        url: this._generateUrl(
          key,
          `https://${this.bucket}.cos.${this.region}.myqcloud.com`
        ),
        key 
      }
    } catch (error) {
      this._handleError(error, '上传')
    }
  }

  async delete(key) {
    try {
      await new Promise((resolve, reject) => {
        this.client.deleteObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: key
        }, (err, data) => err ? reject(err) : resolve(data))
      })
    } catch (error) {
      this._handleError(error, '删除')
    }
  }

  async listObjects(prefix = '') {
    try {
      const result = await new Promise((resolve, reject) => {
        this.client.getBucket({
          Bucket: this.bucket,
          Region: this.region,
          Prefix: prefix
        }, (err, data) => err ? reject(err) : resolve(data))
      })

      return result.Contents.map(item => ({
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
        url: this._generateUrl(
          item.Key,
          `https://${this.bucket}.cos.${this.region}.myqcloud.com`
        )
      }))
    } catch (error) {
      this._handleError(error, '获取文件列表')
    }
  }

  async testConnection() {
    try {
      await new Promise((resolve, reject) => {
        this.client.getBucket({
          Bucket: this.bucket,
          Region: this.region,
          MaxKeys: 1
        }, (err, data) => err ? reject(err) : resolve(data))
      })
      return this._formatTestResult(true)
    } catch (error) {
      return this._formatTestResult(false, this._parseError(error))
    }
  }

  _parseError(error) {
    if (error.code === 'NoSuchBucket') {
      return 'Bucket不存在'
    }
    if (error.code === 'AccessDenied') {
      return '访问被拒绝，请检查权限配置'
    }
    if (error.code === 'InvalidAccessKeyId') {
      return 'SecretId无效'
    }
    if (error.code === 'SignatureDoesNotMatch') {
      return 'SecretKey无效'
    }
    return error.message || '未知错误'
  }
}