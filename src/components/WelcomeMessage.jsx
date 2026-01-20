import React from 'react';

const WelcomeMessage = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="text-center mb-12">
      <p className="text-2xl text-white">
        Bem-vindo de volta, <span className="font-bold" style={{ color: '#ff69b4' }}>{profile.full_name || profile.email}</span>!
      </p>
    </div>
  );
};

export default WelcomeMessage;