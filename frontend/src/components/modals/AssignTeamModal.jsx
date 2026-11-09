import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { useWorkspace } from '../../context/workspaceStore';
import { useBrands } from '../../context/brandsStore';
import { initialsOf } from '../../services/brands';

/* Assigns an unassigned brand to a team from the dashboard alert.
   Brand and team lists come from the workspace (API or local project data).
   The brand update lands in the API first, then the workspace cache is
   refreshed in the background so team brand lists stay in sync without
   making the dialog wait on the (slow) re-read. */

function brandBelongsToTeam(brand, team) {
  if (brand?.teamId != null) return String(brand.teamId) === String(team.id);

  return Boolean(brand?.team) && brand.team === team.name;
}
export default function AssignTeamModal({ isOpen, brand, onClose, onAssigned }) {
  const { teams, users, loading, refresh } = useWorkspace();
  const { brands, updateBrand } = useBrands();

  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const resolvedBrand = useMemo(() => {
    if (!brand) return null;

    return brands.find((item) => String(item.id) === String(brand.id)) ?? brand;
  }, [brand, brands]);

  useEffect(() => {
    if (!isOpen) return;

    setTeamId('');
    setError('');
    setBusy(false);
  }, [isOpen, resolvedBrand?.id]);

  const activeTeams = useMemo(
    () => teams.filter((team) => team.status !== 'inactive'),
    [teams],
  );
  const selectedTeam = activeTeams.find((team) => String(team.id) === String(teamId)) ?? null;

  const handleAssign = async () => {
    if (busy) return;

    if (!resolvedBrand?.id) {
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
      await updateBrand(resolvedBrand.id, {
        teamId: selectedTeam.id,
        team: selectedTeam.name,
      });

      // The brand is persisted and the dashboard derives its counters from the
      // brands list, so close the dialog right away. Syncing the workspace
      // (team member/brand lists) continues in the background.
      onAssigned?.(selectedTeam.name, resolvedBrand.name);
      onClose();
      refresh().catch(() => {});
    } catch (err) {
      setError(err?.message || 'Could not assign this brand to the selected team.');
      setBusy(false);
    }
  };

  if (!resolvedBrand) return null;

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
            <span className="assign-brand__mark">{initialsOf(resolvedBrand.name)}</span>
            <span className="assign-brand__body">
              <strong>{resolvedBrand.name}</strong>
              <small>
                {resolvedBrand.industry
                  ? `${resolvedBrand.industry} · No team assigned`
                  : resolvedBrand.sub || 'No team assigned'}
              </small>
            </span>
          </div>
        </div>

        {loading && activeTeams.length === 0 ? (
          <div className="ws-empty">
            <strong>Loading teams…</strong>
            <p>Workspace teams are being loaded from the project.</p>
          </div>
        ) : activeTeams.length === 0 ? (
          <div className="ws-empty">
            <strong>No active teams yet.</strong>
            <p>Create a team from the Teams page, then assign this brand.</p>
          </div>
        ) : (
          <div className="team-picker" role="radiogroup" aria-label="Available teams">
            {activeTeams.map((team) => {
              const selected = String(team.id) === String(teamId);
              const linkedBrandCount = brands.filter((item) =>
                brandBelongsToTeam(item, team),
              ).length;
              const brandCount =
                brands.some((item) => item.teamId != null)
                  ? linkedBrandCount
                  : (team.brandIds?.length ?? 0);
              const memberCount = Math.max(
                users.filter((user) => String(user.teamId) === String(team.id)).length,
                team.memberIds?.length ?? 0,
              );

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
                      {` · ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
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
