import { useState } from 'react';
import { CreditCardIcon, CalendarIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function PaymentForm({ amount, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Số thẻ không hợp lệ';
    }
    if (!formData.cardHolder) {
      newErrors.cardHolder = 'Vui lòng nhập tên chủ thẻ';
    }
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Ngày hết hạn không hợp lệ';
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Thanh toán</h2>
        
        <div className="mb-6">
          <p className="text-lg">Số tiền thanh toán:</p>
          <p className="text-2xl font-bold text-primary">
            {amount.toLocaleString()} VNĐ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Số thẻ</label>
            <div className="relative">
              <CreditCardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary ${
                  errors.cardNumber ? 'border-red-500' : ''
                }`}
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              />
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Các trường còn lại tương tự */}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};