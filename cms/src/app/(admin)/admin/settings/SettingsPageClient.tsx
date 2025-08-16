"use client";

import React, { useState } from "react";
import { saveGlobalSettings, type GlobalSettings } from "@/actions/settings";

interface SettingsPageClientProps {
  initialSettings: GlobalSettings;
}

export default function SettingsPageClient({ initialSettings }: SettingsPageClientProps) {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updatedSettings = await saveGlobalSettings({
        multiSiteEnabled: settings.multiSiteEnabled,
        routingType: settings.routingType,
      });
      
      setSettings(updatedSettings);
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Global Settings</h1>
          <p className="text-[#A1A1AA]">Configure system-wide settings for your CMS</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        <div className="bg-[#18181A] rounded-lg border border-[#383838] p-6">
          <div className="space-y-8">
            {/* Multi-site Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Multi-site Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#232326] rounded-lg border border-[#383838]">
                  <div>
                    <h3 className="text-white font-medium mb-1">Enable Multi-site</h3>
                    <p className="text-sm text-[#A1A1AA]">
                      Allow multiple sites to be managed from a single CMS instance
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.multiSiteEnabled}
                      onChange={(e) => updateSetting('multiSiteEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Routing Type Selection */}
                {settings.multiSiteEnabled && (
                  <div className="p-4 bg-[#232326] rounded-lg border border-[#383838]">
                    <h3 className="text-white font-medium mb-3">Routing Type</h3>
                    <p className="text-sm text-[#A1A1AA] mb-4">
                      Choose how your multi-site URLs will be structured
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-[#383838] hover:bg-[#2A2A2D] cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="routingType"
                          value="path"
                          checked={settings.routingType === 'path'}
                          onChange={(e) => updateSetting('routingType', e.target.value as 'path' | 'domain')}
                          className="w-4 h-4 text-blue-600 bg-[#383838] border-[#383838] focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <div className="text-white font-medium">Path-based Routing</div>
                          <div className="text-sm text-[#A1A1AA]">
                            Sites are accessed via URL paths (e.g., /site1/page, /site2/page)
                          </div>
                          <div className="text-xs text-[#71717A] mt-1">
                            Example: yourdomain.com/site1/about
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 p-3 rounded-lg border border-[#383838] hover:bg-[#2A2A2D] cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="routingType"
                          value="domain"
                          checked={settings.routingType === 'domain'}
                          onChange={(e) => updateSetting('routingType', e.target.value as 'path' | 'domain')}
                          className="w-4 h-4 text-blue-600 bg-[#383838] border-[#383838] focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <div className="text-white font-medium">Domain-based Routing</div>
                          <div className="text-sm text-[#A1A1AA]">
                            Each site has its own domain or subdomain
                          </div>
                          <div className="text-xs text-[#71717A] mt-1">
                            Example: site1.yourdomain.com/about
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Settings Sections */}
            <div className="border-t border-[#383838] pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Additional Settings</h2>
              <div className="text-[#A1A1AA] text-sm">
                More configuration options will be available here in future updates.
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-[#383838] flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                saving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 