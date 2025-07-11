export interface GeneralSettings {
  id: number;
  companyName: string;
  companyLogoUrl: string | null;
  exchangeRateSale: string | null;
  exchangeRatePurchase: string | null;
  exchangeRateDate: string | null;
  exchangeRateDateString: string | null;
  exchangeRateAutoUpdate: boolean;
  timezone: string;
  generalTax: number;
  additionalSettings: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGeneralSettingsDto {
  companyName?: string;
  companyLogoUrl?: string;
  exchangeRateSale?: number;
  exchangeRatePurchase?: number;
  exchangeRateDateString?: string;
  exchangeRateAutoUpdate?: boolean;
  timezone?: string;
  additionalSettings?: string;
}

export interface ExchangeRate {
  date: string;
  saleRate: number;
  purchaseRate: number;
}

export interface SaleRate {
  date: string;
  saleRate: number;
}

export interface ApisNetRUCData {
  razonSocial: string;
  tipoDocumento: string;
  numeroDocumento: string;
  estado: string;
  condicion: string;
  direccion: string;
  ubigeo: string;
  viaTipo: string;
  viaNombre: string;
  zonaCodigo: string;
  zonaTipo: string;
  numero: string;
  interior: string;
  lote: string;
  dpto: string;
  manzana: string;
  kilometro: string;
  distrito: string;
  provincia: string;
  departamento: string;
  EsAgenteRetencion: boolean;
  EsBuenContribuyente: boolean;
  localesAnexos: unknown | null;
}
