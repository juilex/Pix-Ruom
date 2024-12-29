// 存储服务配置
export const STORAGE_SERVICES = {
  's3': {
    type: 's3',
    label: 'S3兼容存储',
    icon: 'Cloudy',
    description: 'S3和三方兼容的存储服务',
    fields: [
      {
        key: 'endpoint',
        label: 'Endpoint',
        icon: 'Link',
        placeholder: '使用其他兼容S3的存储服务时填写'
      },
      {
        key: 'region',
        label: 'Region',
        icon: 'Location',
        required: true,
        placeholder: '如：us-east-1'
      },
      {
        key: 'bucket',
        label: 'Bucket',
        icon: 'Box',
        required: true,
        placeholder: '存储桶名称'
      },
      {
        key: 'accessKey',
        label: 'AccessKey',
        icon: 'Key',
        required: true,
        placeholder: 'Access Key ID'
      },
      {
        key: 'secretKey',
        label: 'SecretKey',
        icon: 'Lock',
        type: 'password',
        required: true,
        placeholder: 'Secret Access Key'
      }
    ]
  },
  'oss': {
    type: 'oss',
    label: '阿里云OSS',
    icon: 'Cloudy',
    description: '阿里云OSS对象存储服务',
    fields: [
      {
        key: 'endpoint',
        label: 'Endpoint',
        icon: 'Location',
        required: true,
        placeholder: '如：oss-cn-beijing.aliyuncs.com'
      },
      {
        key: 'bucket',
        label: 'Bucket',
        icon: 'Box',
        required: true,
        placeholder: '存储桶名称'
      },
      {
        key: 'accessKey',
        label: 'AccessKey',
        icon: 'Key',
        required: true,
        placeholder: 'AccessKey ID'
      },
      {
        key: 'secretKey',
        label: 'SecretKey',
        icon: 'Lock',
        type: 'password',
        required: true,
        placeholder: 'AccessKey Secret'
      }
    ]
  },
  'cos': {
    type: 'cos',
    label: '腾讯云COS',
    icon: 'Cloudy',
    description: '腾讯云COS对象存储服务',
    fields: [
      {
        key: 'region',
        label: 'Region',
        icon: 'Location',
        required: true,
        placeholder: '如：ap-guangzhou'
      },
      {
        key: 'bucket',
        label: 'Bucket',
        icon: 'Box',
        required: true,
        placeholder: '存储桶名称'
      },
      {
        key: 'secretId',
        label: 'Secret ID',
        icon: 'Key',
        required: true,
        placeholder: 'SecretID'
      },
      {
        key: 'secretKey',
        label: 'SecretKey',
        icon: 'Lock',
        type: 'password',
        required: true,
        placeholder: 'SecretKey'
      }
    ]
  }
}

// 获取存储服务的必填字段
export const getRequiredFields = (type) => {
  const service = STORAGE_SERVICES[type]
  if (!service) return []
  return service.fields.filter(field => field.required).map(field => field.key)
}

// 验证存储配置
export const validateStorageConfig = (type, config) => {
  if (!STORAGE_SERVICES[type]) {
    return {
      isValid: false,
      message: '无效的存储类型'
    }
  }

  const requiredFields = getRequiredFields(type)
  
  // 如果配置为空或未定义，直接返回有效
  if (!config) {
    return {
      isValid: true,
      message: '配置为空'
    }
  }

  const allFieldsEmpty = requiredFields.every(
    field => !config[field]?.trim()
  )
  
  if (allFieldsEmpty) {
    return {
      isValid: true,
      message: '配置为空'
    }
  }

  // 如果有任何值，则必须所有必填字段都填写
  const missingFields = requiredFields.filter(
    field => !config[field]?.trim()
  )

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `请完整填写所有必填项，或清空所有配置`
    }
  }

  return {
    isValid: true,
    message: '验证通过'
  }
}