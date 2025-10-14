import React from 'react';

// Professional SVG icons with dark mode compatible colors
export const Icon = ({ name, size = 20, color = '#8b949e', className = '' }) => {
  const iconProps = {
    width: size,
    height: size,
    fill: color,
    className: `icon ${className}`,
    viewBox: '0 0 24 24'
  };

  const icons = {
    // Rules icon - scales of justice
    rules: (
      <svg {...iconProps}>
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
        <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" />
        <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" />
      </svg>
    ),
    
    // Weapons icon - crossed swords
    weapons: (
      <svg {...iconProps}>
        <path d="M6.92 5H5L14 14L15 13L6.92 5Z" />
        <path d="M22.54 6.25L21.15 4.86L19.75 6.25L21.15 7.64L22.54 6.25Z" />
        <path d="M14.96 11.5L13.57 10.11L12.18 11.5L13.57 12.89L14.96 11.5Z" />
        <path d="M20.29 15.46L19.5 16.25L17.5 14.25L18.29 13.46L20.29 15.46Z" />
        <path d="M5.03 18.95L6.42 20.34L7.81 18.95L6.42 17.56L5.03 18.95Z" />
        <path d="M13.95 3.79L12.56 2.4L11.17 3.79L12.56 5.18L13.95 3.79Z" />
      </svg>
    ),
    
    // WarGear icon - shield
    wargear: (
      <svg {...iconProps}>
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" />
        <path d="M12 6L8 8V12C8 14.5 9.5 16.5 12 17C14.5 16.5 16 14.5 16 12V8L12 6Z" />
      </svg>
    ),
    
    // Units icon - users/people
    units: (
      <svg {...iconProps}>
        <path d="M16 4C18.21 4 20 5.79 20 8C20 10.21 18.21 12 16 12C13.79 12 12 10.21 12 8C12 5.79 13.79 4 16 4Z" />
        <path d="M8 4C10.21 4 12 5.79 12 8C12 10.21 10.21 12 8 12C5.79 12 4 10.21 4 8C4 5.79 5.79 4 8 4Z" />
        <path d="M16 14C18.67 14 24 15.34 24 18V20H8V18C8 15.34 13.33 14 16 14Z" />
        <path d="M8 14C10.67 14 16 15.34 16 18V20H0V18C0 15.34 5.33 14 8 14Z" />
      </svg>
    ),
    
    // Army Books icon - book
    armybooks: (
      <svg {...iconProps}>
        <path d="M4 6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6Z" />
        <path d="M8 8H16V10H8V8Z" />
        <path d="M8 12H16V14H8V12Z" />
        <path d="M8 16H14V18H8V16Z" />
      </svg>
    ),
    
    // Army Lists icon - clipboard/list
    armylists: (
      <svg {...iconProps}>
        <path d="M9 2H15C16.1 2 17 2.9 17 4V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V4C7 2.9 7.9 2 9 2Z" />
        <path d="M9 4V20H15V4H9Z" />
        <path d="M11 6H13V8H11V6Z" />
        <path d="M11 10H13V12H11V10Z" />
        <path d="M11 14H13V16H11V14Z" />
        <path d="M11 18H13V20H11V18Z" />
      </svg>
    ),
    
    // Import icon - upload
    import: (
      <svg {...iconProps}>
        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
        <path d="M14 2V8H20" />
        <path d="M16 13H8" />
        <path d="M12 9L16 13L12 17" />
      </svg>
    ),
    
    // Preview icon - eye
    preview: (
      <svg {...iconProps}>
        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    
    // Warning icon - exclamation triangle
    warning: (
      <svg {...iconProps}>
        <path d="M12 2L1 21H23L12 2Z" />
        <path d="M12 8V14" />
        <path d="M12 18H12.01" />
      </svg>
    ),
    
    // Home icon - house
    home: (
      <svg {...iconProps}>
        <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z" />
        <path d="M9 22V12H15V22" />
      </svg>
    ),
    
    // Edit icon - pencil
    edit: (
      <svg {...iconProps}>
        <path d="M11 4H4C3.45 4 3 4.45 3 5V19C3 19.55 3.45 20 4 20H18C18.55 20 19 19.55 19 19V12" />
        <path d="M18.5 2.5C18.89 2.11 19.5 2.11 19.89 2.5L21.5 4.11C21.89 4.5 21.89 5.11 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" />
      </svg>
    ),
    
    // Delete icon - trash
    delete: (
      <svg {...iconProps}>
        <path d="M3 6H5H21" />
        <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" />
        <path d="M10 11V17" />
        <path d="M14 11V17" />
      </svg>
    ),
    
    // Close icon - X
    close: (
      <svg {...iconProps}>
        <path d="M18 6L6 18" />
        <path d="M6 6L18 18" />
      </svg>
    ),
    
    // Export icon - download arrow
    export: (
      <svg {...iconProps}>
        <path d="M21 15V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V15" />
        <path d="M7 10L12 15L17 10" />
        <path d="M12 15V3" />
      </svg>
    ),
    
    // Download icon - download
    download: (
      <svg {...iconProps}>
        <path d="M21 15V19C21 19.55 20.55 20 20 20H4C3.45 20 3 19.55 3 19V15" />
        <path d="M7 10L12 15L17 10" />
        <path d="M12 15V3" />
      </svg>
    ),
    
    // Factions icon - shield with star
    factions: (
      <svg {...iconProps}>
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
        <path d="M12 2L3 6L12 10L21 6L12 2Z" />
        <path d="M12 10V22" />
      </svg>
    )
  };

  return icons[name] || null;
};

// Icon variants with different colors for different states
export const IconButton = ({ name, size = 20, variant = 'default', className = '', ...props }) => {
  const colorMap = {
    default: '#8b949e',
    active: '#1f6feb',
    success: '#3fb950',
    danger: '#f85149',
    warning: '#d29922'
  };

  return (
    <Icon 
      name={name} 
      size={size} 
      color={colorMap[variant] || colorMap.default}
      className={`icon-button ${className}`}
      {...props}
    />
  );
};

export default Icon;
