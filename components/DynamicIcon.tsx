
import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

// Helper to filter only valid React components (icons) from the module exports
// Icons in Lucide are exported as PascalCase (e.g. "Home", "User")
// We exclude internal utilities that might start with lowercase or special chars.
const getIconMap = () => {
  const icons: Record<string, React.ComponentType<any>> = {};
  
  Object.keys(LucideIcons).forEach((key) => {
    // Simple check: Component names start with uppercase and are functions/objects
    // We explicitly exclude 'createLucideIcon' and other potential utilities
    if (/^[A-Z]/.test(key) && key !== 'Icon' && key !== 'createLucideIcon') {
       icons[key] = (LucideIcons as any)[key];
    }
  });
  
  return icons;
};

// Generate the map once
export const iconMap = getIconMap();

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 24, className = "" }) => {
  // Normalize name to PascalCase just in case (simple capitalization)
  // This handles "home" -> "Home" mapping if user typed lowercase
  const normalizeName = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const IconComponent = iconMap[name] || iconMap[normalizeName(name)] || LucideIcons.HelpCircle;
  
  return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;
