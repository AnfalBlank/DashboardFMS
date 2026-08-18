import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsUploadUpdateOptions, FmsUploadAssetOptions } from '../dto/fms-upload.dto';
import { FmsUploadResponse } from '../interfaces/fms.interfaces';

@Injectable()
export class FmsUploadService {
  private readonly logger = new Logger(FmsUploadService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Uploads software/firmware update zip/package to controller filesystem and triggers update order.
   *
   * Endpoint: POST /Update
   * Form-Data Field: 'update_file'
   */
  async uploadFirmwareUpdate(
    fileBuffer: Buffer | Uint8Array | Blob,
    options?: FmsUploadUpdateOptions,
  ): Promise<FmsUploadResponse> {
    const filename = options?.filename || 'update_package.tar.gz';
    const contentType = options?.contentType || 'application/octet-stream';

    const formData = new FormData();
    const blob = fileBuffer instanceof Blob
      ? fileBuffer
      : new Blob([fileBuffer as any], { type: contentType });

    formData.append('update_file', blob, filename);

    this.logger.log(`Uploading firmware update: ${filename}`);
    return this.client.postFormData<FmsUploadResponse>('/Update', formData);
  }

  /**
   * Uploads images or documents to the controller asset storage.
   *
   * Endpoint: POST /FileUploadController/upload_file
   * Form-Data Field: 'do_upload'
   */
  async uploadFileAsset(
    fileBuffer: Buffer | Uint8Array | Blob,
    options?: FmsUploadAssetOptions,
  ): Promise<FmsUploadResponse> {
    const filename = options?.filename || 'upload_asset.bin';
    const contentType = options?.contentType || 'application/octet-stream';

    const formData = new FormData();
    const blob = fileBuffer instanceof Blob
      ? fileBuffer
      : new Blob([fileBuffer as any], { type: contentType });

    formData.append('do_upload', blob, filename);

    this.logger.log(`Uploading file asset: ${filename}`);
    return this.client.postFormData<FmsUploadResponse>(
      '/FileUploadController/upload_file',
      formData,
    );
  }
}
