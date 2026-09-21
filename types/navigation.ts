import { ComponentType } from 'react';

export interface UserPermissions {
  isRH: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isCom: boolean;
  isDRH: boolean;
  isRHPrint: boolean;
  isRoomManager: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isPublicForUser?: boolean;
  hasAccess?: (perms: UserPermissions) => boolean;
  badge?: string | number;
  hasSub?: boolean;
  subItems?: NavItem[];
}

export interface NavLink {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  isPublicForUser?: boolean;
  hasAccess?: (perms: UserPermissions) => boolean;
  isEspaceLink?: boolean;
}