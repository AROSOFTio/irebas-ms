import React from 'react';
import { ShieldCheck, Database, Key } from 'lucide-react';

const Settings = () => {
    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-gray-400 pl-3">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Platform, API, and Integration Configuration.</p>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center bg-gray-50">
                    <ShieldCheck className="w-5 h-5 text-gray-500 mr-2" />
                    <h2 className="font-bold text-gray-800">Firewall Rules Engine</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Automated Blocking</p>
                            <p className="text-xs text-gray-500">Automatically blacklist IP addresses after 5 failed login attempts.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primeBlue"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Machine Learning Heuristics</p>
                            <p className="text-xs text-gray-500">Enable AI-based pattern recognition for anomalous wire transfers.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primeBlue"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center bg-gray-50">
                    <Database className="w-5 h-5 text-gray-500 mr-2" />
                    <h2 className="font-bold text-gray-800">Data Retention & Storage</h2>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Audit Log Retention Policy</label>
                        <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primeBlue focus:border-primeBlue sm:text-sm rounded-md shadow-sm border bg-white">
                            <option>90 Days (Compliance standard)</option>
                            <option>180 Days</option>
                            <option>1 Year</option>
                            <option>Indefinite</option>
                        </select>
                    </div>
                    <div>
                         <p className="text-xs text-gray-500">Logs older than the retention policy are securely archived to cold storage.</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end">
                 <button className="bg-primeBlue text-white font-semibold px-6 py-2 rounded shadow opacity-50 cursor-not-allowed">
                     Save Settings
                 </button>
            </div>
        </div>
    );
};

export default Settings;
