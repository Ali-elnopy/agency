import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/workspaceStore';
import { useBrands } from '../../context/brandsStore';
import { initialsOf } from '../../services/brands';

/* Assigns an unassigned brand to a team from the dashboard alert.
   The brand update lands in the API first, then the workspace cache is
   refreshed so team brand lists and dashboard counters stay in sync. */
export default function AssignTeamModal({ isOpen, brand, onClose, onAssigned }) {
  const { teams, refresh } = useWorkspace();
  const { updateBrand } = useBrands();

  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTeamId('');
    setError('');
    setBusy(false);
  }, [isOpen, brand?.id]);

  const activeTeams = teams.filter((team) => team.status !== 'inactive');
  const selectedTeam = activeTeams.find((team) => String(team.id) === String(teamId)) ?? null;

  const handleAssign = async () => {
    if (busy) return;

    if (!brand?.id) {
      setError('This brand could not be identified. Refresh the dashboard and try again.');
      return;
    }

    if (!selectedTeam) {
      setError('Choose a team to continue.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await updateBrand(brand.id, { teamId: selectedTeam.id });
      await refresh().catch(() => {});
      onAssigned?.(selectedTeam.name, brand.name);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not assign this brand to the selected team.');
    } finally {
      setBusy(false);
    }
  };

  if (!brand) return null;

  const footer = (
    <>
      <button type="button" className="button button--ghost" onClick={onClose} disabled={busy}>
        Cancel
      </button>
      <button
        type="button"
        className="button button--primary"
        onClick={handleAssign}
        disabled={busy || activeTeams.length === 0}
      >
        <svg aria-hidden="true" className="icon">
          <use href="#i-layers" />
        </svg>
        {busy ? 'Assigning…' : 'Assign Team'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title="Assign Team"
      subtitle="Choose the team that will own this brand."
      icon="#i-layers"
      iconColor="orange"
      maxWidth="520px"
      dismissible={!busy}
      footer={footer}
    >
      <div className="modal-stack">
        {error ? <div className="modal-error">{error}</div> : null}

        <div className="modal-info-card">
          <div className="assign-brand">
            <span className="assign-brand__mark">{initialsOf(brand.name)}</span>
            <span className="assign-brand__body">
              <strong>{brand.name}</strong>
              <small>{brand.sub || 'No team assigned'}</small>
            </span>
          </div>
        </div>

        {activeTeams.length === 0 ? (
          <div className="ws-empty">
            <strong>No active teams yet.</strong>
            <p>Create a team from the Teams page, then assign this brand.</p>
          </div>
        ) : (
          <div className="team-picker" role="radiogroup" aria-label="Available teams">
            {activeTeams.map((team) => {
              const selected = String(team.id) === String(teamId);
              const brandCount = team.brandIds?.length ?? 0;

              return (
                <button
                  key={team.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`team-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    setTeamId(String(team.id));
                    if (error) setError('');
                  }}
                  disabled={busy}
                >
                  <span className="team-option__check" aria-hidden="true" />
                  <span className="team-option__body">
                    <span className="team-option__name">{team.name}</span>
                    <span className="team-option__meta">
                      {brandCount} {brandCount === 1 ? 'brand' : 'brands'} assigned
                      {team.description ? ` · ${team.description}` : ''}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
