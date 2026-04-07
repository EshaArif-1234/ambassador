'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'toggle' | 'textarea' | 'url' | 'tel';
  value: any;
  options?: string[];
  required?: boolean;
}

interface SettingsData {
  general: {
    appName: string;
    appUrl: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    logo: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    paymentNotifications: boolean;
    userRegistrationNotifications: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordExpiry: number;
  };
  payment: {
    gateway: string;
    stripePublicKey: string;
    stripeSecretKey: string;
    currency: string;
    taxRate: number;
    shippingFee: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
}

const AdminSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Settings sections
  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic application configuration',
      icon: 'settings'
    },
    {
      id: 'company',
      title: 'Company Information',
      description: 'Company details and contact information',
      icon: 'company'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email and in-app notification settings',
      icon: 'notifications'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security and authentication settings',
      icon: 'security'
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Payment gateway and billing configuration',
      icon: 'payment'
    },
    {
      id: 'email',
      title: 'Email Configuration',
      description: 'SMTP and email settings',
      icon: 'email'
    }
  ];

  // Settings data
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      appName: 'Ambassadors Kitchen',
      appUrl: 'https://ambassadors-kitchen.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    company: {
      name: 'Ambassadors Kitchen',
      email: 'info@ambassadors-kitchen.com',
      phone: '+1 234-567-8900',
      address: '123 Main St, City, State 12345',
      description: 'Premium kitchen equipment and appliances',
      logo: ''
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      paymentNotifications: true,
      userRegistrationNotifications: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      passwordExpiry: 90
    },
    payment: {
      gateway: 'stripe',
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: 'sk_test_...',
      currency: 'USD',
      taxRate: 8.5,
      shippingFee: 10
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@ambassadors-kitchen.com',
      fromName: 'Ambassadors Kitchen'
    }
  });

  const handleSettingChange = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    setSaveMessage('Settings saved successfully!');
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const renderSettingField = (section: keyof SettingsData, item: SettingItem) => {
    const value = (settings[section] as any)[item.id];

    switch (item.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(section, item.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(section, item.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {item.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(section, item.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        );

      case 'password':
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => handleSettingChange(section, item.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type={item.type}
            value={value}
            onChange={(e) => handleSettingChange(section, item.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        );
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Name
                </label>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'appName',
                  label: 'Application Name',
                  description: 'Name of your application',
                  type: 'text',
                  value: settings.general.appName
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application URL
                </label>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'appUrl',
                  label: 'Application URL',
                  description: 'Base URL of your application',
                  type: 'url',
                  value: settings.general.appUrl
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'timezone',
                  label: 'Timezone',
                  description: 'Default timezone for the application',
                  type: 'select',
                  value: settings.general.timezone,
                  options: ['UTC', 'EST', 'PST', 'GMT', 'CET']
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'language',
                  label: 'Language',
                  description: 'Default language',
                  type: 'select',
                  value: settings.general.language,
                  options: ['en', 'es', 'fr', 'de', 'it']
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
                </div>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'maintenanceMode',
                  label: 'Maintenance Mode',
                  description: 'Enable maintenance mode',
                  type: 'toggle',
                  value: settings.general.maintenanceMode
                })}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
                  <p className="text-sm text-gray-500">Enable debug logging and error details</p>
                </div>
                {renderSettingField('general' as keyof SettingsData, {
                  id: 'debugMode',
                  label: 'Debug Mode',
                  description: 'Enable debug mode',
                  type: 'toggle',
                  value: settings.general.debugMode
                })}
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                {renderSettingField('company' as keyof SettingsData, {
                  id: 'name',
                  label: 'Company Name',
                  description: 'Legal company name',
                  type: 'text',
                  value: settings.company.name
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                {renderSettingField('company' as keyof SettingsData, {
                  id: 'email',
                  label: 'Company Email',
                  description: 'Official company email',
                  type: 'email',
                  value: settings.company.email
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                {renderSettingField('company' as keyof SettingsData, {
                  id: 'phone',
                  label: 'Company Phone',
                  description: 'Company contact number',
                  type: 'tel',
                  value: settings.company.phone
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                {renderSettingField('company' as keyof SettingsData, {
                  id: 'address',
                  label: 'Company Address',
                  description: 'Physical company address',
                  type: 'text',
                  value: settings.company.address
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              {renderSettingField('company' as keyof SettingsData, {
                id: 'description',
                label: 'Company Description',
                description: 'Brief description of your company',
                type: 'textarea',
                value: settings.company.description
              })}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {key === 'emailNotifications' && 'Enable email notifications'}
                      {key === 'orderNotifications' && 'Notify on new orders'}
                      {key === 'paymentNotifications' && 'Notify on payment events'}
                      {key === 'userRegistrationNotifications' && 'Notify on new user registrations'}
                      {key === 'systemAlerts' && 'Receive system alerts and warnings'}
                      {key === 'marketingEmails' && 'Send marketing and promotional emails'}
                    </p>
                  </div>
                  {renderSettingField('notifications' as keyof SettingsData, {
                    id: key,
                    label: key,
                    description: '',
                    type: 'toggle',
                    value: value
                  })}
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'sessionTimeout',
                  label: 'Session Timeout',
                  description: 'User session duration in minutes',
                  type: 'number',
                  value: settings.security.sessionTimeout
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Password Length
                </label>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'passwordMinLength',
                  label: 'Password Min Length',
                  description: 'Minimum characters required for passwords',
                  type: 'number',
                  value: settings.security.passwordMinLength
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Login Attempts
                </label>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'maxLoginAttempts',
                  label: 'Max Login Attempts',
                  description: 'Maximum failed login attempts before lockout',
                  type: 'number',
                  value: settings.security.maxLoginAttempts
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lockout Duration (minutes)
                </label>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'lockoutDuration',
                  label: 'Lockout Duration',
                  description: 'Account lockout duration in minutes',
                  type: 'number',
                  value: settings.security.lockoutDuration
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'passwordExpiry',
                  label: 'Password Expiry',
                  description: 'Days before password expires',
                  type: 'number',
                  value: settings.security.passwordExpiry
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                {renderSettingField('security' as keyof SettingsData, {
                  id: 'requireTwoFactor',
                  label: 'Two-Factor Authentication',
                  description: 'Enable 2FA requirement',
                  type: 'toggle',
                  value: settings.security.requireTwoFactor
                })}
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Gateway
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'gateway',
                  label: 'Payment Gateway',
                  description: 'Select payment gateway provider',
                  type: 'select',
                  value: settings.payment.gateway,
                  options: ['stripe', 'paypal', 'square', 'razorpay']
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'currency',
                  label: 'Currency',
                  description: 'Default currency for transactions',
                  type: 'select',
                  value: settings.payment.currency,
                  options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Public Key
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'stripePublicKey',
                  label: 'Stripe Public Key',
                  description: 'Stripe API public key',
                  type: 'text',
                  value: settings.payment.stripePublicKey
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Secret Key
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'stripeSecretKey',
                  label: 'Stripe Secret Key',
                  description: 'Stripe API secret key',
                  type: 'password',
                  value: settings.payment.stripeSecretKey
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'taxRate',
                  label: 'Tax Rate',
                  description: 'Default tax rate percentage',
                  type: 'number',
                  value: settings.payment.taxRate
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Fee
                </label>
                {renderSettingField('payment' as keyof SettingsData, {
                  id: 'shippingFee',
                  label: 'Shipping Fee',
                  description: 'Default shipping fee',
                  type: 'number',
                  value: settings.payment.shippingFee
                })}
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'smtpHost',
                  label: 'SMTP Host',
                  description: 'SMTP server hostname',
                  type: 'text',
                  value: settings.email.smtpHost
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'smtpPort',
                  label: 'SMTP Port',
                  description: 'SMTP server port',
                  type: 'number',
                  value: settings.email.smtpPort
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'smtpUsername',
                  label: 'SMTP Username',
                  description: 'SMTP authentication username',
                  type: 'text',
                  value: settings.email.smtpUsername
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'smtpPassword',
                  label: 'SMTP Password',
                  description: 'SMTP authentication password',
                  type: 'password',
                  value: settings.email.smtpPassword
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'fromEmail',
                  label: 'From Email',
                  description: 'Default from email address',
                  type: 'email',
                  value: settings.email.fromEmail
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                {renderSettingField('email' as keyof SettingsData, {
                  id: 'fromName',
                  label: 'From Name',
                  description: 'Default from name',
                  type: 'text',
                  value: settings.email.fromName
                })}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Email Configuration</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Make sure your SMTP settings are correctly configured to send emails from the application.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section to configure settings</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your application settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {section.id === 'general' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      )}
                      {section.id === 'company' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      )}
                      {section.id === 'notifications' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zm0 0v-5a5 5 0 00-5-5H5a5 5 0 00-5 5v5a5 5 0 005 5h5a5 5 0 005-5z" />
                      )}
                      {section.id === 'security' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      )}
                      {section.id === 'payment' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      )}
                      {section.id === 'email' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      )}
                    </svg>
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>

              <div className="p-6">
                {renderSectionContent()}
              </div>

              {/* Save Button */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    {saveMessage && (
                      <div className="text-sm text-green-600">
                        {saveMessage}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
