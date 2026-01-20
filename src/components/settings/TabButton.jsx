import React from 'react';
import { Button } from '@/components/ui/button';

const TabButton = ({ icon, label, isActive, onClick }) => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    onClick={onClick}
    className={`w-full justify-start text-base py-6 ${isActive ? 'bg-purple-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
  >
    {React.cloneElement(icon, { className: 'h-5 w-5' })}
    <span className="ml-3">{label}</span>
  </Button>
);

export default TabButton;