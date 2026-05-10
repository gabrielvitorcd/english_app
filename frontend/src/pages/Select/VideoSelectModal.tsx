import { useState, useRef } from "react";
import styles from "./VideoSelectModal.module.css";

export interface VideoSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (videoFile: File, subtitleFile?: File) => void;
}

export function VideoSelectModal({
  isOpen,
  onClose,
  onSelect,
}: VideoSelectModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("video/") || file.name.match(/\.(mp4|mkv)$/i)) {
        setSelectedVideo(file);
      } else if (file.name.match(/\.srt$/i)) {
        setSelectedSubtitle(file);
      }
    }
  };

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleSubtitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedSubtitle(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedVideo) {
      onSelect(selectedVideo, selectedSubtitle || undefined);
      resetSelection();
      onClose();
    }
  };

  const resetSelection = () => {
    setSelectedVideo(null);
    setSelectedSubtitle(null);
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeSubtitle = () => {
    setSelectedSubtitle(null);
    if (subtitleInputRef.current) {
      subtitleInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Selecionar Vídeo</h2>
          <p className={styles.subtitle}>
            Envie seu vídeo para começar a estudar
          </p>
        </div>

        <div
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""} ${selectedVideo ? styles.hasVideo : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => videoInputRef.current?.click()}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept=".mp4,.mkv,video/*"
            onChange={handleVideoInput}
            className={styles.hiddenInput}
          />

          {selectedVideo ? (
            <div className={styles.fileSelected}>
              <div className={styles.fileIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{selectedVideo.name}</span>
                <span className={styles.fileSize}>
                  {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button
                className={styles.removeFile}
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo();
                }}
                aria-label="Remover vídeo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={styles.dropzoneContent}>
              <div className={styles.dropzoneIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className={styles.dropzoneText}>
                <span className={styles.highlight}>Clique para enviar</span> ou arraste e solte
              </p>
              <p className={styles.dropzoneSub}>
                MP4 ou MKV (máx. 2GB)
              </p>
            </div>
          )}
        </div>

        <div className={styles.subtitleSection}>
          <div className={styles.subtitleHeader}>
            <span className={styles.subtitleLabel}>Legenda (opcional)</span>
            {selectedSubtitle && (
              <button className={styles.removeSubtitle} onClick={removeSubtitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>{selectedSubtitle.name}</span>
              </button>
            )}
          </div>
          <div
            className={`${styles.subtitleDropzone} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => subtitleInputRef.current?.click()}
          >
            <input
              ref={subtitleInputRef}
              type="file"
              accept=".srt"
              onChange={handleSubtitleInput}
              className={styles.hiddenInput}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 7h8M8 12h8M8 17h5" />
            </svg>
            <span className={styles.subtitleText}>
              {selectedSubtitle ? "Legenda carregada" : "Arraste um arquivo .srt ou clique para selecionar"}
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`${styles.submitButton} ${!selectedVideo ? styles.disabled : ""}`}
            onClick={handleSubmit}
            disabled={!selectedVideo}
          >
            Enviar Vídeo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
