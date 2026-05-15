const ICON_PATHS = {
  dashboard: [
    <path key="1" d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Z" />,
    <path key="2" d="M13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v2A1.5 1.5 0 0 1 18.5 9h-4A1.5 1.5 0 0 1 13 7.5v-2Z" />,
    <path key="3" d="M13 13.5A1.5 1.5 0 0 1 14.5 12h4a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-5Z" />,
    <path key="4" d="M4 15.5A1.5 1.5 0 0 1 5.5 14h4a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-3Z" />,
  ],
  sales: [
    <path key="1" d="M4 18.5h16" />,
    <path key="2" d="M7 16V9.5" />,
    <path key="3" d="M12 16V5.5" />,
    <path key="4" d="M17 16v-4" />,
    <path key="5" d="M5 6.5h3" />,
    <path key="6" d="M15.5 7.5h3" />,
  ],
  stock: [
    <path key="1" d="m12 3.5 8 4.35-8 4.35-8-4.35L12 3.5Z" />,
    <path key="2" d="M4 12.2 12 16.5l8-4.3" />,
    <path key="3" d="M4 16.55 12 21l8-4.45" />,
  ],
  close: [
    <path key="1" d="M7 3.75h10A2.25 2.25 0 0 1 19.25 6v15l-3-1.7-3 1.7-3-1.7-3 1.7V6A2.25 2.25 0 0 1 9.5 3.75Z" />,
    <path key="2" d="M9 8h6" />,
    <path key="3" d="M9 11.5h6" />,
    <path key="4" d="M9 15h4" />,
  ],
  calendar: [
    <path key="1" d="M7.5 3v3" />,
    <path key="2" d="M16.5 3v3" />,
    <path key="3" d="M4.5 8.2h15" />,
    <path key="4" d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />,
  ],
  clients: [
    <path key="1" d="M16.5 19.25c0-2.2-2.05-4-4.5-4s-4.5 1.8-4.5 4" />,
    <circle key="2" cx="12" cy="9.2" r="3.2" />,
    <path key="3" d="M20 18.5c0-1.65-1.15-3.05-2.75-3.65" />,
    <path key="4" d="M16.6 6.6a2.65 2.65 0 0 1 0 5.15" />,
    <path key="5" d="M4 18.5c0-1.65 1.15-3.05 2.75-3.65" />,
    <path key="6" d="M7.4 6.6a2.65 2.65 0 0 0 0 5.15" />,
  ],
  wallet: [
    <path key="1" d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10.5A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z" />,
    <path key="2" d="M15.5 12h5" />,
    <path key="3" d="M17.8 12h.01" />,
  ],
  movements: [
    <path key="1" d="M4 7h12.5" />,
    <path key="2" d="m13.5 4 3 3-3 3" />,
    <path key="3" d="M20 17H7.5" />,
    <path key="4" d="m10.5 14-3 3 3 3" />,
  ],
  reports: [
    <path key="1" d="M4 18.5h16" />,
    <path key="2" d="M7 15.5v-4" />,
    <path key="3" d="M12 15.5v-8" />,
    <path key="4" d="M17 15.5v-6" />,
    <path key="5" d="M6.8 7.5 10.5 4l3.4 3.2L18 3.8" />,
  ],
  suppliers: [
    <path key="1" d="M3.75 7.5h10.5v8.75H3.75z" />,
    <path key="2" d="M14.25 10h3.35l2.65 3.1v3.15h-6" />,
    <circle key="3" cx="7" cy="18" r="1.8" />,
    <circle key="4" cx="17.25" cy="18" r="1.8" />,
  ],
  adjustments: [
    <path key="1" d="M4 7h9" />,
    <path key="2" d="M17 7h3" />,
    <circle key="3" cx="15" cy="7" r="2" />,
    <path key="4" d="M4 17h3" />,
    <path key="5" d="M11 17h9" />,
    <circle key="6" cx="9" cy="17" r="2" />,
  ],
  file: [
    <path key="1" d="M8 3.8h6.2l4 4v10.3a2.1 2.1 0 0 1-2.1 2.1H8A2.1 2.1 0 0 1 5.9 18.1V5.9A2.1 2.1 0 0 1 8 3.8Z" />,
    <path key="2" d="M14.2 3.8v4h4" />,
    <path key="3" d="M8.8 12.2h6.5" />,
    <path key="4" d="M8.8 15.5h4.9" />,
  ],
  truck: [
    <path key="1" d="M3.8 6.5h10.4v8.6H3.8z" />,
    <path key="2" d="M14.2 9.1h3.4l2.6 3.2v2.8h-6" />,
    <circle key="3" cx="7" cy="17" r="1.75" />,
    <circle key="4" cx="17.1" cy="17" r="1.75" />,
  ],
  product: [
    <path key="1" d="M5 9.2 12 5l7 4.2v7.6L12 21l-7-4.2V9.2Z" />,
    <path key="2" d="M5.2 9.4 12 13.5l6.8-4.1" />,
    <path key="3" d="M12 13.5V21" />,
  ],
  menu: [
    <path key="1" d="M4 7h16" />,
    <path key="2" d="M4 12h16" />,
    <path key="3" d="M4 17h16" />,
  ],
  closeX: [
    <path key="1" d="M6 6l12 12" />,
    <path key="2" d="M18 6 6 18" />,
  ],
  sun: [
    <circle key="1" cx="12" cy="12" r="3.5" />,
    <path key="2" d="M12 2.8v2" />,
    <path key="3" d="M12 19.2v2" />,
    <path key="4" d="m4.7 4.7 1.4 1.4" />,
    <path key="5" d="m17.9 17.9 1.4 1.4" />,
    <path key="6" d="M2.8 12h2" />,
    <path key="7" d="M19.2 12h2" />,
    <path key="8" d="m4.7 19.3 1.4-1.4" />,
    <path key="9" d="m17.9 6.1 1.4-1.4" />,
  ],
  moon: [
    <path key="1" d="M20.1 14.2A7.7 7.7 0 0 1 9.8 3.9 8 8 0 1 0 20.1 14.2Z" />,
  ],
  plus: [
    <path key="1" d="M12 5v14" />,
    <path key="2" d="M5 12h14" />,
  ],
  edit: [
    <path key="1" d="M11 4H5.6A2.1 2.1 0 0 0 3.5 6.1v12.3a2.1 2.1 0 0 0 2.1 2.1h12.3a2.1 2.1 0 0 0 2.1-2.1V13" />,
    <path key="2" d="M18.2 3.8a2.1 2.1 0 0 1 3 3L12 16l-4 1 1-4 9.2-9.2Z" />,
  ],
  save: [
    <path key="1" d="M5.5 4h11l2 2v13.5H5.5z" />,
    <path key="2" d="M8 4v5h7V4" />,
    <path key="3" d="M8 19.5V14h8v5.5" />,
  ],
  warning: [
    <path key="1" d="M12 8v4" />,
    <path key="2" d="M12 16h.01" />,
    <path key="3" d="M10.35 4.25 2.7 17.5A2 2 0 0 0 4.43 20.5h15.14a2 2 0 0 0 1.73-3L13.65 4.25a1.9 1.9 0 0 0-3.3 0Z" />,
  ],
  search: [
    <circle key="1" cx="10.8" cy="10.8" r="6.2" />,
    <path key="2" d="m16 16 4 4" />,
  ],
};

export default function AppIcon({ name = 'dashboard', size = 20, strokeWidth = 2.05, className = '', title }) {
  const paths = ICON_PATHS[name] || ICON_PATHS.dashboard;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths}
    </svg>
  );
}
