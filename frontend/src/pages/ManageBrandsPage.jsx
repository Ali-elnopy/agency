import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';
import { useBrands } from '../context/brandsStore';
import { BRAND_STATUS_LABEL } from '../data/brands';

export default function ManageBrandsPage({ team: teamName, onBack, onSaved }) {
  const { teams, setTeamBrands } = useWorkspace();
  const { brands } = useBrands();
  const { toast, showToast } = useToast(3500);
  const team = teams.find((item) => item.name === teamName) ?? null;
  const [selected, setSelected] = useState(() => [...(team?.brandIds ?? [])]);

  if (!team) {
    return (
      <div className="ws-page">
        <button type="button" className="ws-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to Teams
        </button>
        <div className="ws-empty ws-empty--panel">
          <strong>Team not found.</strong>
          <p>This team may have been deleted.</p>
        </div>
      </div>
    );
  }

  const availableIds = brands.map((brand) => brand.id);
  const selectedCount = selected.filter((id) => availableIds.includes(id)).length;
  const allSelected = brands.length > 0 && selectedCount === brands.length;

  const toggleBrand = (brandId) => {
    setSelected((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId],
    );
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : availableIds);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setTeamBrands(
      team.id,
      selected.filter((id) => availableIds.includes(id)),
    );

    if (onSaved) {
      onSaved('Brands updated successfully.');
      return;
    }

    showToast('Brands updated successfully.');
  };

  return (
    <form className="ws-page ws-form-page" onSubmit={handleSubmit}>
      <button type="button" className="ws-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to {team.name}
      </button>

      <header className="ws-form-head">
        <span className="ws-eyebrow">Team Management</span>
        <h1 className="ws-page-title">Manage Brands</h1>
        <p className="ws-page-sub">Choose which brands are managed by {team.name}.</p>
      </header>

      <div className="ws-manage-card">
        <div className="ws-manage-head">
          <span>{selectedCount} brands selected</span>
          <button type="button" className="ws-link" onClick={toggleAll}>
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
        </div>

        <div className="ws-brand-choices">
          {brands.map((brand) => {
            const checked = selected.includes(brand.id);

            return (
              <label
                className={`ws-brand-choice${checked ? ' is-checked' : ''}`}
                key={brand.id}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(brand.id)}
                />
                <span className="ws-brand-choice__body">
                  <strong>{brand.name}</strong>
                  <small>
                    {brand.industry || 'No industry'} • {brand.country || 'No country'}
                  </small>
                </span>
                <span className={`ws-status ws-status--${brand.status}`}>
                  {BRAND_STATUS_LABEL[brand.status] ?? brand.status}
                </span>
              </label>
            );
          })}
        </div>

        {!brands.length && (
          <div className="ws-empty">
            <strong>No brands available.</strong>
            <p>Add a brand before assigning it to a team.</p>
          </div>
        )}

        <footer className="ws-form-foot">
          <button type="button" className="ws-btn ws-btn--ghost" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="ws-btn ws-btn--primary">
            Save Brands
          </button>
        </footer>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </form>
  );
}
