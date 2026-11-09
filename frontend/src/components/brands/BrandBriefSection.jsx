import React, { useEffect, useRef, useState } from 'react';
import { useBrands } from '../../context/brandsStore';
import useAuth from '../../hooks/useAuth';
import { BRIEF_FIELDS } from '../../data/brandWorkspace';
import { formatBytes, getFileBlob, removeFileBlob, saveFileBlob } from '../../services/fileStore';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fileKind(mime = '', name = '') {
  if (mime.includes('pdf') || name.toLowerCase().endsWith('.pdf')) return 'PDF';
  if (mime.startsWith('image/')) return 'Image';
  if (mime.startsWith('video/')) return 'Video';
  if (mime.includes('word') || name.toLowerCase().endsWith('.docx')) return 'Doc';
  if (mime.includes('sheet') || name.toLowerCase().endsWith('.xlsx')) return 'Sheet';
  return 'File';
}

export default function BrandBriefSection({ brand, onToast }) {
  const { user } = useAuth();
  const { getBriefs, addBrief, deleteBrief, getBriefInfo, saveBriefInfo } = useBrands();
  const inputRef = useRef(null);

  const [form, setForm] = useState(() => getBriefInfo(brand.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(getBriefInfo(brand.id));
  }, [brand.id, getBriefInfo]);

  const briefs = getBriefs(brand.id).slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const latestId = briefs[0]?.id ?? null;

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    setBusy(true);
    setError('');

    try {
      for (const file of files) {
        const storageId = `brief-${brand.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;

        await saveFileBlob(storageId, file);
        addBrief(brand.id, {
          name: file.name,
          size: file.size,
          mime: file.type,
          kind: fileKind(file.type, file.name),
          storageId,
          uploadedBy: user?.fullName ?? '',
        });
      }

      onToast?.(files.length === 1 ? 'Brief file uploaded.' : `${files.length} brief files uploaded.`);
    } catch {
      setError('Could not store this file. Try a smaller file or another format.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (brief) => {
    await removeFileBlob(brief.storageId);
    deleteBrief(brief.id);
    onToast?.('Brief file removed.');
  };

  const handleOpen = async (brief, download = false) => {
    const blob = await getFileBlob(brief.storageId);

    if (!blob) {
      setError('This file is no longer available in this browser. Upload it again.');
      return;
    }

    const url = URL.createObjectURL(blob);

    if (download) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = brief.name;
      anchor.click();
    } else {
      window.open(url, '_blank', 'noopener');
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveBriefInfo(brand.id, form);
    onToast?.('Brand brief saved.');
  };

  const setField = (id, value) => setForm((prev) => ({ ...prev, [id]: value }));

  return (
    <div className="bw-section">
      <header className="bw-head">
        <div>
          <h2 className="bw-title">Brand Brief</h2>
          <p className="bw-sub">
            The questions collected for this brand and their answers, plus every brief file version.
          </p>
        </div>
        <button
          type="button"
          className="button button--primary button--sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <svg aria-hidden="true" className="icon">
            <use href="#i-upload" />
          </svg>
          {busy ? 'Uploading…' : 'Upload brief file'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={handleFiles}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,image/*"
        />
      </header>

      {error ? <div className="modal-error bw-error">{error}</div> : null}

      <div className="bw-grid-2">
        <section className="bw-card">
          <header className="bw-card__head">
            <div>
              <h3>Brief answers</h3>
              <p>Answers to the questions collected with the client.</p>
            </div>
          </header>

          <form className="bw-form" onSubmit={handleSave}>
            {BRIEF_FIELDS.map((field) => (
              <div className="bw-field" key={field.id}>
                <label htmlFor={`brief-${field.id}`}>{field.label}</label>
                <textarea
                  id={`brief-${field.id}`}
                  className="form-textarea"
                  rows={field.id === 'overview' || field.id === 'audience' ? 3 : 2}
                  placeholder={field.placeholder}
                  value={form[field.id] ?? ''}
                  onChange={(event) => setField(field.id, event.target.value)}
                />
                <span className="bw-hint">{field.hint}</span>
              </div>
            ))}

            <div className="bw-actions">
              <button type="submit" className="button button--primary button--sm">
                Save brief answers
              </button>
            </div>
          </form>
        </section>

        <section className="bw-card">
          <header className="bw-card__head">
            <div>
              <h3>Brief files</h3>
              <p>Newest first — the latest version is marked.</p>
            </div>
            <span className="pill is-gray">{briefs.length} files</span>
          </header>

          {briefs.length ? (
            <ul className="bw-filelist">
              {briefs.map((brief) => (
                <li className="bw-file" key={brief.id}>
                  <span className="bw-file__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-file" />
                    </svg>
                  </span>
                  <span className="bw-file__body">
                    <span className="bw-file__name">
                      {brief.name}
                      {brief.id === latestId ? <em className="bw-badge is-green">Latest</em> : null}
                    </span>
                    <small>
                      {brief.kind} · {formatBytes(brief.size)} · {formatDateTime(brief.uploadedAt)}
                      {brief.uploadedBy ? ` · ${brief.uploadedBy}` : ''}
                    </small>
                  </span>
                  <span className="bw-file__actions">
                    <button
                      type="button"
                      className="bw-icon-btn"
                      title="Open file"
                      aria-label={`Open ${brief.name}`}
                      onClick={() => handleOpen(brief)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-eye" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bw-icon-btn"
                      title="Download file"
                      aria-label={`Download ${brief.name}`}
                      onClick={() => handleOpen(brief, true)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-download" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bw-icon-btn is-danger"
                      title="Delete file"
                      aria-label={`Delete ${brief.name}`}
                      onClick={() => handleDelete(brief)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-trash" />
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bw-empty">
              <strong>No brief files yet.</strong>
              <p>Upload the client brief to keep every version in one place.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
