import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import {
  FmsSetSiteProfilDto,
  FmsSetDtimeConfigDto,
  FmsSetHeadersConfigDto,
  FmsSetFootersConfigDto,
  FmsSetLinkServerConfigDto,
  FmsSetPortsConfigDto,
  FmsSetProductsConfigDto,
  FmsSetPumpsConfigDto,
  FmsSetTanksConfigDto,
  FmsSetWifiConfigDto,
  FmsSetProxyConfigDto,
} from '../dto/fms-setting.dto';

@Injectable()
export class FmsSettingService {
  private readonly logger = new Logger(FmsSettingService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Get SPBU site profile configuration.
   *
   * Endpoint: GET /setting/Get_site_profil
   */
  async getSiteProfile(): Promise<any> {
    return this.client.get('/setting/Get_site_profil');
  }

  /**
   * Set SPBU site profile configuration.
   *
   * Endpoint: POST /setting/Set_site_profil
   */
  async setSiteProfile(dto: FmsSetSiteProfilDto): Promise<any> {
    const payload = {
      IdSite: dto.IdSite,
      IdController: Number(dto.IdController),
      IdCompany: Number(dto.IdCompany),
    };
    return this.client.post('/setting/Set_site_profil', payload);
  }

  /**
   * Get system datetime configuration.
   *
   * Endpoint: GET /setting/Get_dtime_config
   */
  async getDtimeConfig(): Promise<any> {
    return this.client.get('/setting/Get_dtime_config');
  }

  /**
   * Set system datetime configuration.
   *
   * Endpoint: POST /setting/Set_dtime_config
   */
  async setDtimeConfig(dto: FmsSetDtimeConfigDto): Promise<any> {
    const payload = {
      Datetime: dto.Datetime,
    };
    return this.client.post('/setting/Set_dtime_config', payload);
  }

  /**
   * Get receipt headers configuration.
   *
   * Endpoint: GET /setting/Get_headers_config
   */
  async getHeadersConfig(): Promise<any> {
    return this.client.get('/setting/Get_headers_config');
  }

  /**
   * Set receipt headers configuration.
   *
   * Endpoint: POST /setting/Set_headers_config
   */
  async setHeadersConfig(dto: FmsSetHeadersConfigDto): Promise<any> {
    return this.client.post('/setting/Set_headers_config', dto);
  }

  /**
   * Get receipt footers configuration.
   *
   * Endpoint: GET /setting/Get_footers_config
   */
  async getFootersConfig(): Promise<any> {
    return this.client.get('/setting/Get_footers_config');
  }

  /**
   * Set receipt footers configuration.
   *
   * Endpoint: POST /setting/Set_footers_config
   */
  async setFootersConfig(dto: FmsSetFootersConfigDto): Promise<any> {
    return this.client.post('/setting/Set_footers_config', dto);
  }

  /**
   * Get central server sync links configuration.
   *
   * Endpoint: GET /setting/Get_linkserver_config
   */
  async getLinkServerConfig(): Promise<any> {
    return this.client.get('/setting/Get_linkserver_config');
  }

  /**
   * Set central server sync links configuration.
   *
   * Endpoint: POST /setting/Set_linkserver_config
   */
  async setLinkServerConfig(dto: FmsSetLinkServerConfigDto): Promise<any> {
    return this.client.post('/setting/Set_linkserver_config', dto);
  }

  /**
   * Get serial COM ports configuration.
   *
   * Endpoint: GET /setting/Get_ports_config
   */
  async getPortsConfig(): Promise<any> {
    return this.client.get('/setting/Get_ports_config');
  }

  /**
   * Set serial COM ports configuration.
   *
   * Endpoint: POST /setting/Set_ports_config
   */
  async setPortsConfig(dto: FmsSetPortsConfigDto): Promise<any> {
    return this.client.post('/setting/Set_ports_config', dto);
  }

  /**
   * Get fuel products catalogue configuration.
   *
   * Endpoint: GET /setting/Get_products_config
   */
  async getProductsConfig(): Promise<any> {
    return this.client.get('/setting/Get_products_config');
  }

  /**
   * Set fuel products catalogue configuration.
   *
   * Endpoint: POST /setting/Set_products_config
   */
  async setProductsConfig(dto: FmsSetProductsConfigDto): Promise<any> {
    return this.client.post('/setting/Set_products_config', dto);
  }

  /**
   * Get pumps forecourt configuration.
   *
   * Endpoint: GET /setting/Get_pumps_config
   */
  async getPumpsConfig(): Promise<any> {
    return this.client.get('/setting/Get_pumps_config');
  }

  /**
   * Set pumps forecourt configuration.
   *
   * Endpoint: POST /setting/Set_pumps_config
   */
  async setPumpsConfig(dto: FmsSetPumpsConfigDto): Promise<any> {
    return this.client.post('/setting/Set_pumps_config', dto);
  }

  /**
   * Get storage tanks configuration.
   *
   * Endpoint: GET /setting/Get_tanks_config
   */
  async getTanksConfig(): Promise<any> {
    return this.client.get('/setting/Get_tanks_config');
  }

  /**
   * Set storage tanks configuration.
   *
   * Endpoint: POST /setting/Set_tanks_config
   */
  async setTanksConfig(dto: FmsSetTanksConfigDto): Promise<any> {
    return this.client.post('/setting/Set_tanks_config', dto);
  }

  /**
   * Get system users configuration.
   *
   * Endpoint: GET /setting/Get_users_config
   */
  async getUsersConfig(): Promise<any> {
    return this.client.get('/setting/Get_users_config');
  }

  /**
   * Get WiFi networking configuration.
   *
   * Endpoint: GET /setting/Get_wifi_config
   */
  async getWifiConfig(): Promise<any> {
    return this.client.get('/setting/Get_wifi_config');
  }

  /**
   * Set WiFi networking configuration.
   *
   * Endpoint: POST /setting/Set_wifi_config
   */
  async setWifiConfig(dto: FmsSetWifiConfigDto): Promise<any> {
    return this.client.post('/setting/Set_wifi_config', dto);
  }

  /**
   * Get system proxy configuration.
   *
   * Endpoint: GET /setting/Get_proxy_config
   */
  async getProxyConfig(): Promise<any> {
    return this.client.get('/setting/Get_proxy_config');
  }

  /**
   * Set system proxy configuration.
   *
   * Endpoint: POST /setting/Set_proxy_config
   */
  async setProxyConfig(dto: FmsSetProxyConfigDto): Promise<any> {
    return this.client.post('/setting/Set_proxy_config', dto);
  }

  /**
   * Discover protocol devices connected to the forecourt controller.
   *
   * Endpoint: GET /setting/Get_list_device
   */
  async getListDevices(): Promise<any> {
    return this.client.get('/setting/Get_list_device');
  }

  /**
   * Discover USB interfaces on the forecourt controller Linux host.
   *
   * Endpoint: GET /setting/Get_list_usb
   */
  async getListUsb(): Promise<any> {
    return this.client.get('/setting/Get_list_usb');
  }
}
