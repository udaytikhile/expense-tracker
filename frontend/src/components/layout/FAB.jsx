import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

export default function FAB() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/expenses/add');
  };

  return (
    <button className="fab" onClick={handleClick} id="fab-add-expense" aria-label="Add Expense">
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
