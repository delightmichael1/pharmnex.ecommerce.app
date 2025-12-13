import cn from "@/utils/cn";
import Image from "next/image";
import React, { useState } from "react";
import { IoTrash } from "react-icons/io5";

type Props = {
  icon: any;
  label?: string;
  fileType: string | string[];
  file: File | null;
  className?: string;
  classNames?: {
    container?: string;
    input?: string;
    button?: string;
  };
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  maxSize?: number;
  onError?: (error: string) => void;
};

// File type configurations
const FILE_TYPE_CONFIG: Record<
  string,
  {
    accept: string;
    mimeTypes: string[];
    extensions: string[];
  }
> = {
  image: {
    accept: "image/*",
    mimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  },
  video: {
    accept: "video/*",
    mimeTypes: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ],
    extensions: [".mp4", ".mpeg", ".mov", ".avi", ".webm"],
  },
  audio: {
    accept: "audio/*",
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
    extensions: [".mp3", ".wav", ".ogg", ".webm"],
  },
  document: {
    accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx",
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    extensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ],
  },
  pdf: {
    accept: ".pdf",
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
  },
  csv: {
    accept: ".csv",
    mimeTypes: ["text/csv", "application/vnd.ms-excel"],
    extensions: [".csv"],
  },
};

const DropZone: React.FC<Props> = (props) => {
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get combined accept attribute and validation arrays
  const getFileTypeConfig = () => {
    const types = Array.isArray(props.fileType)
      ? props.fileType
      : [props.fileType];

    const acceptStrings: string[] = [];
    const mimeTypes: string[] = [];
    const extensions: string[] = [];

    types.forEach((type) => {
      const config = FILE_TYPE_CONFIG[type.toLowerCase()];
      if (config) {
        acceptStrings.push(config.accept);
        mimeTypes.push(...config.mimeTypes);
        extensions.push(...config.extensions);
      }
    });

    return {
      accept: acceptStrings.join(","),
      mimeTypes: [...new Set(mimeTypes)], // Remove duplicates
      extensions: [...new Set(extensions)],
    };
  };

  const { accept, mimeTypes, extensions } = getFileTypeConfig();

  // Validate file type
  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileMimeType = file.type.toLowerCase();

    // Check MIME type
    const mimeTypeValid = mimeTypes.some((mime) =>
      fileMimeType.includes(mime.toLowerCase())
    );

    // Check extension
    const extensionValid = extensions.some((ext) =>
      fileName.endsWith(ext.toLowerCase())
    );

    return mimeTypeValid || extensionValid;
  };

  // Validate file size
  const validateFileSize = (file: File): boolean => {
    if (!props.maxSize) return true;
    const maxSizeBytes = props.maxSize * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeBytes;
  };

  // Handle file validation and setting
  const handleFileValidation = (file: File) => {
    setError(null);

    // Validate file type
    if (!validateFileType(file)) {
      const errorMsg = `Invalid file type. Please select ${
        Array.isArray(props.fileType)
          ? props.fileType.join(" or ")
          : props.fileType
      } files.`;
      setError(errorMsg);
      props.onError?.(errorMsg);
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      const errorMsg = `File size exceeds ${props.maxSize}MB limit.`;
      setError(errorMsg);
      props.onError?.(errorMsg);
      return;
    }

    // File is valid
    props.setFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDrag(false);
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileValidation(droppedFiles[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileValidation(selectedFiles[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDrag(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDrag(false);
  };

  // Get file type display name
  const getFileTypeDisplay = () => {
    if (Array.isArray(props.fileType)) {
      return props.fileType.join(", ");
    }
    return props.fileType;
  };

  // Check if file is an image
  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  // Get file icon or preview
  const renderFilePreview = () => {
    if (!props.file) return null;

    if (isImageFile(props.file)) {
      return (
        <Image
          src={URL.createObjectURL(props.file)}
          alt={props.file.name}
          width={200}
          height={200}
          className="rounded max-w-full max-h-48 object-contain"
        />
      );
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl">{props.icon}</div>
        <p className="px-4 font-medium text-sm text-center break-all">
          {props.file.name}
        </p>
        <p className="text-gray-500 text-xs">
          {(props.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    );
  };

  return (
    <div className={cn("w-full", props.className)}>
      {props.label && (
        <label className="block mb-2 font-medium text-sm">{props.label}</label>
      )}
      <div
        className={cn(
          "relative hover:bg-blue-50 p-6 border-2 hover:border-blue-500 border-dashed rounded-lg transition-colors",
          isDrag ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
          error && "border-red-500 bg-red-50",
          props.classNames?.container
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {props.file ? (
          <div className="flex flex-col justify-center items-center gap-4 aspect-video">
            <button
              type="button"
              onClick={() => {
                props.setFile(null);
                setError(null);
              }}
              className={cn(
                "top-2 right-2 absolute bg-red-500 hover:bg-red-600 p-2 rounded-full text-white transition-colors cursor-pointer",
                props.classNames?.button
              )}
              aria-label="Remove file"
            >
              <IoTrash size={20} />
            </button>
            {renderFilePreview()}
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="flex flex-col justify-center items-center gap-4 w-full aspect-video text-center cursor-pointer"
          >
            <props.icon className="text-gray-400 text-5xl" />
            <div>
              <p className="mb-2 text-gray-600 text-sm">
                {isDrag
                  ? `Drop your ${getFileTypeDisplay()} here`
                  : `Drag and drop your ${getFileTypeDisplay()} here or select file`}
              </p>
              {props.maxSize && (
                <p className="text-gray-500 text-xs">
                  Maximum file size: {props.maxSize}MB
                </p>
              )}
              <p className="mt-1 text-gray-500 text-xs">
                Accepted formats: {extensions.join(", ")}
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default DropZone;
