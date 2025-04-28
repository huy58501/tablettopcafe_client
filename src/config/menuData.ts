export const menuItemsAdmin = (username: string) => [
  {
    label: 'Dashboard',
    href: `/${username}/dashboard`,
  },
  {
    label: 'Quản Lý Tài Khoản',
    href: `/${username}/accounts`,
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
  {
    label: 'Quản Lý Ca Làm Việc',
    href: `/${username}/shifts`,
  },
  {
    label: 'Quản Lý Thực Đơn',
    href: `/${username}/dishes`,
  },
  {
    label: 'Quản Lý Kho',
    href: `/${username}/inventory`,
  },
  {
    label: 'Báo Cáo',
    href: `/${username}/reports`,
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
  {
    label: 'Quản Lý Ca Làm Việc',
    href: `/${username}/shifts`,
  },
  {
    label: 'Quản Lý Thực Đơn',
    href: `/${username}/dishes`,
  },
  {
    label: 'Quản Lý Kho',
    href: `/${username}/inventory`,
  },
];

export const menuItemsAdminClientView = (username: string) => [
  {
    label: 'Quản Lý Đặt Bàn',
    href: `/${username}/table-reservations`,
  },
  {
    label: 'Quản Lý Tài Khoản',
    href: `/${username}/accounts`,
  },
  {
    label: 'Quản Lý Bàn',
    href: `/${username}/tables`,
  },
  {
    label: 'Quản Lý Bếp',
    href: `/${username}/kitchen`,
  },
  {
    label: 'Quản Lý Ca Làm Việc',
    href: `/${username}/shifts`,
  },
  {
    label: 'Quản Lý Thực Đơn',
    href: `/${username}/dishes`,
  },
  {
    label: 'Quản Lý Kho',
    href: `/${username}/inventory`,
  },
  {
    label: 'Báo Cáo',
    href: `/${username}/reports`,
  },
];
