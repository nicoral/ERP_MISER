export interface SubMenuItem {
  path: string;
  label: string;
  permission?: string[];
  roles?: number[];
  icon: React.ReactNode;
}

export interface MenuItem {
  path?: string;
  label: string;
  permission?: string[];
  roles?: number[];
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}
