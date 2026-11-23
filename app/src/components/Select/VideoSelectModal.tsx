import { useState, useRef } from "react";
import { ArrowRight, FilePlay, FileText, Upload, X } from "lucide-react";
import { Button, IconButton } from "../ui";
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
      <div className={`dialog ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
        <IconButton className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
          <X aria-hidden="true" />
        </IconButton>

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
                <FilePlay aria-hidden="true" />
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{selectedVideo.name}</span>
                <span className={`num ${styles.fileSize}`}>
                  {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <IconButton
                className={styles.removeFile}
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo();
                }}
                aria-label="Remover vídeo"
              >
                <X aria-hidden="true" />
              </IconButton>
            </div>
          ) : (
            <div className={styles.dropzoneContent}>
              <div className={styles.dropzoneIcon}>
                <Upload aria-hidden="true" />
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
                <X aria-hidden="true" />
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
            <FileText aria-hidden="true" />
            <span className={styles.subtitleText}>
              {selectedSubtitle ? "Legenda carregada" : "Arraste um arquivo .srt ou clique para selecionar"}
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="accent"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!selectedVideo}
          >
            Enviar Vídeo
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
