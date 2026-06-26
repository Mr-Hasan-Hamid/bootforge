"use client";

import { useRef } from "react";
import { useZipFileLoader } from "../hooks/useZipFileLoader";
import { useZipPreview } from "../hooks/useZipPreview";
import { ZipSidebarPanel } from "./ZipSidebarPanel";
import { ZipEditorConfigPanel } from "./ZipEditorConfigPanel";
import { exportStandardZip, exportMagiskModuleZip } from "../utils/compiler";

export function ZipEditorTab() {
  const zipCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<(() => void) | null>(null);

  // File loading hook
  const {
    loading,
    setLoading,
    loadedZip,
    setLoadedZip,
    zipName,
    width,
    setWidth,
    height,
    setHeight,
    fps,
    setFps,
    parts,
    setParts,
    fileCount,
    folders,
    lintErrors,
    lintWarnings,
    isMagiskModule,
    nestedZipPath,
    parentZip,
    handleFileUpload,
    handleLoadFromLibrary,
  } = useZipFileLoader(() => {
    previewRef.current?.();
  });

  // Synced preview hook
  const preview = useZipPreview(loadedZip, parts, fps, width, height, zipCanvasRef);

  // Save the callback into the ref so the loader can trigger it dynamically
  previewRef.current = preview.cleanupZipPreview;

  const addPartConfig = () => {
    const firstFolder = folders[0] || "part0";
    setParts((prev) => [...prev, { type: "p", loopCount: 0, pause: 0, folder: firstFolder }]);
  };

  const removePartConfig = (index: number) => {
    setParts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const exportBootanimation = async () => {
    if (!loadedZip) {
      alert("Please load an animation ZIP first.");
      return;
    }
    setLoading(true);
    try {
      await exportStandardZip(
        width,
        height,
        fps,
        parts,
        loadedZip,
        isMagiskModule,
        parentZip,
        nestedZipPath,
        zipName
      );
    } catch (e) {
      console.error(e);
      alert("Error compiling ZIP file.");
    } finally {
      setLoading(false);
    }
  };

  const exportAsMagiskModule = async () => {
    if (!loadedZip) {
      alert("Please load an animation ZIP first.");
      return;
    }
    setLoading(true);
    try {
      await exportMagiskModuleZip(width, height, fps, parts, loadedZip, zipName);
    } catch (e) {
      console.error(e);
      alert("Error compiling Magisk module.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
        <ZipSidebarPanel
          loadedZip={loadedZip}
          zipName={zipName}
          fileCount={fileCount}
          folders={folders}
          isMagiskModule={isMagiskModule}
          nestedZipPath={nestedZipPath}
          handleFileUpload={handleFileUpload}
          handleLoadFromLibrary={handleLoadFromLibrary}
          zipPreviewActive={preview.zipPreviewActive}
          zipPreviewLoading={preview.zipPreviewLoading}
          zipPreviewPlaying={preview.zipPreviewPlaying}
          zipPreviewCurrentFrame={preview.zipPreviewCurrentFrame}
          zipPreviewTotalFrames={preview.zipPreviewTotalFrames}
          prepareZipPreview={preview.prepareZipPreview}
          toggleZipPreviewPlayback={preview.toggleZipPreviewPlayback}
          zipCanvasRef={zipCanvasRef}
          width={width}
          height={height}
        />

        <ZipEditorConfigPanel
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
          fps={fps}
          setFps={setFps}
          parts={parts}
          setParts={setParts}
          folders={folders}
          lintErrors={lintErrors}
          lintWarnings={lintWarnings}
          addPartConfig={addPartConfig}
          removePartConfig={removePartConfig}
          onCloseWorkspace={() => {
            setLoadedZip(null);
            setParts([]);
            preview.cleanupZipPreview();
          }}
          onExport={exportBootanimation}
          onExportMagisk={exportAsMagiskModule}
        />
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-neutral-400 font-semibold animate-pulse">
              Compiling files...
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default ZipEditorTab;
