"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, LogOut, Sparkles, Plus } from 'lucide-react';

const API_BASE = "https://finance-dashboard-assessment.onrender.com";

export default function FinanceDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [auth, setAuth] = useState({ username: "", password: "", token: "" });
  const [data, setData] = useState({ 
    summary: { total_income: 0, total_expense: 0, net_balance: 0 }, 
    records: [], 
    analytics: { category_data: [], trend_data: [], ai_insight: "" } 
  });
  const [newRec, setNewRec] = useState({ amount: "", record_type: "expense", category: "Food", date: new Date().toISOString().split('T')[0], description: "" });

  const apiRequest = (path: string, method = "GET", body: any = null): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${API_BASE}${path}`, true);
      
      xhr.setRequestHeader("Accept", "application/json");
      if (auth.token) {
          xhr.setRequestHeader("Authorization", `Bearer ${auth.token}`);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch(e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(`HTTP Error: ${xhr.status}`);
        }
      };

      xhr.onerror = () => reject(new Error("Network Error"));

      if (body) {
        if (body instanceof FormData) {
          xhr.send(body);
        } else {
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(body));
        }
      } else {
        xhr.send();
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', auth.username);
      formData.append('password', auth.password);
      
      const res = await apiRequest("/login", "POST", formData);
      setAuth({ ...auth, token: res.access_token });
      setIsLoggedIn(true);
      setTimeout(() => fetchFullData(res.access_token), 100);
    } catch (err) { 
      alert("Login Error. Ensure Backend is running on 127.0.0.1:8000"); 
    }
  };

  const fetchFullData = async (tokenOverride?: string) => {
    if (tokenOverride) auth.token = tokenOverride;
    
    try {
      const sum = await apiRequest("/dashboard", "GET");
      const rec = await apiRequest("/records", "GET");
      const ana = await apiRequest("/analytics", "GET");
      
      setData({ summary: sum, records: rec, analytics: ana });
    } catch (err) { 
      console.error("Fetch Data Error:", err);
      alert("Failed to load dashboard data. Please log in again.");
      setIsLoggedIn(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/records", "POST", { ...newRec, amount: parseFloat(newRec.amount) });
      await fetchFullData(); 
      setNewRec({ ...newRec, amount: "", description: "" }); 
    } catch (err) { 
      alert("Submission Error: Could not add record."); 
    }
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white">
      <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center font-mono">Finance<span className="text-blue-500">AI</span></h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="text" placeholder="Username" className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" onChange={(e)=>setAuth({...auth, username: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" onChange={(e)=>setAuth({...auth, password: e.target.value})} />
          <button className="w-full bg-blue-600 hover:bg-blue-500 transition-all py-4 rounded-xl font-bold">Sign In</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3 text-white">
            <LayoutDashboard className="text-blue-500" />
            <h1 className="text-2xl font-bold">Finance Dashboard</h1>
          </div>
          <button onClick={() => { setIsLoggedIn(false); setAuth({...auth, token: ""}); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl mb-10 flex items-center gap-4 shadow-inner">
          <Sparkles className="text-blue-400" size={24} />
          <p className="text-blue-100 font-medium italic">"{data.analytics.ai_insight || "Add transactions to see AI insights."}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <p className="text-slate-500 text-xs font-bold mb-2 uppercase">Net Balance</p>
                <h2 className="text-4xl font-black text-blue-400">${data.summary.net_balance.toLocaleString()}</h2>
              </div>
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <p className="text-slate-500 text-xs font-bold mb-2 uppercase">Total Income</p>
                <h2 className="text-4xl font-black text-emerald-400">${data.summary.total_income.toLocaleString()}</h2>
              </div>
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <p className="text-slate-500 text-xs font-bold mb-2 uppercase">Total Expenses</p>
                <h2 className="text-4xl font-black text-rose-500">${data.summary.total_expense.toLocaleString()}</h2>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <LineChart data={data.analytics.trend_data || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: "#3b82f6" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl self-start sticky top-8">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><Plus size={20} className="text-blue-500"/> New Entry</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="number" placeholder="Amount ($)" value={newRec.amount} className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500" onChange={(e)=>setNewRec({...newRec, amount: e.target.value})} required/>
              <select className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500" onChange={(e)=>setNewRec({...newRec, record_type: e.target.value})}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
              </select>
              <input type="text" placeholder="Description" value={newRec.description} className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500" onChange={(e)=>setNewRec({...newRec, description: e.target.value})} required />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl shadow-lg transition-all">Add Record</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}