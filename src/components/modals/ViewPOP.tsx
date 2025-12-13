import Image from "next/image";
import Button from "../buttons/Button";
import { toast } from "@/components/toast/toast";
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFolderOpen } from "react-icons/fa6";

interface Props {
  popUrl: string;
  closeModal: () => void;
}

function ViewPOP(props: Props) {
  const { popUrl, closeModal } = props;
  const [preview, setPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [fileType, setFileType] = useState<"pdf" | "image">("pdf");

  useEffect(() => {
    const determineFileType = () => {
      if (!popUrl) return;

      const urlLower = popUrl.toLowerCase();
      if (urlLower.includes(".pdf") || popUrl.includes("application/pdf")) {
        setFileType("pdf");
        setIsLoading(false);
      } else if (
        urlLower.includes(".jpg") ||
        urlLower.includes(".jpeg") ||
        urlLower.includes(".png") ||
        urlLower.includes(".gif") ||
        urlLower.includes(".webp")
      ) {
        setFileType("image");
        setPreview(popUrl);
        setIsLoading(false);
      } else {
        setFileType("pdf");
      }
    };

    determineFileType();
  }, [popUrl]);

  const handleDownload = () => {
    try {
      window.open(popUrl, "_blank");

      toast({
        title: "Success!",
        description: "POP opened in new tab",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to open POP",
        variant: "error",
      });
    }
  };

  return (
    <div className="gap-6 grid grid-cols-1 p-6 pt-2 w-full max-w-4xl h-full overflow-y-auto">
      <span className="font-semibold text-2xl">Proof of Payment</span>
      {/* Document Display Area */}
      <div className="flex flex-col items-center space-y-4 bg-white p-6 border border-gray-200 rounded-lg min-h-96">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center space-y-3 w-full h-full min-h-96">
            <div className="border-4 border-gray-300 border-t-primary rounded-full w-12 h-12 animate-spin" />
            <span className="text-gray-600 text-sm">Loading document...</span>
          </div>
        ) : fileType === "pdf" && !preview ? (
          <div className="flex flex-col justify-center items-center space-y-3 w-full h-full min-h-96">
            <FaFilePdf className="w-24 h-24 text-red-500" />
            <span className="text-gray-600 text-center">
              PDF Document
              <br />
              <span className="text-sm">
                (Click open POP to view the full document)
              </span>
            </span>
          </div>
        ) : preview ? (
          <div className="relative flex justify-center items-center w-full h-full">
            <Image
              src={preview}
              alt="POP Preview"
              width={800}
              height={1000}
              className="rounded-lg max-w-full h-auto max-h-[600px] object-contain"
              priority
            />
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center space-x-3">
        <Button
          onClick={closeModal}
          className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-6 rounded-lg h-10 text-black"
        >
          <span>Close</span>
        </Button>
        <Button
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 px-6 rounded-lg h-10 text-white"
        >
          <FaFolderOpen className="w-4 h-4" />
          <span>Open POP</span>
        </Button>
      </div>
    </div>
  );
}

export default ViewPOP;
