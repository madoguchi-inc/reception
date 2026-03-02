'use client';

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'MadoReception株式会社',
    welcomeMessage: 'ようこそ。受付にお越しいただきありがとうございます。',
    primaryColor: '#2563eb',
  });

  // Reception Settings
  const [receptionSettings, setReceptionSettings] = useState({
    requireVisitorName: true,
    requireCompanyName: true,
    requireEmail: true,
    requirePhone: true,
    allowedPurposes: [
      '営業打ち合わせ',
      '契約更新',
      '技術相談',
      '提案説明',
      'その他',
    ],
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    googleChatWebhookUrl: 'https://chat.googleapis.com/v1/spaces/SPACE_ID/messages',
    googleChatBotToken: '••••••••••••••••••••••••••••••••',
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@company.com',
    smtpPassword: '••••••••••••••••••••••••••••••••',
    fromAddress: 'noreply@company.com',
    fromName: 'MadoReception',
  });

  // Calendar Settings
  const [calendarSettings, setCalendarSettings] = useState({
    googleCalendarConnected: true,
  });

  const [newPurpose, setNewPurpose] = useState('');

  const handleSave = (section: string) => {
    setSaveSuccess(section);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleToggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddPurpose = () => {
    if (
      newPurpose &&
      !receptionSettings.allowedPurposes.includes(newPurpose)
    ) {
      setReceptionSettings({
        ...receptionSettings,
        allowedPurposes: [...receptionSettings.allowedPurposes, newPurpose],
      });
      setNewPurpose('');
    }
  };

  const handleRemovePurpose = (purpose: string) => {
    setReceptionSettings({
      ...receptionSettings,
      allowedPurposes: receptionSettings.allowedPurposes.filter(
        (p) => p !== purpose
      ),
    });
  };

  const handleTestNotification = () => {
    alert('Google Chat にテスト通知を送信しました');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-gray-600">
          MadoReception のシステム設定を管理します
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {[
            { id: 'general', label: '一般設定' },
            { id: 'reception', label: '受付設定' },
            { id: 'notification', label: '通知設定' },
            { id: 'email', label: 'メール設定' },
            { id: 'calendar', label: 'カレンダー設定' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">一般設定</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企業名
                </label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ウェルカムメッセージ
                </label>
                <textarea
                  value={generalSettings.welcomeMessage}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      welcomeMessage: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メインカラー
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={generalSettings.primaryColor}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={generalSettings.primaryColor}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave('general')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Save size={20} />
                保存する
              </button>

              {saveSuccess === 'general' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 size={20} />
                  設定を保存しました
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reception Settings */}
        {activeTab === 'reception' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">受付設定</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  必須項目
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'requireVisitorName', label: '来訪者名' },
                    { key: 'requireCompanyName', label: '会社名' },
                    { key: 'requireEmail', label: 'メール' },
                    { key: 'requirePhone', label: '電話番号' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          receptionSettings[item.key as keyof typeof receptionSettings] as boolean
                        }
                        onChange={(e) =>
                          setReceptionSettings({
                            ...receptionSettings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  許可する来訪目的
                </h3>
                <div className="space-y-3">
                  {receptionSettings.allowedPurposes.map((purpose) => (
                    <div
                      key={purpose}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {purpose}
                      </span>
                      <button
                        onClick={() => handleRemovePurpose(purpose)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value)}
                    placeholder="新しい目的を入力"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddPurpose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSave('reception')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Save size={20} />
                保存する
              </button>

              {saveSuccess === 'reception' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 size={20} />
                  設定を保存しました
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notification' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">通知設定</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Google Chat への通知設定を行うと、来訪予約や承認のお知らせをリアルタイムで受け取れます
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Chat Webhook URL
                </label>
                <div className="relative">
                  <input
                    type={showSecrets['webhook'] ? 'text' : 'password'}
                    value={notificationSettings.googleChatWebhookUrl}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        googleChatWebhookUrl: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <button
                    onClick={() => handleToggleSecret('webhook')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets['webhook'] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets['token'] ? 'text' : 'password'}
                    value={notificationSettings.googleChatBotToken}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        googleChatBotToken: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <button
                    onClick={() => handleToggleSecret('token')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets['token'] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleSave('notification')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  保存する
                </button>
                <button
                  onClick={handleTestNotification}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  テスト送信
                </button>
              </div>

              {saveSuccess === 'notification' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 size={20} />
                  設定を保存しました
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">メール設定</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP ホスト
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP ポート
                  </label>
                  <input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP ユーザー名
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpUsername}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      smtpUsername: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP パスワード
                </label>
                <div className="relative">
                  <input
                    type={showSecrets['smtp'] ? 'text' : 'password'}
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <button
                    onClick={() => handleToggleSecret('smtp')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets['smtp'] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    差出人メールアドレス
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromAddress}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromAddress: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    差出人名
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave('email')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Save size={20} />
                保存する
              </button>

              {saveSuccess === 'email' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 size={20} />
                  設定を保存しました
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar Settings */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              カレンダー設定
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  {calendarSettings.googleCalendarConnected ? (
                    <>
                      <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Google Calendar が接続されています
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          会議室の空き状況を自動的に確認し、予約管理を行います
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Google Calendar が接続されていません
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          カレンダー連携を有効にするには接続が必要です
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                className={`${
                  calendarSettings.googleCalendarConnected
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-2 px-6 rounded-lg transition-colors`}
              >
                {calendarSettings.googleCalendarConnected
                  ? '接続を解除'
                  : 'Google Calendar と接続'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
