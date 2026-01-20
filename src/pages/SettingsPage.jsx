import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TabButton from '@/components/settings/TabButton';
import ProfileTab from '@/components/settings/ProfileTab';
import UsersTab from '@/components/settings/UsersTab';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center mb-8">
          <Link to="/" className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Configurações
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64">
            <nav className="flex flex-row md:flex-col gap-2">
              <TabButton
                icon={<User />}
                label="Perfil"
                isActive={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <TabButton
                icon={<Users />}
                label="Usuários"
                isActive={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
              />
            </nav>
          </aside>

          <main className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-effect rounded-2xl p-6 md:p-8"
            >
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'users' && <UsersTab />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;