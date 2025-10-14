import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon } from '../Icons';

describe('Icon Component', () => {
  test('renders edit icon', () => {
    render(<Icon name="edit" size={20} color="#000" />);
    
    const icon = screen.getByTestId('icon-edit');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('width', '20');
    expect(icon).toHaveAttribute('height', '20');
  });

  test('renders delete icon', () => {
    render(<Icon name="delete" size={16} color="#ff0000" />);
    
    const icon = screen.getByTestId('icon-delete');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');
  });

  test('renders add icon', () => {
    render(<Icon name="add" size={24} color="#00ff00" />);
    
    const icon = screen.getByTestId('icon-add');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  test('renders close icon', () => {
    render(<Icon name="close" size={18} color="#000" />);
    
    const icon = screen.getByTestId('icon-close');
    expect(icon).toBeInTheDocument();
  });

  test('renders search icon', () => {
    render(<Icon name="search" size={20} color="#666" />);
    
    const icon = screen.getByTestId('icon-search');
    expect(icon).toBeInTheDocument();
  });

  test('renders with default props', () => {
    render(<Icon name="edit" />);
    
    const icon = screen.getByTestId('icon-edit');
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');
  });

  test('handles unknown icon gracefully', () => {
    render(<Icon name="unknown" size={20} color="#000" />);
    
    // Should not crash and should render something
    expect(screen.getByTestId('icon-unknown')).toBeInTheDocument();
  });

  test('applies custom styles', () => {
    render(<Icon name="edit" size={20} color="#ff0000" style={{ opacity: 0.5 }} />);
    
    const icon = screen.getByTestId('icon-edit');
    expect(icon).toHaveStyle('opacity: 0.5');
  });

  test('renders all available icons', () => {
    const iconNames = ['edit', 'delete', 'add', 'close', 'search', 'save', 'cancel', 'refresh'];
    
    iconNames.forEach(name => {
      const { unmount } = render(<Icon name={name} />);
      expect(screen.getByTestId(`icon-${name}`)).toBeInTheDocument();
      unmount();
    });
  });
});
