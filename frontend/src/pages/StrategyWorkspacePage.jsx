import React, { useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import { useBrands } from '../context/brandsStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  STRATEGY_FLOW,
  STRATEGY_FLOW_LABEL,
  STRATEGY_FLOW_TONE,
  formatStamp,
} from '../data/sprint3';
import {
  EmptyState,
  PageHeader,
  StatusPill,
} from '../components/sprint3/Sprint3UI';

export default function StrategyWorkspacePage({ initialBrandId, onOpenBriefs, onOpenContent }) {
  const { user } = useAuth();
  const { brands } = useBrands();
  const {
    briefs,
    strategies: allStrategies,
    saveStrategy,
    setStrategyStatus,
    deleteStrategy,
    role: systemRole,
    lang,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(5000);

  // Active brands
  const activeBrands = brands.filter((brand) => brand.status !== 'archived');
  const [brandId, setBrandId] = useState(() => {
    if (initialBrandId) return String(initialBrandId);
    // prefer Bean & Co Cafe or first brand
    const beanco = activeBrands.find((b) => b.id === 'brand-beanco');
    return beanco ? beanco.id : (activeBrands[0]?.id || '');
  });

  useEffect(() => {
    if (initialBrandId) {
      setBrandId(String(initialBrandId));
    }
  }, [initialBrandId]);

  // Role simulation toggle for testing all views from Mostafa's PDF
  const defaultRoleView = useMemo(() => {
    if (user?.role === 'CLIENT') return 'client';
    if (user?.role === 'ACCOUNT_MANAGER') return 'account_manager';
    return 'employee'; // employee/content creator
  }, [user]);

  const [roleView, setRoleView] = useState(defaultRoleView);

  // Modals & Action States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Form states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadVersion, setUploadVersion] = useState('1');
  const [uploadBrief, setUploadBrief] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [amComments, setAmComments] = useState('Please add a content calendar outline and specify reel formats.');
  const [clientReason, setClientReason] = useState('Please focus more on Instagram Reels and TikTok engagement.');
  const [clientError, setClientError] = useState('');

  // Find current brand
  const brand = brands.find((item) => String(item.id) === String(brandId)) || activeBrands[0] || null;

  // Find associated approved brief for this brand
  const approvedBrief = useMemo(
    () =>
      briefs
        .filter((brief) => String(brief.brandId) === String(brandId))
        .sort((a, b) => (b.status === 'approved' ? 1 : 0) - (a.status === 'approved' ? 1 : 0))[0] || null,
    [briefs, brandId],
  );

  // Find strategies for this brand
  const strategies = useMemo(
    () =>
      allStrategies
        .filter((item) => String(item.brandId) === String(brandId))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [brandId, allStrategies],
  );

  const [selectedId, setSelectedId] = useState(null);
  const strategy = strategies.find((item) => item.id === selectedId) || strategies[0] || null;

  const strategyStatus = strategy?.status || 'draft';
  const isApproved = strategyStatus === 'approved';

  // Format date helper
  const formatDateStr = (dateVal) => {
    if (!dateVal) return '14 Nov 2026';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Operations
  const handleOpenUpload = () => {
    setUploadFile(null);
    setUploadFileName(`${(brand?.name || 'Brand').replace(/[^a-zA-Z0-9]/g, '_')}_Strategy.pdf`);
    setUploadVersion('1');
    setUploadBrief(approvedBrief?.title || approvedBrief?.sections ? 'Brief v1' : 'Brief v1');
    setIsUploadOpen(true);
  };

  const handleOpenNewVersion = () => {
    if (!strategy) return;
    const currentVer = parseInt(strategy.version || '1', 10);
    setUploadFile(null);
    setUploadFileName(strategy.fileName || 'Strategy-v2.pdf');
    setUploadVersion(isNaN(currentVer) ? '2' : String(currentVer + 1));
    setVersionNote('');
    setIsNewVersionOpen(true);
  };

  const handleSaveUpload = (asPendingReview = false) => {
    if (!brand) return;
    const newFileName = uploadFileName.trim() || `${brand.name.replace(/[^a-zA-Z0-9]/g, '_')}_Strategy.pdf`;
    const newVersion = uploadVersion.trim() || '1';

    const newStrategy = {
      id: `strat-${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      briefId: approvedBrief?.id || 'brief-1',
      associatedBrief: uploadBrief || 'Brief v1',
      title: `${brand.name} Content Strategy`,
      fileName: newFileName,
      fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.8 MB',
      fileType: 'application/pdf',
      version: newVersion,
      uploadDate: formatDateStr(new Date()),
      status: asPendingReview ? 'in_review' : 'draft',
      authorName: user?.fullName || 'Noah Reed (Content Creator)',
      reviewerName: '',
      reviewerNote: '',
      clientReason: '',
      history: [
        {
          version: newVersion,
          fileName: newFileName,
          fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.8 MB',
          uploadedBy: user?.fullName || 'Noah Reed',
          uploadedAt: formatDateStr(new Date()),
          note: asPendingReview ? 'Initial strategy uploaded and submitted for review.' : 'Initial draft uploaded.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStrategy(newStrategy);
    setSelectedId(newStrategy.id);
    setIsUploadOpen(false);
    showToast(
      asPendingReview
        ? t('Strategy file uploaded and submitted for internal review!')
        : t('Strategy file saved as a draft.'),
      'success',
    );
  };

  const handleSaveNewVersion = () => {
    if (!strategy) return;
    const newFileName = uploadFileName.trim() || strategy.fileName || 'Strategy.pdf';
    const newVersion = uploadVersion.trim() || String(parseInt(strategy.version || '1', 10) + 1);

    const updated = {
      ...strategy,
      fileName: newFileName,
      fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
      version: newVersion,
      uploadDate: formatDateStr(new Date()),
      status: 'in_review', // reset to Pending Internal Review when new version uploaded
      updatedAt: new Date().toISOString(),
      history: [
        ...(strategy.history || []),
        {
          version: newVersion,
          fileName: newFileName,
          fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
          uploadedBy: user?.fullName || 'Noah Reed',
          uploadedAt: formatDateStr(new Date()),
          note: versionNote.trim() || 'Uploaded new version of the strategy document.',
        },
      ],
    };

    saveStrategy(updated);
    setIsNewVersionOpen(false);
    showToast(t(`Version ${newVersion} uploaded successfully and submitted for internal review!`), 'success');
  };

  const handleDownload = () => {
    if (!strategy) return;
    showToast(`${t('Downloading')} ${strategy.fileName || 'Strategy.pdf'}…`, 'info');
    // Simulated browser download
    try {
      const blob = new Blob(
        [
          `ORVIA CONTENT STRATEGY DOCUMENT\nBrand: ${strategy.brandName}\nVersion: ${strategy.version}\nFile: ${strategy.fileName}\nStatus: ${strategy.status}\nDate: ${strategy.uploadDate}`,
        ],
        { type: 'application/pdf' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = strategy.fileName || 'Strategy.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  const handleDeleteStrategy = () => {
    if (!strategy) return;
    deleteStrategy(strategy.id);
    setIsDeleteOpen(false);
    setSelectedId(null);
    showToast(t('Strategy file deleted.'), 'danger');
  };

  // Submit draft to AM
  const handleSubmitForReview = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'in_review', {
      actor: user?.fullName || 'Content Creator',
      note: 'Submitted for internal review by Account Manager',
    });
    showToast(t('Strategy submitted to Account Manager for internal review.'), 'success');
  };

  // Account Manager: Return to Creator with comments (Changes Requested)
  const handleAmReturnToCreator = () => {
    if (!strategy) return;
    if (!amComments.trim()) {
      showToast(t('Please add comments explaining the requested changes.'), 'danger');
      return;
    }
    setStrategyStatus(strategy.id, 'changes_requested', {
      reviewerNote: amComments.trim(),
      reviewerName: user?.fullName || 'Elena Vance (Account Manager)',
      actor: user?.fullName || 'Account Manager',
      note: amComments.trim(),
    });
    showToast(t('Strategy returned to the creator with comments.'), 'info');
  };

  // Account Manager: Approve internally and send to client
  const handleAmApprove = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'client_review', {
      reviewerNote: amComments.trim() || 'Internal review passed. Approved for client review.',
      reviewerName: user?.fullName || 'Elena Vance (Account Manager)',
      actor: user?.fullName || 'Account Manager',
      note: 'Internal review passed. Ready for client review.',
    });
    showToast(t('Strategy approved and forwarded to the client for final review.'), 'success');
  };

  // Client: Request Changes with reason
  const handleClientRequestChanges = () => {
    if (!strategy) return;
    if (!clientReason.trim()) {
      setClientError(t('Reason is required'));
      return;
    }
    setStrategyStatus(strategy.id, 'changes_requested', {
      clientReason: clientReason.trim(),
      clientName: user?.fullName || 'Sarah Jenkins (Client)',
      actor: user?.fullName || 'Client',
      note: clientReason.trim(),
    });
    setClientError('');
    showToast(t('Change request submitted to the agency team.'), 'info');
  };

  // Client: Approve strategy
  const handleClientApprove = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'client_approved', {
      clientName: user?.fullName || 'Sarah Jenkins (Client)',
      actor: user?.fullName || 'Client',
      note: 'Client approved the strategy.',
      approvedAt: new Date().toISOString(),
    });
    showToast(t('Strategy approved! Awaiting Account Manager final sign-off.'), 'success');
  };

  // Account Manager: Final Sign-off
  const handleFinalSignOff = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'approved', {
      actor: user?.fullName || 'Elena Vance (Account Manager)',
      reviewerName: user?.fullName || 'Account Manager',
      note: 'Final sign-off complete. Content plans unlocked.',
      approvedAt: new Date().toISOString(),
    });
    showToast(t('Final sign-off complete. The content plan is now unlocked!'), 'success');
  };

  return (
    <div className="page-screen s3-page" style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Top Header */}
      <PageHeader
        eyebrow="Orvia / Strategy"
        title={t('Strategy Details')}
        description={t(
          'Manage and review brand strategy documents. Uploaded files serve as the foundation for monthly content planning.',
        )}
        actions={
          <div className="s3-head-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Brand Selector Dropdown */}
            <span className="form-select-wrap">
              <select
                className="form-select"
                value={brandId}
                onChange={(event) => {
                  setBrandId(event.target.value);
                  setSelectedId(null);
                }}
                aria-label={t('Brand')}
                style={{ fontWeight: 700, fontSize: 13, minWidth: 170 }}
              >
                {activeBrands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>

            {/* Quick Role View Mode Switcher */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--box, #F3F4F6)',
                padding: '3px',
                borderRadius: 10,
                border: '1px solid var(--line, #E5E7EB)',
                fontSize: 12,
                fontWeight: 700,
              }}
              title={t('Role View Mode')}
            >
              <button
                type="button"
                onClick={() => setRoleView('employee')}
                style={{
                  padding: '5px 11px',
                  borderRadius: 7,
                  border: 'none',
                  background: roleView === 'employee' ? 'var(--card, #FFFFFF)' : 'transparent',
                  color: roleView === 'employee' ? 'var(--ink, #111111)' : 'var(--muted, #6B7280)',
                  cursor: 'pointer',
                  boxShadow: roleView === 'employee' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('Content Creator')}
              </button>
              <button
                type="button"
                onClick={() => setRoleView('account_manager')}
                style={{
                  padding: '5px 11px',
                  borderRadius: 7,
                  border: 'none',
                  background: roleView === 'account_manager' ? 'var(--card, #FFFFFF)' : 'transparent',
                  color: roleView === 'account_manager' ? 'var(--ink, #111111)' : 'var(--muted, #6B7280)',
                  cursor: 'pointer',
                  boxShadow: roleView === 'account_manager' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('Account Manager')}
              </button>
              <button
                type="button"
                onClick={() => setRoleView('client')}
                style={{
                  padding: '5px 11px',
                  borderRadius: 7,
                  border: 'none',
                  background: roleView === 'client' ? 'var(--card, #FFFFFF)' : 'transparent',
                  color: roleView === 'client' ? 'var(--ink, #111111)' : 'var(--muted, #6B7280)',
                  cursor: 'pointer',
                  boxShadow: roleView === 'client' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('Client')}
              </button>
            </div>

            {/* Upload File / Add Strategy button */}
            <button
              type="button"
              className="button button--primary"
              onClick={handleOpenUpload}
              style={{ fontWeight: 700 }}
            >
              <svg aria-hidden="true" className="icon" style={{ width: 16, height: 16 }}>
                <use href="#i-upload" />
              </svg>
              {t('Upload File')}
            </button>
          </div>
        }
      />

      {/* If No Strategy file exists for this brand */}
      {!strategy ? (
        <EmptyState
          icon="#i-file"
          title={t('No strategy file uploaded yet')}
          text={t(
            'Upload the content strategy file prepared outside the system based on the approved brief.',
          )}
          action={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              {approvedBrief ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 9999,
                    background: 'var(--soft, #F3F4F6)',
                    border: '1px solid var(--line, #E5E7EB)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  <span>{t('Associated Brief')}: <strong>{approvedBrief.brandName} ({t('Brief v1')})</strong></span>
                </div>
              ) : null}
              <button
                type="button"
                className="button button--primary"
                onClick={handleOpenUpload}
                style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700 }}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-upload" />
                </svg>
                {t('Upload Strategy File')}
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* Status Workflow Progress Pipeline */}
          <div
            style={{
              marginBottom: 24,
              padding: '16px 20px',
              background: 'var(--card, #FFFFFF)',
              border: '1px solid var(--line, #E5E7EB)',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted, #6B7280)' }}>
                {t('Strategy Status Flow')}
              </span>
              <StatusPill
                label={t(STRATEGY_FLOW_LABEL[strategy.status] || strategy.status)}
                tone={STRATEGY_FLOW_TONE[strategy.status] || 'is-gray'}
              />
            </div>

            <ol className="s3-flow" style={{ margin: 0, padding: 0 }}>
              {['draft', 'in_review', 'changes_requested', 'client_review', 'client_approved', 'approved'].map(
                (step, index) => {
                  const flowOrder = ['draft', 'in_review', 'client_review', 'client_approved', 'approved'];
                  const currentIndex = flowOrder.indexOf(
                    strategy.status === 'changes_requested' ? 'in_review' : strategy.status,
                  );
                  const isCurrent = strategy.status === step;
                  const isDone = flowOrder.indexOf(step) >= 0 && flowOrder.indexOf(step) <= currentIndex;

                  if (step === 'changes_requested' && strategy.status !== 'changes_requested') {
                    return null; // only show changes_requested step when it actually happened
                  }

                  return (
                    <li
                      key={step}
                      className={`${isDone ? 'is-done' : ''}${isCurrent ? ' is-current' : ''}`}
                      style={
                        step === 'changes_requested'
                          ? { borderColor: '#EF4444', color: '#EF4444' }
                          : undefined
                      }
                    >
                      <span>{step === 'changes_requested' ? '!' : index + 1}</span>
                      <strong>{t(STRATEGY_FLOW_LABEL[step] || step)}</strong>
                    </li>
                  );
                },
              )}
            </ol>
          </div>

          {/* Active Changes Requested Feedback Banner */}
          {strategy.status === 'changes_requested' && (
            <div
              style={{
                marginBottom: 20,
                padding: '16px 20px',
                borderRadius: 16,
                background: '#FEF2F2',
                border: '1.5px solid #F87171',
                color: '#991B1B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: '#DC2626' }}>
                  <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('Changes Requested on Strategy')}
              </div>
              {strategy.reviewerNote ? (
                <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                  <strong>{t('Account Manager Note')}:</strong> {strategy.reviewerNote}{' '}
                  {strategy.reviewerName ? <small style={{ opacity: 0.8 }}>({strategy.reviewerName})</small> : null}
                </p>
              ) : null}
              {strategy.clientReason ? (
                <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                  <strong>{t('Client Reason')}:</strong> {strategy.clientReason}{' '}
                  {strategy.clientName ? <small style={{ opacity: 0.8 }}>({strategy.clientName})</small> : null}
                </p>
              ) : null}
            </div>
          )}

          {/* Approved Banner */}
          {strategy.status === 'approved' && (
            <div
              style={{
                marginBottom: 20,
                padding: '16px 20px',
                borderRadius: 16,
                background: '#ECFDF5',
                border: '1.5px solid #34D399',
                color: '#065F46',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#10B981',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: '#FFFFFF' }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <strong style={{ fontSize: 14 }}>{t('Strategy is Approved & Verified')}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, opacity: 0.85 }}>
                    {t('Content plans and monthly calendars are now fully unlocked for production.')}
                  </p>
                </div>
              </div>
              {onOpenContent && (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => onOpenContent(brand.id)}
                  style={{ fontWeight: 700 }}
                >
                  {t('Open Content Plans')} →
                </button>
              )}
            </div>
          )}

          {/* =========================================================================
              SCREEN 1: Strategy Details (Page 13 Wireframe)
              ========================================================================= */}
          {roleView === 'employee' && (
            <div style={{ marginBottom: 32 }}>
              {/* Page 13 Wireframe Card: Lavender / Purple Card */}
              <div
                style={{
                  background: 'var(--soft, #F5F3FF)',
                  border: '1.5px solid var(--line, #DDD6FE)',
                  borderRadius: 20,
                  padding: '28px 32px',
                  boxShadow: '0 4px 16px rgba(108, 92, 231, 0.05)',
                  marginBottom: 20,
                }}
              >
                {/* Field 1: Brand Name */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Brand Name')}
                  </span>
                  <strong style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                    {brand.name}
                  </strong>
                </div>

                {/* Field 2: Associated Brief */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Associated Brief')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: 'var(--card, #FFFFFF)',
                        border: '1px solid var(--line, #D1D5DB)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--ink, #111111)',
                      }}
                    >
                      {strategy.associatedBrief || 'Brief v1'}
                    </span>
                    {onOpenBriefs && (
                      <button
                        type="button"
                        onClick={onOpenBriefs}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6C5CE7',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {t('View Brief')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Field 3: Strategy File */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Strategy File')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: '#EF4444' }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <strong style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                      {strategy.fileName || 'BeanCo-Strategy.pdf'}
                    </strong>
                    <small style={{ color: 'var(--muted, #6B7280)', fontSize: 12 }}>
                      ({strategy.fileSize || '4.2 MB'})
                    </small>
                  </div>
                </div>

                {/* Field 4: Upload Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Upload Date')}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink, #111111)' }}>
                    {formatDateStr(strategy.uploadDate || strategy.createdAt)}
                  </span>
                </div>

                {/* Field 5: Version */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Version')}
                  </span>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: 'var(--card, #FFFFFF)',
                      border: '1px solid var(--line, #D1D5DB)',
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: 'var(--ink, #111111)',
                    }}
                  >
                    {strategy.version || '1'}
                  </span>
                </div>

                {/* Field 6: Status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0 16px',
                  }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted, #4B5563)' }}>
                    {t('Status')}
                  </span>
                  <StatusPill
                    label={t(STRATEGY_FLOW_LABEL[strategy.status] || strategy.status)}
                    tone={STRATEGY_FLOW_TONE[strategy.status] || 'is-gray'}
                  />
                </div>

                {/* Action Buttons on Page 13 Wireframe Card: View and Download */}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPage(1);
                      setIsPreviewOpen(true);
                    }}
                    style={{
                      background: 'var(--card, #FFFFFF)',
                      color: 'var(--ink, #111111)',
                      border: '1.5px solid var(--ink, #111111)',
                      borderRadius: 12,
                      padding: '10px 24px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t('View')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    style={{
                      background: 'var(--card, #FFFFFF)',
                      color: 'var(--ink, #111111)',
                      border: '1.5px solid var(--ink, #111111)',
                      borderRadius: 12,
                      padding: '10px 24px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t('Download')}
                  </button>
                </div>
              </div>

              {/* Action Bar below the card: Upload New Version, Submit, Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={handleOpenNewVersion}
                    style={{ fontWeight: 700 }}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-upload" />
                    </svg>
                    {t('Upload New Version')}
                  </button>

                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={handleOpenUpload}
                    style={{ fontWeight: 600 }}
                  >
                    {t('Upload Another File')}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {(strategy.status === 'draft' || strategy.status === 'changes_requested') && (
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={handleSubmitForReview}
                      style={{ background: '#2563EB', borderColor: '#2563EB', fontWeight: 700 }}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-send" />
                      </svg>
                      {t('Submit for Review')}
                    </button>
                  )}

                  <button
                    type="button"
                    className="button button--danger-ghost"
                    onClick={() => setIsDeleteOpen(true)}
                    style={{ fontWeight: 600 }}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-trash" />
                    </svg>
                    {t('Delete Strategy')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SCREEN 2: Internal Review (Page 14 Wireframe - Account Manager)
              ========================================================================= */}
          {roleView === 'account_manager' && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
                {/* Left Light Blue Card */}
                <div
                  style={{
                    background: 'var(--review-card-bg, #DBEBFC)',
                    border: '1.5px solid var(--review-card-line, #BFDBFE)',
                    borderRadius: 20,
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A' }}>
                        {t('Strategy File')}
                      </span>
                      <strong style={{ fontSize: 14.5, fontWeight: 800, color: '#1E3A8A' }}>
                        {strategy.fileName || 'BeanCo-Strategy.pdf'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E3A8A' }}>
                        {t('Status')}
                      </span>
                      <span
                        style={{
                          background: '#111111',
                          color: '#FFFFFF',
                          borderRadius: 9999,
                          padding: '4px 14px',
                          fontSize: 11.5,
                          fontWeight: 800,
                        }}
                      >
                        {t(STRATEGY_FLOW_LABEL[strategy.status] || strategy.status)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPage(1);
                        setIsPreviewOpen(true);
                      }}
                      style={{
                        background: '#FFFFFF',
                        color: '#111111',
                        border: '1.5px solid #111111',
                        borderRadius: 12,
                        padding: '9px 20px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('Preview')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        background: '#FFFFFF',
                        color: '#111111',
                        border: '1.5px solid #111111',
                        borderRadius: 12,
                        padding: '9px 20px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('Download')}
                    </button>
                  </div>
                </div>

                {/* Right Comments Card */}
                <div
                  style={{
                    background: 'var(--card, #FFFFFF)',
                    border: '1px solid var(--line, #E5E7EB)',
                    borderRadius: 20,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: 'var(--ink, #111111)',
                    }}
                  >
                    {t('Comments for the Creator')}
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={amComments}
                    onChange={(e) => setAmComments(e.target.value)}
                    placeholder={t('Please add a content calendar outline and specify reel formats.')}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 13,
                      flex: 1,
                      minHeight: 100,
                    }}
                  />
                </div>
              </div>

              {/* Bottom Buttons: Return to Creator & Approve */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAmReturnToCreator}
                  style={{
                    background: 'var(--card, #FFFFFF)',
                    color: 'var(--ink, #111111)',
                    border: '1.5px solid var(--line, #D1D5DB)',
                    borderRadius: 12,
                    padding: '11px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('Return to Creator')}
                </button>
                <button
                  type="button"
                  onClick={handleAmApprove}
                  style={{
                    background: '#111111',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '11px 28px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('Approve')}
                </button>
              </div>

              {/* Account Manager Final Sign-Off when Client Approved */}
              {strategy.status === 'client_approved' && (
                <div
                  style={{
                    marginTop: 24,
                    padding: '20px 24px',
                    borderRadius: 16,
                    background: 'var(--soft, #EEF2FF)',
                    border: '2px solid #6366F1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                      {t('Account Manager Final Sign-off')}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--muted, #4B5563)' }}>
                      {t('The client has approved this strategy. Review the approved document and register the final approval to unlock monthly content planning.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={handleFinalSignOff}
                    style={{ background: '#4F46E5', borderColor: '#4F46E5', fontWeight: 700, padding: '12px 24px' }}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-check" />
                    </svg>
                    {t('Register Final Approval & Unlock Plans')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SCREEN 3: Strategy Approval (Page 15 Wireframe - Client)
              ========================================================================= */}
          {roleView === 'client' && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
                {/* Left Soft Peach Card */}
                <div
                  style={{
                    background: 'var(--approval-card-bg, #FEE2E2)',
                    border: '1.5px solid var(--approval-card-line, #FECACA)',
                    borderRadius: 20,
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#991B1B' }}>
                        {t('Strategy File')}
                      </span>
                      <strong style={{ fontSize: 14.5, fontWeight: 800, color: '#991B1B' }}>
                        {strategy.fileName || 'BeanCo-Strategy.pdf'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#991B1B' }}>
                        {t('Status')}
                      </span>
                      <span
                        style={{
                          background: '#111111',
                          color: '#FFFFFF',
                          borderRadius: 9999,
                          padding: '4px 14px',
                          fontSize: 11.5,
                          fontWeight: 800,
                        }}
                      >
                        {t(STRATEGY_FLOW_LABEL[strategy.status] || strategy.status)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPage(1);
                        setIsPreviewOpen(true);
                      }}
                      style={{
                        background: '#FFFFFF',
                        color: '#111111',
                        border: '1.5px solid #111111',
                        borderRadius: 12,
                        padding: '9px 18px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('View Strategy')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        background: '#FFFFFF',
                        color: '#111111',
                        border: '1.5px solid #111111',
                        borderRadius: 12,
                        padding: '9px 18px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('Download Strategy')}
                    </button>
                  </div>
                </div>

                {/* Right Reason for Changes Card */}
                <div
                  style={{
                    background: 'var(--card, #FFFFFF)',
                    border: '1px solid var(--line, #E5E7EB)',
                    borderRadius: 20,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: 'var(--ink, #111111)',
                    }}
                  >
                    {t('Reason for changes')}{' '}
                    <span style={{ color: '#EF4444', fontWeight: 600 }}>* {t('Required')}</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={clientReason}
                    onChange={(e) => {
                      setClientReason(e.target.value);
                      setClientError('');
                    }}
                    placeholder={t('Please focus more on Instagram Reels and TikTok engagement.')}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 13,
                      flex: 1,
                      minHeight: 100,
                      borderColor: clientError ? '#EF4444' : undefined,
                    }}
                  />
                  {clientError && (
                    <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {clientError}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Buttons: Request Changes & Approve */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleClientRequestChanges}
                  style={{
                    background: 'var(--card, #FFFFFF)',
                    color: 'var(--ink, #111111)',
                    border: '1.5px solid var(--line, #D1D5DB)',
                    borderRadius: 12,
                    padding: '11px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('Request Changes')}
                </button>
                <button
                  type="button"
                  onClick={handleClientApprove}
                  style={{
                    background: '#111111',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '11px 28px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('Approve')}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              Version History & Audit Log (Page 4 of Mostafa's Spec)
              ========================================================================= */}
          <div
            style={{
              background: 'var(--card, #FFFFFF)',
              border: '1px solid var(--line, #E5E7EB)',
              borderRadius: 20,
              padding: '24px 28px',
              marginTop: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                  {t('Version History')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--muted, #6B7280)' }}>
                  {t('Audit log of all uploaded strategy files, revisions, and approval decisions.')}
                </p>
              </div>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={handleOpenNewVersion}
                style={{ fontWeight: 700 }}
              >
                + {t('Upload New Version')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(strategy.history || [
                {
                  version: strategy.version || '1',
                  fileName: strategy.fileName || 'Strategy.pdf',
                  fileSize: strategy.fileSize || '4.2 MB',
                  uploadedBy: strategy.authorName || 'Noah Reed',
                  uploadedAt: formatDateStr(strategy.uploadDate),
                  note: 'Current active revision.',
                },
              ]).map((ver, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'var(--soft, #F9FAFB)',
                    border: '1px solid var(--line, #E5E7EB)',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: '#111111',
                        color: '#FFFFFF',
                        fontSize: 11.5,
                        fontWeight: 800,
                      }}
                    >
                      v{ver.version}
                    </span>
                    <div>
                      <strong style={{ fontSize: 13.5, color: 'var(--ink, #111111)' }}>
                        {ver.fileName}
                      </strong>
                      <div style={{ fontSize: 12, color: 'var(--muted, #6B7280)', marginTop: 2 }}>
                        {ver.uploadedBy} · {ver.uploadedAt} · {ver.fileSize || '3.8 MB'}
                        {ver.note ? ` — "${ver.note}"` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="button button--ghost button--sm"
                      onClick={() => {
                        setPreviewPage(1);
                        setIsPreviewOpen(true);
                      }}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      {t('Preview')}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost button--sm"
                      onClick={handleDownload}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                    >
                      {t('Download')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MODAL 1: Upload File / Add Strategy Modal
          ========================================================================= */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--card, #FFFFFF)',
              borderRadius: 24,
              padding: '28px 32px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--line, #E5E7EB)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                  {t('Upload Strategy File')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted, #6B7280)' }}>
                  {t('Brand')}: <strong>{brand?.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted, #6B7280)' }}
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              style={{
                border: '2px dashed var(--line, #CBD5E1)',
                borderRadius: 16,
                padding: '28px 20px',
                textAlign: 'center',
                background: 'var(--soft, #F8FAFC)',
                marginBottom: 20,
                cursor: 'pointer',
              }}
              onClick={() => {
                const input = document.getElementById('strategy-file-input');
                if (input) input.click();
              }}
            >
              <input
                type="file"
                id="strategy-file-input"
                style={{ display: 'none' }}
                accept=".pdf,.docx,.pptx,.png,.jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    setUploadFileName(file.name);
                  }
                }}
              />
              <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, stroke: '#6C5CE7', margin: '0 auto 8px', display: 'block' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--ink, #111111)' }}>
                {uploadFile ? uploadFile.name : t('Drop strategy file here or click to browse')}
              </strong>
              <small style={{ color: 'var(--muted, #6B7280)', fontSize: 12 }}>
                {uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB` : t('Supports PDF, DOCX, PPTX, PNG up to 50MB')}
              </small>
            </div>

            {/* File Name & Version input */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                  {t('File Name')}
                </label>
                <input
                  className="form-input"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="BeanCo-Strategy.pdf"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                  {t('Version')}
                </label>
                <input
                  className="form-input"
                  value={uploadVersion}
                  onChange={(e) => setUploadVersion(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Associated Brief selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                {t('Associated Brief')}
              </label>
              <input
                className="form-input"
                value={uploadBrief}
                onChange={(e) => setUploadBrief(e.target.value)}
                placeholder="Brief v1"
              />
            </div>

            {/* Dialog Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setIsUploadOpen(false)}
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => handleSaveUpload(false)}
              >
                {t('Save as Draft')}
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => handleSaveUpload(true)}
              >
                {t('Submit for Review')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: Upload New Version Modal
          ========================================================================= */}
      {isNewVersionOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--card, #FFFFFF)',
              borderRadius: 24,
              padding: '28px 32px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--line, #E5E7EB)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                  {t('Upload New Version')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted, #6B7280)' }}>
                  {t('Brand')}: <strong>{brand?.name}</strong> · {t('Current Version')}: <strong>v{strategy?.version || '1'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewVersionOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted, #6B7280)' }}
              >
                ✕
              </button>
            </div>

            {/* Drop Zone */}
            <div
              style={{
                border: '2px dashed var(--line, #CBD5E1)',
                borderRadius: 16,
                padding: '24px 20px',
                textAlign: 'center',
                background: 'var(--soft, #F8FAFC)',
                marginBottom: 20,
                cursor: 'pointer',
              }}
              onClick={() => {
                const input = document.getElementById('strategy-new-ver-input');
                if (input) input.click();
              }}
            >
              <input
                type="file"
                id="strategy-new-ver-input"
                style={{ display: 'none' }}
                accept=".pdf,.docx,.pptx,.png,.jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    setUploadFileName(file.name);
                  }
                }}
              />
              <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, stroke: '#6C5CE7', margin: '0 auto 6px', display: 'block' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <strong style={{ display: 'block', fontSize: 13.5, color: 'var(--ink, #111111)' }}>
                {uploadFile ? uploadFile.name : t('Select new strategy document version')}
              </strong>
              <small style={{ color: 'var(--muted, #6B7280)', fontSize: 11.5 }}>
                {uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB` : t('Supports PDF, DOCX, PPTX')}
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                  {t('New File Name')}
                </label>
                <input
                  className="form-input"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="BeanCo-Strategy-v2.pdf"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                  {t('New Version')}
                </label>
                <input
                  className="form-input"
                  value={uploadVersion}
                  onChange={(e) => setUploadVersion(e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--muted, #6B7280)' }}>
                {t('Revision Notes')}
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder={t('Summary of adjustments made in this new version…')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setIsNewVersionOpen(false)}
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={handleSaveNewVersion}
              >
                {t('Upload New Version')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Interactive Document Preview Modal
          ========================================================================= */}
      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--card, #1E1F29)',
              color: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 900,
              height: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Top Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                background: '#14151E',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#A5B4FC' }}>
                  {strategy?.fileName || 'BeanCo-Strategy.pdf'}
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  v{strategy?.version || '1'}
                </span>
                <StatusPill
                  label={t(STRATEGY_FLOW_LABEL[strategy?.status || 'draft'])}
                  tone={STRATEGY_FLOW_TONE[strategy?.status || 'draft']}
                />
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Page Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <button
                    type="button"
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    disabled={previewPage <= 1}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    ◀
                  </button>
                  <span>{previewPage} / 3</span>
                  <button
                    type="button"
                    onClick={() => setPreviewPage((p) => Math.min(3, p + 1))}
                    disabled={previewPage >= 3}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    ▶
                  </button>
                </div>

                {/* Zoom */}
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => (z === 100 ? 120 : 100))}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {previewZoom}%
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    background: '#6C5CE7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('Download')}
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body Simulation */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px 24px',
                display: 'flex',
                justifyContent: 'center',
                background: '#0D0E15',
              }}
            >
              <div
                style={{
                  width: `${previewZoom}%`,
                  maxWidth: 680,
                  minHeight: 880,
                  background: '#FFFFFF',
                  color: '#111827',
                  borderRadius: 8,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  padding: '50px 60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'width 0.2s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {previewPage === 1 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111827', paddingBottom: 16, marginBottom: 40 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.1em' }}>ORVIA</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>CONFIDENTIAL · AGENCY STRATEGY</span>
                    </div>

                    <span style={{ fontSize: 13, fontWeight: 800, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {brand?.industry || 'Brand Strategy'}
                    </span>
                    <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15, margin: '8px 0 16px', color: '#111827' }}>
                      {strategy?.title || `${brand?.name} Content Strategy`}
                    </h1>
                    <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.6, marginBottom: 32 }}>
                      Comprehensive omni-channel strategic roadmap, audience persona definition, platform role architecture, and monthly production parameters.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 40 }}>
                      <div>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Brand</span>
                        <strong style={{ fontSize: 14, color: '#111827' }}>{brand?.name}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Version & Date</span>
                        <strong style={{ fontSize: 14, color: '#111827' }}>v{strategy?.version || '1'} · {strategy?.uploadDate || '14 Nov 2026'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Author / Lead</span>
                        <strong style={{ fontSize: 14, color: '#111827' }}>{strategy?.authorName || 'Noah Reed'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Associated Brief</span>
                        <strong style={{ fontSize: 14, color: '#111827' }}>{strategy?.associatedBrief || 'Brief v1'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {previewPage === 2 && (
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1.5px solid #E5E7EB', paddingBottom: 10, marginBottom: 20 }}>
                      1. Brand Positioning & Core Truth
                    </h2>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                      {approvedBrief?.sections?.overview ||
                        'Crafted with care, poured for community. Specialty coffee that powers your best work and creates welcoming local spaces.'}
                    </p>

                    <h2 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1.5px solid #E5E7EB', paddingBottom: 10, marginBottom: 20, marginTop: 32 }}>
                      2. Target Audience & Insight
                    </h2>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#374151', marginBottom: 20 }}>
                      {approvedBrief?.sections?.audience ||
                        'Students, young professionals and remote workers aged 18–35 who value specialty brew quality, comfortable work-friendly environments, and genuine community hospitality.'}
                    </p>

                    <h2 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1.5px solid #E5E7EB', paddingBottom: 10, marginBottom: 20, marginTop: 32 }}>
                      3. Tone of Voice & Content Identity
                    </h2>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#374151' }}>
                      {approvedBrief?.sections?.tone ||
                        'Warm, friendly, creative and community-rooted. Welcoming, clear, and focused on quality ingredients.'}
                    </p>
                  </div>
                )}

                {previewPage === 3 && (
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1.5px solid #E5E7EB', paddingBottom: 10, marginBottom: 20 }}>
                      4. Platform Distribution & Cadence
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                      <div style={{ padding: 14, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                        <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Instagram</strong>
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>Reels, carousels, daily morning stories</span>
                      </div>
                      <div style={{ padding: 14, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                        <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>TikTok</strong>
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>Barista crafts, trending audio, morning routine</span>
                      </div>
                      <div style={{ padding: 14, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                        <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Facebook</strong>
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>Community events, local updates, partnerships</span>
                      </div>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 800, borderBottom: '1.5px solid #E5E7EB', paddingBottom: 10, marginBottom: 20, marginTop: 32 }}>
                      5. Review & Approval Sign-Off
                    </h2>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
                      This strategy document serves as the verified benchmark for monthly content calendar creation. Any subsequent revisions require documented internal and client review gates.
                    </p>
                  </div>
                )}

                {/* Footer of simulated document */}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
                  <span>{brand?.name} · {strategy?.fileName || 'Strategy Document'}</span>
                  <span>Page {previewPage} of 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: Delete Confirmation Modal
          ========================================================================= */}
      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--card, #FFFFFF)',
              borderRadius: 24,
              padding: '28px 32px',
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--line, #E5E7EB)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: '#DC2626' }}>
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--ink, #111111)' }}>
                  {t('Delete Strategy File')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--muted, #6B7280)' }}>
                  {strategy?.fileName}
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted, #4B5563)', marginBottom: 24 }}>
              {t('Are you sure you want to delete this strategy file?')} {t('This action cannot be undone and will remove the uploaded document.')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setIsDeleteOpen(false)}
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={handleDeleteStrategy}
                style={{ fontWeight: 700 }}
              >
                {t('Delete Strategy')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
