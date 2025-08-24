import React, { useState, useEffect, useMemo } from 'react';

const normalizeInitial = (iv) => ({
    name: iv?.name || '',
    description: iv?.description || '',
    category: iv?.category || '',
    sellingPrice: iv?.sellingPrice ?? iv?.price ?? 0,
    mrp: iv?.mrp ?? iv?.price ?? 0,
    quantity: iv?.quantity ?? iv?.stock ?? 0,
    available: iv?.available ?? true,
    imageUrl: iv?.imageUrl || ''
});

const MenuForm = ({ initialValues, onSave, onCancel, categories = [] }) => {
    const [form, setForm] = useState(normalizeInitial(initialValues));
    const [saving, setSaving] = useState(false);

    const fallbackCategories = useMemo(() => ([
        { key: 'snacks', name: 'Snacks', icon: '🍿' },
        { key: 'meals', name: 'Meals', icon: '🍛' },
        { key: 'beverages', name: 'Beverages', icon: '🥤' },
        { key: 'sweets', name: 'Sweets', icon: '🍰' },
        { key: 'breakfast', name: 'Breakfast', icon: '🥐' }
    ]), []);

    const options = categories && categories.length > 0 ? categories : fallbackCategories;

    // If no category set yet, or previous category is not in options, default to first option
    useEffect(() => {
        if (!form.category || !options.some(c => (c.key || c.id) === form.category)) {
            const first = options[0];
            if (first && (first.key || first.id)) {
                setForm((prev) => ({ ...prev, category: first.key || first.id }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.length]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                category: String(form.category).trim(),
                sellingPrice: Number(form.sellingPrice) || 0,
                mrp: Number(form.mrp) || Number(form.sellingPrice) || 0,
                quantity: Number(form.quantity) || 0,
                available: Boolean(form.available),
                imageUrl: form.imageUrl?.trim() || ''
            };
            // Backward-compatible fields
            payload.price = payload.sellingPrice;
            payload.stock = payload.quantity;
            await onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-primary" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className="input-primary">
                        {options.map((c) => (
                            <option key={c.key || c.id} value={c.key || c.id}>{`${c.icon ? c.icon + ' ' : ''}${c.name}`}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                    <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} className="input-primary" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                    <input name="mrp" type="number" value={form.mrp} onChange={handleChange} className="input-primary" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="input-primary" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input-primary" placeholder="https://..." />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="input-primary" rows={3} />
            </div>
            <div className="flex items-center justify-between">
                <label className="inline-flex items-center space-x-2">
                    <input name="available" type="checkbox" checked={!!form.available} onChange={handleChange} />
                    <span className="text-sm">Available</span>
                </label>
                <div className="space-x-2">
                    <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
                    <button disabled={saving} type="submit" className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                </div>
            </div>
        </form>
    );
};

export default MenuForm;


