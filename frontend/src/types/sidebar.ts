export interface SubMenuItem {
  path: string;
  label: string;
  permission?: string;
  icon: React.ReactNode;
}

export interface MenuItem {
  path?: string;
  label: string;
  permission?: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}
