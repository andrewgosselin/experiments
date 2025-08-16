"use client";

import React, { useState } from "react";
import { getSites, createSite, updateSite, deleteSite, setDefaultSite, type Site, type CreateSiteInput } from "@/actions/sites";
import { GlobalSettings } from "@/actions/settings";

interface SitesPageClientProps {
  initialSites: Site[];
  initialGlobalSettings: GlobalSettings;
}

export default function SiteList({ initialSites, initialGlobalSettings }: SitesPageClientProps) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [globalSettings] = useState<GlobalSettings>(initialGlobalSettings);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSiteInput>({
    name: '',
    domain: '',
    description: '',
    isActive: true,
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSite) {
        // Update existing site
        await updateSite(editingSite._id!, formData);
        setMessage({ type: 'success', text: 'Site updated successfully' });
      } else {
        // Create new site
        await createSite(formData);
        setMessage({ type: 'success', text: 'Site created successfully' });
      }
      
      // Reset form and reload sites
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving site:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save site' });
    }
  };

  const loadData = async () => {
    try {
      // Use the server action directly
      const sitesData = await getSites({ sort: 'name' });
      setSites(sitesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      domain: site.domain,
      description: site.description || '',
      isActive: site.isActive,
      isDefault: site.isDefault || false,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (site: Site) => {
    if (!confirm(`Are you sure you want to delete "${site.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSite(site._id!);
      setMessage({ type: 'success', text: 'Site deleted successfully' });
      await loadData();
    } catch (error) {
      console.error('Error deleting site:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete site' });
    }
  };

  const handleSetDefault = async (site: Site) => {
    try {
      await setDefaultSite(site._id!);
      setMessage({ type: 'success', text: 'Default site updated successfully' });
      await loadData();
    } catch (error) {
      console.error('Error setting default site:', error);
      setMessage({ type: 'error', text: 'Failed to set default site' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      description: '',
      isActive: true,
      isDefault: false,
    });
    setEditingSite(null);
    setShowCreateForm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sites</h1>
          <p className="text-[#A1A1AA] mt-1">Manage your multi-site configuration</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Site
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 border border-green-700 text-green-400' 
            : 'bg-red-900/20 border border-red-700 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-[#232326] rounded-lg border border-[#383838]">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingSite ? 'Edit Site' : 'Create New Site'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#F3F3F6] mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#18181A] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F3F3F6] mb-2">
                  {globalSettings?.routingType === 'domain' ? 'Domain *' : 'Path *'}
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-[#18181A] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder={globalSettings?.routingType === 'domain' ? 'example.com' : 'example'}
                  required
                />
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {globalSettings?.routingType === 'domain' 
                    ? 'Enter the full domain (e.g., example.com, blog.example.com)'
                    : 'Enter the path prefix (e.g., example, blog) - will be accessed as /example, /blog'
                  }
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F3F3F6] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181A] border border-[#383838] rounded-lg text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Optional description for this site"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-[#383838] border-[#383838] focus:ring-blue-500"
                />
                <span className="text-sm text-[#F3F3F6]">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-[#383838] border-[#383838] focus:ring-blue-500"
                />
                <span className="text-sm text-[#F3F3F6]">Default Site</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingSite ? 'Update Site' : 'Create Site'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-[#383838] text-[#F3F3F6] rounded-lg hover:bg-[#4A4A4D] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sites List */}
      <div className="bg-[#232326] rounded-lg border border-[#383838] overflow-hidden">
        {sites.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[#A1A1AA] mb-2">No sites found</div>
            <p className="text-sm text-[#71717A]">Create your first site to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#18181A] border-b border-[#383838]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383838]">
                {sites.map((site) => (
                  <tr key={site._id} className="hover:bg-[#2A2A2D] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            {site.name}
                            {site.isDefault && (
                              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          {site.description && (
                            <div className="text-sm text-[#A1A1AA]">{site.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#F3F3F6]">{site.domain}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        site.isActive
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {site.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#A1A1AA]">
                        {formatDate(site.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!site.isDefault && (
                          <button
                            onClick={() => handleSetDefault(site)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(site)}
                          className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        {!site.isDefault && (
                          <button
                            onClick={() => handleDelete(site)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 