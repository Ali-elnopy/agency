import React, { useMemo, useRef, useState } from 'react';
import { useBrands } from '../../context/brandsStore';
import useAuth from '../../hooks/useAuth';
import { ASSET_CATEGORIES, ASSET_CATEGORY_LABEL } from '../../data/brandWorkspace';
import { formatBytes, getFileBlob, removeFileBlob, saveFileBlob } from '../../services/fileStore';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function kindOf(mime = '', name = '') {
  if (mime.startsWith('image/')) return { label: 'Image', icon: '#i-camera' };
  if (mime.startsWith('video/')) return { label: 'Video', icon: '#i-camera' };
  if (mime.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
    return { label: 'PDF', icon: '#i-file' };
  }
  return { label: 'File', icon: '#i-file' };
}

export default function FilesAssetsSection({ brand, onToast }) {
  const { user } = useAuth();
  const { getAssets, addAsset, deleteAsset } = useBrands();
  const inputRef = useRef(null);
  const [category, setCategory] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('logo');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const assets = useMemo(() => {
    const items = getAssets(brand.id).slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return category === 'all' ? items : items.filter((item) => item.category === category);
  }, [getAssets, brand.id, category]);

  const counts = useMemo(() => {
    const base = { all: getAssets(brand.id).length };

    for (const item of ASSET_CATEGORIES) {
      base[item.id] = getAssets(brand.id).filter((asset) => asset.category === item.id).length;
    }

    return base;
  }, [getAssets, brand.id]);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    setBusy(true);
    setError('');

    try {
      for (const file of files) {
        const storageId = `asset-${brand.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        await saveFileBlob(storageId, file);
        addAsset(brand.id, {
          name: file.name,
          size: file.size,
          mime: file.type,
          storageId,
          category: uploadCategory,
          uploadedBy: user?.fullName ?? '',
        });
      }

      onToast?.(files.length === 1 ? 'Asset uploaded.' : `${files.length} assets uploaded.`);
    } catch {
      setError('Could not store these files. Try smaller files or another format.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async (asset, download = false) => {
    const blob = await getFileBlob(asset.storageId);

    if (!blob) {
      setError('This file is no longer available in this browser. Upload it again.');
      return;
    }

    const url = URL.createObjectURL(blob);

    if (download) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = asset.name;
      anchor.click();
    } else {
      window.open(url, '_blank', 'noopener');
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleDelete = async (asset) => {
    await removeFileBlob(asset.storageId);
    deleteAsset(asset.id);
    onToast?.('Asset deleted.');
  };

  return (
    <div className="bw-section">
      <header className="bw-head">
        <div>
          <h2 className="bw-title">Files &amp; Assets</h2>
          <p className="bw-sub">
            The central library for this brand: logo, visual identity, videos, designs and more.
          </p>
        </div>

        <div className="bw-upload">
          <span className="form-select-wrap bw-upload__category">
            <select
              className="form-select"
              value={uploadCategory}
              onChange={(event) => setUploadCategory(event.target.value)}
              aria-label="Asset category"
            >
              {ASSET_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-upload" />
            </svg>
            {busy ? 'Uploading…' : 'Upload files'}
          </button>
          <input ref={inputRef} type="file" multiple hidden onChange={handleFiles} />
        </div>
      </header>

      {error ? <div className="modal-error bw-error">{error}</div> : null}

      <div className="bw-tabs is-assets">
        <button
          type="button"
          className={`bw-tab${category === 'all' ? ' is-active' : ''}`}
          onClick={() => setCategory('all')}
        >
          All files <em>{counts.all}</em>
        </button>
        {ASSET_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bw-tab${category === item.id ? ' is-active' : ''}`}
            onClick={() => setCategory(item.id)}
          >
            {item.label} <em>{counts[item.id]}</em>
          </button>
        ))}
      </div>

      {assets.length ? (
        <div className="bw-asset-grid">
          {assets.map((asset) => {
            const kind = kindOf(asset.mime, asset.name);

            return (
              <article className="bw-asset" key={asset.id}>
                <span className="bw-asset__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href={kind.icon} />
                  </svg>
                  <em>{kind.label}</em>
                </span>
                <div className="bw-asset__body">
                  <strong title={asset.name}>{asset.name}</strong>
                  <small>
                    {ASSET_CATEGORY_LABEL[asset.category] ?? 'File'} · {formatBytes(asset.size)} ·{' '}
                    {formatDate(asset.uploadedAt)}
                  </small>
                  {asset.uploadedBy ? <small>Uploaded by {asset.uploadedBy}</small> : null}
                </div>
                <div className="bw-asset__actions">
                  <button
                    type="button"
                    className="bw-icon-btn"
                    title="Open"
                    aria-label={`Open ${asset.name}`}
                    onClick={() => handleOpen(asset)}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-eye" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="bw-icon-btn"
                    title="Download"
                    aria-label={`Download ${asset.name}`}
                    onClick={() => handleOpen(asset, true)}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-download" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="bw-icon-btn is-danger"
                    title="Delete"
                    aria-label={`Delete ${asset.name}`}
                    onClick={() => handleDelete(asset)}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-trash" />
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bw-empty bw-empty--panel">
          <strong>No files in this section yet.</strong>
          <p>Upload the brand logo, identity, videos or the latest designs.</p>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => inputRef.current?.click()}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-upload" />
            </svg>
            Upload the first file
          </button>
        </div>
      )}
    </div>
  );
}
