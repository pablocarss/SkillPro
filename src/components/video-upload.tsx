"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Video } from "lucide-react";

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideoUrl?: string;
}

export function VideoUpload({ onVideoUploaded, currentVideoUrl }: VideoUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos de vídeo são permitidos (MP4, WebM, OGG, MOV).",
      });
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 500MB.",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: "Vídeo enviado com sucesso!",
            description: "O vídeo foi enviado para o servidor.",
          });
          onVideoUploaded(response.url);
          setSelectedFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          throw new Error("Upload failed");
        }
        setIsUploading(false);
      });

      xhr.addEventListener("error", () => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar vídeo",
          description: "Ocorreu um erro ao enviar o vídeo. Tente novamente.",
        });
        setIsUploading(false);
      });

      xhr.open("POST", "/api/upload/video");
      xhr.send(formData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar vídeo",
        description: "Ocorreu um erro ao enviar o vídeo. Tente novamente.",
      });
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload de Vídeo</Label>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="flex-1"
          />
          {selectedFile && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRemoveFile}
              title="Remover arquivo"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <p className="text-sm text-gray-600">
            Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {selectedFile && !isUploading && (
        <Button type="button" onClick={handleUpload} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Enviar Vídeo
        </Button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Enviando...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {currentVideoUrl && (
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Vídeo atual disponível</span>
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">{currentVideoUrl}</p>
        </div>
      )}
    </div>
  );
}
