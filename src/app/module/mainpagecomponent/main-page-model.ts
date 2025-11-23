export interface TenantApiResponse {
  result: TenantDto[];
  success: boolean;
}

export interface TenantDto {
  tenancyName: string;
  name: string;
  section: number;
  isActive: boolean;
  id: number;
}

export interface TenantCard extends TenantDto {
  title: string;
  degree: string;
  colorText: string;
  overlay: string;
  img: string;
  buttons: CardButton[];
}

export interface CardButton {
  text: string;
  color: string;
  bgcolor: string;
  action: 'register' | 'personalPage' | 'capacity';
}
