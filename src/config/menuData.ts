export const menuItemsAdmin = (username: string) => [
  {
    label: 'Dashboard',
    href: `/${username}/dashboard`,
  },
  {
    label: 'Quản Lý Đặt Bàn',
    href: `/${username}/table-reservations`,
  },
  {
    label: 'Quản Lý Bàn',
    href: `/${username}/tables`,
  },
  {
    label: 'Quản Lý Bếp',
    href: `/${username}/kitchen`,
  },
];

export const menuItemsClient = (username: string) => [
  {
    label: 'Quản Lý Đặt Bàn',
    href: `/${username}/table-reservations`,
  },
  {
    label: 'Quản Lý Bàn',
    href: `/${username}/tables`,
  },
  {
    label: 'Quản Lý Bếp',
    href: `/${username}/kitchen`,
  },
];

export const menuItemsAdminClientView = (username: string) => [
  {
    label: 'Quản Lý Đặt Bàn',
    href: `/${username}/table-reservations`,
  },
  {
    label: 'Quản Lý Bàn',
    href: `/${username}/tables`,
  },
  {
    label: 'Quản Lý Bếp',
    href: `/${username}/kitchen`,
  },
];
