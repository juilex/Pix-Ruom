import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { BaseStorage } from './BaseStorage'

/**
 * AWS S3存储适配器
 */
export class S3Storage extends BaseStorage {
  /**
   * @param {Object} config - S3配置
   * @param {string} config.region - 区域
   * @param {string} config.accessKey - 访问密钥ID
   * @param {string} config.secretKey - 访问密钥密码
   * @param {string} [config.endpoint] - 自定义终端节点
   * @param {string} config.bucket - Bucket名称
   */
  constructor(config) {
    super(config)
    
    const clientConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      }
    }

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint.startsWith('http') 
        ? config.endpoint 
        : `https://${config.endpoint}`
      clientConfig.forcePathStyle = false
    }

    this.client = new S3Client(clientConfig)
    this.region = config.region
    this.endpoint = config.endpoint
  }

  async upload(file) {
    try {
      const key = this.fileManager.generatePath(file.name)
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read'
      })

      await this.client.send(command)
      
      return { 
        url: this._generateUrl(
          key,
          this.endpoint
            ? `https://${this.bucket}.${this.endpoint.replace(/^https?:\/\//, '')}`
            : `https://${this.bucket}.s3.amazonaws.com`
        ),
        key 
      }
    } catch (error) {
      this._handleError(error, '上传')
    }
  }

  async delete(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
      await this.client.send(command)
    } catch (error) {
      this._handleError(error, '删除')
    }
  }

  async listObjects(prefix = '') {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix
      })
      
      const response = await this.client.send(command)
      const contents = response.Contents || []
      
      return contents.map(item => ({
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
        url: this._generateUrl(
          item.Key,
          this.endpoint
            ? `https://${this.bucket}.${this.endpoint.replace(/^https?:\/\//, '')}`
            : `https://${this.bucket}.s3.amazonaws.com`
        )
      }))
    } catch (error) {
      this._handleError(error, '获取文件列表')
    }
  }

  async testConnection() {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1
      })
      
      await this.client.send(command)
      return this._formatTestResult(true)
    } catch (error) {
      return this._formatTestResult(false, this._parseError(error))
    }
  }

  _parseError(error) {
    if (error.name === 'NoSuchBucket') {
      return 'Bucket不存在'
    }
    if (error.name === 'AccessDenied') {
      return '访问被拒绝，请检查权限配置'
    }
    if (error.name === 'InvalidAccessKeyId') {
      return 'AccessKey无效'
    }
    if (error.name === 'SignatureDoesNotMatch') {
      return 'SecretKey无效'
    }
    if (error.name === 'NetworkingError') {
      return '网络连接失败，请检查Endpoint配置'
    }
    return error.message || '未知错误'
  }
}