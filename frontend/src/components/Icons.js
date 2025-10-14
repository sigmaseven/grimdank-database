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
    
    // Weapons icon - sword
    weapons: (
      <svg {...iconProps}>
        <path d="M6 2L8 4L6 6L4 4L6 2Z" />
        <path d="M6 6L6 18L8 20L8 6L6 6Z" />
        <path d="M4 18L8 18L8 20L4 20L4 18Z" />
        <path d="M5 19L7 19L7 21L5 21L5 19Z" />
        <path d="M6 2L6 4L8 4L8 2L6 2Z" />
        <path d="M2 4L4 6L6 4L4 2L2 4Z" />
        <path d="M8 4L10 6L12 4L10 2L8 4Z" />
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
    
    // Army Books icon - detailed book with pages
    armybooks: (
      <svg {...iconProps}>
        <path d="M4 4C4 2.9 4.9 2 6 2H18C19.1 2 20 2.9 20 4V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z" />
        <path d="M6 4H18V6H6V4Z" />
        <path d="M6 6H18V8H6V6Z" />
        <path d="M6 8H18V10H6V8Z" />
        <path d="M6 10H18V12H6V10Z" />
        <path d="M6 12H18V14H6V12Z" />
        <path d="M6 14H18V16H6V14Z" />
        <path d="M6 16H18V18H6V16Z" />
        <path d="M6 18H18V20H6V18Z" />
        <path d="M8 4V20" />
        <path d="M10 4V20" />
        <path d="M12 4V20" />
        <path d="M14 4V20" />
        <path d="M16 4V20" />
      </svg>
    ),
    
    // Army Lists icon - detailed clipboard with checkboxes
    armylists: (
      <svg {...iconProps}>
        <path d="M9 2H15C16.1 2 17 2.9 17 4V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V4C7 2.9 7.9 2 9 2Z" />
        <path d="M9 4V20H15V4H9Z" />
        <path d="M11 6H13V8H11V6Z" />
        <path d="M11 10H13V12H11V10Z" />
        <path d="M11 14H13V16H11V14Z" />
        <path d="M11 18H13V20H11V18Z" />
        <path d="M8 2H10V4H8V2Z" />
        <path d="M8 4H10V6H8V4Z" />
        <path d="M8 6H10V8H8V6Z" />
        <path d="M8 8H10V10H8V8Z" />
        <path d="M8 10H10V12H8V10Z" />
        <path d="M8 12H10V14H8V12Z" />
        <path d="M8 14H10V16H8V14Z" />
        <path d="M8 16H10V18H8V16Z" />
        <path d="M8 18H10V20H8V18Z" />
        <path d="M8 20H10V22H8V20Z" />
      </svg>
    ),
    
    // Import icon - detailed upload with files
    import: (
      <svg {...iconProps}>
        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
        <path d="M14 2V8H20" />
        <path d="M16 13H8" />
        <path d="M12 9L16 13L12 17" />
        <path d="M6 4H8V6H6V4Z" />
        <path d="M6 6H8V8H6V6Z" />
        <path d="M6 8H8V10H6V8Z" />
        <path d="M6 10H8V12H6V10Z" />
        <path d="M6 12H8V14H6V12Z" />
        <path d="M6 14H8V16H6V14Z" />
        <path d="M6 16H8V18H6V16Z" />
        <path d="M6 18H8V20H6V18Z" />
        <path d="M10 4H12V6H10V4Z" />
        <path d="M10 6H12V8H10V6Z" />
        <path d="M10 8H12V10H10V8Z" />
        <path d="M10 10H12V12H10V10Z" />
        <path d="M10 12H12V14H10V12Z" />
        <path d="M10 14H12V16H10V14Z" />
        <path d="M10 16H12V18H10V16Z" />
        <path d="M10 18H12V20H10V18Z" />
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
    
    // Factions icon - detailed shield with banner
    factions: (
      <svg {...iconProps}>
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" />
        <path d="M12 6L8 8V12C8 14.5 9.5 16.5 12 17C14.5 16.5 16 14.5 16 12V8L12 6Z" />
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
        <path d="M12 8L10 9L12 10L14 9L12 8Z" />
        <path d="M12 10L10 11L12 12L14 11L12 10Z" />
        <path d="M12 12L10 13L12 14L14 13L12 12Z" />
        <path d="M12 14L10 15L12 16L14 15L12 14Z" />
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
