import imageCompression from 'browser-image-compression';

export class ImageCompressor {
  constructor(config = {}) {
    this.config = {
      compressionRatio: config.compressionRatio !== undefined ? config.compressionRatio : 75,
      outputFormat: config.outputFormat || 'webp'
    };
  }

  async compress(file) {
    try {
      // GIF 文件特殊处理
      if (file.type === 'image/gif') {
        return this.config.outputFormat !== 'original' && this.config.outputFormat !== 'gif'
          ? this._createOutputFile(file, file.name)
          : file;
      }

      // 非 GIF 文件的正常压缩逻辑
      if (this.config.compressionRatio === 100) {
        return this.config.outputFormat !== 'original' 
          ? this._createOutputFile(file, file.name)
          : file;
      }

      const options = {
        useWebWorker: true,
        alwaysKeepResolution: true,
        initialQuality: Math.max(0.01, this.config.compressionRatio / 100),
        quality: Math.max(0.01, this.config.compressionRatio / 100),
        maxSizeMB: this._calculateMaxSize(file.size, this.config.compressionRatio),
        maxIteration: 2,
        ...this._getFormatSpecificOptions(file.type)
      };

      const compressedFile = await imageCompression(file, options);

      return this.config.outputFormat !== 'original'
        ? this._createOutputFile(compressedFile, file.name)
        : compressedFile;
    } catch (error) {
      throw new Error(`图片压缩失败: ${error.message}`);
    }
  }

  _getFormatSpecificOptions(mimeType) {
    const options = {
      alwaysKeepResolution: true,
    };
    
    switch(mimeType) {
      case 'image/png':
        options.preserveAlpha = true;
        break;
      case 'image/jpeg':
      case 'image/jpg':
        options.mozjpeg = true;
        break;
      case 'image/gif':
        options.preserveQuality = true;
        break;
      case 'image/webp':
        options.lossless = this.config.compressionRatio > 90;
        break;
    }

    return options;
  }

  _calculateMaxSize(originalSize, compressionRatio) {
    const originalSizeMB = originalSize / (1024 * 1024);
    const factor = compressionRatio >= 75 ? 0.95 
      : compressionRatio >= 50 ? 0.85 
      : compressionRatio >= 25 ? 0.75 
      : 0.65;

    return (originalSizeMB * (compressionRatio * factor)) / 100;
  }

  _createOutputFile(compressedFile, originalName) {
    const ext = this.config.outputFormat;
    const newFileName = originalName.replace(/\.[^/.]+$/, `.${ext}`);
    
    return new File([compressedFile], newFileName, { 
      type: `image/${ext}`,
      lastModified: new Date().getTime()
    });
  }
}

export default ImageCompressor;