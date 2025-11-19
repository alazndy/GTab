
import React from 'react';
import { 
  Mail, User, Briefcase, Code, Cloud, Terminal, 
  Github, Twitter, Youtube, ShoppingBag, Music, 
  Globe, Home, Search, Settings, MessageCircle,
  Layout, Image, Video, Coffee, Map, Calendar,
  FileText, Database, Server, Shield, Lock,
  Heart, Star, Smartphone, Monitor, Headphones,
  Book, GraduationCap, DollarSign, CreditCard
} from 'lucide-react';

// Map of available icons for the user to select
export const iconMap: Record<string, React.ComponentType<any>> = {
  Mail, User, Briefcase, Code, Cloud, Terminal,
  Github, Twitter, Youtube, ShoppingBag, Music,
  Globe, Home, Search, Settings, MessageCircle,
  Layout, Image, Video, Coffee, Map, Calendar,
  FileText, Database, Server, Shield, Lock,
  Heart, Star, Smartphone, Monitor, Headphones,
  Book, GraduationCap, DollarSign, CreditCard
};

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 24, className = "" }) => {
  const IconComponent = iconMap[name] || Globe;
  return <IconComponent size={size} className={className} />;
};

export default DynamicIcon;
