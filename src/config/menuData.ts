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
    label: 'Báo Cáo Sales',
    href: `/${username}/sales-reports`,
  },
  {
    label: 'Báo Cáo Lương',
    href: `/${username}/salary-reports`,
  },
];

export const menuItemsClient = (username: string) => [
  {
    label: 'Ca Làm Việc',
    href: `/${username}/shifts`,
  },
  {
    label: 'Quản Lý Booking',
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
    label: 'Báo Cáo Sales',
    href: `/${username}/sales-reports`,
  },
  {
    label: 'Báo Cáo Lương',
    href: `/${username}/salary-reports`,
  },
];
