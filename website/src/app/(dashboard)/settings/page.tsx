export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Business Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Business Profile</h2>
              <p className="text-sm text-gray-500">Update your company info and receipt details.</p>
          </div>
          <div className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Enter business name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="16" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="KES" />
                 </div>
              </div>
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Changes</button>
          </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">API Integration</h2>
              <p className="text-sm text-gray-500">Manage your connection to the POS desktop app.</p>
          </div>
          <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current API Key</label>
              <div className="flex gap-2">
                 <input type="text" readOnly value="whiz_*************************" className="flex-1 bg-gray-50 border-gray-300 rounded-md shadow-sm p-2 border text-gray-500" />
                 <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">Regenerate</button>
              </div>
          </div>
      </div>
    </div>
  );
}
