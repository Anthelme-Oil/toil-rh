
import {
  File,
  FileChartColumn,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from 'lucide-react';

import type { DocumentFormat } from '@/types';

interface MediaFileIconProps {
  format: DocumentFormat;
  size?: number;
  className?: string;
}

export default function MediaFileIcon({
  format,
  size = 20,
  className = '',
}: MediaFileIconProps) {
  switch (format) {
    case 'PDF':
    case 'DOC':
    case 'DOCX':
    case 'TXT':
      return (
        <FileText
          size={size}
          className={className}
        />
      );

    case 'XLS':
    case 'XLSX':
    case 'CSV':
      return (
        <FileSpreadsheet
          size={size}
          className={className}
        />
      );

    case 'PPT':
    case 'PPTX':
      return (
        <Presentation
          size={size}
          className={className}
        />
      );

    case 'IMAGE':
      return (
        <FileImage
          size={size}
          className={className}
        />
      );

    case 'VIDEO':
      return (
        <FileVideo
          size={size}
          className={className}
        />
      );

    case 'OTHER':
    default:
      return (
        <File
          size={size}
          className={className}
        />
      );
  }
}
