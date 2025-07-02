import { useState } from "react";
import { FiTruck, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import api from "../../services/api";

interface Transport {
  transport_type: string;
  provider: string;
  cost: number;
  notes: string;
}

interface TransportDetailsProps {
  postId: string;
  onClose: () => void;
}

export default function TransportDetails({ postId, onClose }: TransportDetailsProps) {
  const [transports, setTransports] = useState<Transport[]>([
    { transport_type: "", provider: "", cost: 0, notes: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const transportTypes = [
    "Flight", "Train", "Bus", "Car", "Taxi", "Boat", "Ferry", 
    "Metro", "Uber", "Lyft", "Motorcycle", "Bicycle", "Walking", "Other"
  ];

  const addTransport = () => {
    setTransports([...transports, { transport_type: "", provider: "", cost: 0, notes: "" }]);
  };

  const removeTransport = (index: number) => {
    if (transports.length > 1) {
      setTransports(transports.filter((_, i) => i !== index));
    }
  };

  const updateTransport = (index: number, field: keyof Transport, value: string | number) => {
    const updated = transports.map((transport, i) => 
      i === index ? { ...transport, [field]: value } : transport
    );
    setTransports(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty transports
      const validTransports = transports.filter(t => 
        t.transport_type && t.provider && t.cost > 0
      );

      if (validTransports.length === 0) {
        setError("Please add at least one valid transport detail");
        setLoading(false);
        return;
      }

      // Submit each transport
      for (const transport of validTransports) {
        await api.post(`/transports/post/${postId}`, {
          post_id: postId,
          ...transport
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save transport details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiTruck className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Transport Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FiX className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiSave className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Transport Details Saved!</h3>
                <p className="text-emerald-700 text-sm">Your transport information has been added to your post.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {transports.map((transport, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Transport #{index + 1}</h3>
                    {transports.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransport(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Transport Type *
                      </label>
                      <select
                        required
                        value={transport.transport_type}
                        onChange={(e) => updateTransport(index, 'transport_type', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select transport type</option>
                        {transportTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Provider/Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={transport.provider}
                        onChange={(e) => updateTransport(index, 'provider', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="e.g., Bangladesh Railway"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Cost (USD) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={transport.cost}
                        onChange={(e) => updateTransport(index, 'cost', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={transport.notes}
                        onChange={(e) => updateTransport(index, 'notes', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        placeholder="e.g., Comfortable seat, scenic view"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTransport}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus />
                Add Another Transport
              </button>
            </div>

            <div className="flex gap-4 mt-8 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-2xl font-semibold text-white transition-colors ${
                  loading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Transport Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}